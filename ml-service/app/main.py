import json
import os
import pickle
import re
from pathlib import Path
from typing import List, Dict, Any

import h5py
import keras
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences

BASE = Path(__file__).resolve().parents[2]
MODEL_PATH = Path(os.getenv("MODEL_PATH", BASE / "model" / "toxic_comment_model.h5"))
TOKENIZER_PATH = Path(os.getenv("TOKENIZER_PATH", BASE / "model" / "tokenizer.pkl"))
MAX_LEN = int(os.getenv("MAX_LEN", "200"))
MAX_WORDS = int(os.getenv("MAX_WORDS", "60000"))
LABELS = ["toxic", "severe_toxic", "obscene", "threat", "insult", "identity_hate"]

app = FastAPI(title="Voxora ML API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

model = None
tokenizer = None
load_error = None


def load_compatible_model():
    try:
        return load_model(MODEL_PATH, compile=False)
    except TypeError as exc:
        if (
            MODEL_PATH.suffix.lower() not in {".h5", ".hdf5"}
            or "quantization_config" not in str(exc)
        ):
            raise

    with h5py.File(MODEL_PATH, "r") as f:
        config = json.loads(f.attrs["model_config"])

    def strip_empty_quantization_config(value):
        if isinstance(value, dict):
            if value.get("quantization_config") is None:
                value.pop("quantization_config", None)
            for child in value.values():
                strip_empty_quantization_config(child)
        elif isinstance(value, list):
            for child in value:
                strip_empty_quantization_config(child)

    strip_empty_quantization_config(config)
    model = keras.models.model_from_json(
        json.dumps(config),
        custom_objects={"Functional": keras.Model},
    )
    model.load_weights(MODEL_PATH)
    return model


def clean_text(text: str) -> str:
    text = str(text).lower()
    text = re.sub(r"http\S+|www\S+", " ", text)
    text = re.sub(r"\[.*?\]", " ", text)
    text = re.sub(r"[^a-z0-9\s!?.,']", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def load_artifacts():
    global model, tokenizer, load_error
    try:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model not found: {MODEL_PATH}")
        if not TOKENIZER_PATH.exists():
            raise FileNotFoundError(f"Tokenizer not found: {TOKENIZER_PATH}")
        model = load_compatible_model()
        with TOKENIZER_PATH.open("rb") as f:
            tokenizer = pickle.load(f)
        load_error = None
    except Exception as exc:
        model = None
        tokenizer = None
        load_error = str(exc)


@app.on_event("startup")
def startup():
    load_artifacts()


class PredictionRequest(BaseModel):
    text: str = Field(min_length=1, max_length=10000)
    threshold: float = Field(default=0.5, ge=0.05, le=0.95)


class BatchRequest(BaseModel):
    texts: List[str] = Field(min_length=1, max_length=500)
    threshold: float = Field(default=0.5, ge=0.05, le=0.95)


def ensure_ready():
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail={"message": "ML artifacts are not loaded", "error": load_error})


def predict_many(texts: List[str], threshold: float) -> List[Dict[str, Any]]:
    ensure_ready()
    cleaned = [clean_text(t) for t in texts]
    seqs = tokenizer.texts_to_sequences(cleaned)
    pads = pad_sequences(seqs, maxlen=MAX_LEN, padding="post", truncating="post")
    preds = model.predict(pads, verbose=0)
    results = []
    for original, clean, row in zip(texts, cleaned, preds):
        probs = {label: float(np.clip(row[i], 0, 1)) for i, label in enumerate(LABELS)}
        active = [label for label, score in probs.items() if score >= threshold]
        max_score = max(probs.values()) if probs else 0.0
        risk = "high" if max_score >= 0.75 else "moderate" if max_score >= threshold else "low"
        results.append({
            "text": original,
            "cleanedText": clean,
            "probabilities": probs,
            "labels": active,
            "isToxic": bool(active),
            "riskLevel": risk,
            "maxScore": max_score,
            "threshold": threshold,
        })
    return results


@app.get("/health")
def health():
    return {"status": "ok" if model is not None else "degraded", "modelLoaded": model is not None, "tokenizerLoaded": tokenizer is not None, "error": load_error}


@app.get("/model-info")
def model_info():
    ensure_ready()
    return {
        "name": "Voxora BiLSTM Multi-Label Classifier",
        "framework": "Keras / TensorFlow",
        "inputShape": list(model.input_shape),
        "outputShape": list(model.output_shape),
        "vocabularySize": MAX_WORDS,
        "sequenceLength": MAX_LEN,
        "labels": LABELS,
        "preprocessing": "lowercase → URL removal → bracket removal → allowed characters → whitespace normalization → tokenizer → post padding/truncation",
        "architecture": "Embedding(60000,128) → BiLSTM(64) → BiLSTM(64) → GlobalAveragePooling + GlobalMaxPooling → Dense(128) → Dropout(0.4) → Dense(64) → Dropout(0.3) → Dense(6,sigmoid)",
        "modelPath": str(MODEL_PATH.name),
    }


@app.post("/predict")
def predict(request: PredictionRequest):
    return predict_many([request.text], request.threshold)[0]


@app.post("/predict-batch")
def predict_batch(request: BatchRequest):
    return {"count": len(request.texts), "results": predict_many(request.texts, request.threshold)}
