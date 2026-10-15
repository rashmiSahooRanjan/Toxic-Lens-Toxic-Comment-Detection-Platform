import Prediction from "../models/Prediction.js";
import { predict } from "../utils/ml.js";
export async function createPrediction(req, res) {
  const { text, threshold = 0.5 } = req.body;
  if (!text?.trim())
    return res.status(400).json({ message: "Comment text is required" });
  const result = await predict(text, Number(threshold));
  const p = await Prediction.create({
    ...result,
    user: req.user._id,
    threshold: Number(threshold),
    probabilities: result.probabilities,
    source: "single",
  });
  res.status(201).json({ id: p._id, ...result });
}
export async function history(req, res) {
  const rows = await Prediction.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100);
  res.json(rows);
}
