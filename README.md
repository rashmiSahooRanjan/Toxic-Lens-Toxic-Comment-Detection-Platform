# 🛡️ ToxicLens — AI-Powered Multi-Label Toxic Comment Detection & Moderation Platform

[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![ML-Service](https://img.shields.io/badge/ML--Service-FastAPI%20%7C%20Python-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Deep Learning](https://img.shields.io/badge/Model-TensorFlow%20%7C%20Keras%20BiLSTM-FF6F00?logo=tensorflow&logoColor=white)](https://tensorflow.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Deploy](https://img.shields.io/badge/Deploy-Render%20Ready-46E3B7?logo=render&logoColor=black)](https://render.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**ToxicLens** is a full-stack, enterprise-grade AI moderation and toxicity analysis platform. Powered by a deep Bidirectional LSTM (BiLSTM) neural network trained on over 150,000 multi-label comments, ToxicLens detects and scores toxic speech across six distinct categories in real-time. Built with a decoupled microservice architecture featuring React, Node.js/Express, FastAPI, and MongoDB.

✨ Deployment Links :-
**Frontend** - https://toxic-frontend.onrender.com/
**Backend** - https://toxic-backend-zoo9.onrender.com/api/health
**ML Service** - https://toxic-ml-servic.onrender.com/
---

## 📌 Table of Contents

- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Model & NLP Pipeline](#-model--nlp-pipeline)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [Repository Structure](#-repository-structure)
- [Quick Start (Local Development)](#-quick-start-local-development)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Clone Repository](#2-clone-repository)
  - [3. Start ML Service (FastAPI)](#3-start-ml-service-fastapi)
  - [4. Start Backend API (Node.js)](#4-start-backend-api-nodejs)
  - [5. Start Frontend (React + Vite)](#5-start-frontend-react--vite)
- [Environment Variables](#-environment-variables)
- [REST API Reference](#-rest-api-reference)
- [Render Cloud Deployment Guide](#-render-cloud-deployment-guide)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)
- [License](#-license)

---

## ✨ Key Features

- **⚡ Real-Time Multi-Label Inference**: Evaluates text across 6 granular toxicity dimensions with individual sigmoid probability scores and dynamic confidence thresholding (0.05 – 0.95).
- **📊 Interactive Analytics & Visualizations**: Real-time risk meters (Low, Moderate, High), toxicity distribution charts, weekly activity trends, and dataset keyword frequency clouds.
- **📁 High-Throughput Batch Processing**: Researchers can upload CSV datasets or batch text feeds (up to 500 items per request) with bulk inference and CSV export.
- **🔐 Secure RBAC Authentication**: JWT tokens with bcrypt password hashing, HTTP-only best practices, role enforcement middleware, and audit logs.
- **🛡️ Enterprise Rate-Limiting & Proxy Trust**: Built-in sliding-window rate limiting configured for cloud load balancers and reverse proxies (e.g., Render, Nginx, Cloudflare).
- **☁️ 1-Click Render Deployment**: Ready-to-deploy Infrastructure-as-Code blueprint (`render.yaml`) orchestrating frontend, backend, and ML services.

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│           React 18 + Vite SPA (Modern Dark UI)              │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / REST / JWT
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway / Backend                    │
│                  Node.js 20+ & Express 5                    │
│  - JWT Authentication         - Rate Limiter (Proxy Trust)  │
│  - RBAC Guard Middleware      - Mongoose ODM                │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               │ Internal REST                │ Mongoose
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      Python ML Service       │ │      MongoDB Atlas         │
│     FastAPI + Uvicorn        │ │ - Users & Roles            │
│  - Clean Text Preprocessor   │ │ - Prediction Logs          │
│  - Tokenizer (60,000 vocab)  │ │ - Audit Trail Logs         │
│  - BiLSTM Model (.h5)        │ └────────────────────────────┘
└──────────────────────────────┘
```

---

## 🧠 Model & NLP Pipeline

The core ML model was developed and trained using TensorFlow/Keras on multi-label comment datasets.

```text
Raw Comment
    │
    ▼ Lowercase, strip URLs, strip brackets, sanitize non-alphanumeric (keep !?.,')
Cleaned Text
    │
    ▼ Word Tokenizer (Vocabulary: 60,000 terms)
Integer Sequence
    │
    ▼ Post-Padding & Truncating (Max Length = 200)
Input Tensor (batch_size, 200)
    │
    ▼ Embedding Layer (60,000 -> 128)
    │
    ▼ Bidirectional LSTM (64 units, returns sequences)
    │
    ▼ Bidirectional LSTM (64 units, returns sequences)
    │
    ▼ GlobalAveragePooling1D + GlobalMaxPooling1D (Concatenated)
    │
    ▼ Dense Layer (128 units, ReLU) -> Dropout (0.4)
    │
    ▼ Dense Layer (64 units, ReLU)  -> Dropout (0.3)
    │
    ▼ Dense Layer (6 units, Sigmoid Activation)
Output Vector (6 Independent Probabilities)
```

### Detected Toxicity Classes:
1. `toxic` — General abusive or rude language.
2. `severe_toxic` — Highly aggressive, extreme toxicity.
3. `obscene` — Vulgar, offensive, or sexually explicit remarks.
4. `threat` — Statements declaring intent to harm or intimidate.
5. `insult` — Demeaning or derogatory language directed at individuals.
6. `identity_hate` — Hate speech targeting race, religion, gender, ethnicity, or sexual orientation.

---

## 👥 Role-Based Access Control (RBAC)

| Capability | Public User | Researcher | Admin |
| :--- | :---: | :---: | :---: |
| Single Comment Toxicity Scoring | ✅ | ✅ | ✅ |
| Custom Threshold Adjustment (0.05 - 0.95) | ✅ | ✅ | ✅ |
| Personal Prediction History | ✅ | ✅ | ✅ |
| Batch Analysis (CSV & Multi-Text up to 500) | ❌ | ✅ | ✅ |
| Research Analytics & Word Cloud Dashboard | ❌ | ✅ | ✅ |
| Export Predictions (CSV / JSON) | ❌ | ✅ | ✅ |
| User & Role Management (Promote / Demote) | ❌ | ❌ | ✅ |
| Account Deactivation / Reactivation | ❌ | ❌ | ✅ |
| System Health Monitoring & Audit Logs | ❌ | ❌ | ✅ |

---

## 📂 Repository Structure

```text
toxic-comment-platform/
├── .github/                     # GitHub workflows and config
├── backend/                     # Node.js / Express REST API
│   ├── src/
│   │   ├── config/              # Database (Mongoose) & Environment config
│   │   ├── controllers/         # Auth, Predictions, Research, Admin controllers
│   │   ├── middleware/          # JWT auth, RBAC, error handlers
│   │   ├── models/              # User, Prediction, AuditLog schemas
│   │   ├── routes/              # Modular Express route handlers
│   │   ├── utils/               # ML HTTP client & admin seeder
│   │   └── server.js            # Express application entry point
│   ├── package.json
│   └── .env.example
├── frontend/                    # React 18 + Vite Web Application
│   ├── src/
│   │   ├── components/          # Reusable UI components & modals
│   │   ├── lib/                 # API client & localStorage auth helpers
│   │   ├── pages/               # Dashboard, Analyze, History, Research, Admin
│   │   ├── main.jsx             # React DOM root
│   │   └── styles.css           # Premium responsive styling & theme tokens
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── ml-service/                  # Python FastAPI Inference Microservice
│   ├── app/
│   │   └── main.py              # FastAPI endpoints, model loader & inference pipeline
│   ├── requirements.txt         # Pinned Python dependencies
│   └── .python-version          # Python 3.10 pin for cloud deployment
├── model/                       # Machine Learning Artifacts
│   ├── toxic_comment_model.h5   # Trained BiLSTM Keras weights
│   ├── tokenizer.pkl            # 60,000-word fitted tokenizer
│   └── config.json              # Model architecture specification
├── docs/                        # Architecture & System Design documentation
├── render.yaml                  # 1-Click Render Cloud Blueprint
├── .python-version              # Python version pin for Render
└── README.md                    # Project documentation
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v20.x or higher
- **Python**: v3.10.x (Recommended: 3.10.8 to 3.10.14)
- **MongoDB**: Local MongoDB instance or free [MongoDB Atlas](https://www.mongodb.com/) cluster
- **Git**

### 2. Clone Repository
```bash
git clone https://github.com/rashmiSahooRanjan/Toxic-Lens-Toxic-Comment-Detection-Platform.git
cd Toxic-Lens-Toxic-Comment-Detection-Platform
```

### 3. Start ML Service (FastAPI)
```bash
cd ml-service

# Create and activate virtual environment
python -m venv .venv

# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI service on port 8000
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Health check:* Visit `http://localhost:8000/health` to confirm `modelLoaded: true`.

### 4. Start Backend API (Node.js)
Open a new terminal:
```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env   # On Windows: copy .env.example .env

# Seed the default administrator account
npm run seed:admin

# Start development server on port 5000
npm run dev
```

### 5. Start Frontend (React + Vite)
Open a third terminal:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🔑 Default Admin Credentials

When running `npm run seed:admin`, the following default administrator account is initialized:

- **Email**: `admin@example.com`
- **Password**: `ChangeMe_123!`

*(You can override these before running the seed command by setting `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env`).*

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Node.js listening port | `5000` |
| `MONGODB_URI` | MongoDB Atlas or local connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your-secure-random-secret` |
| `ML_SERVICE_URL`| Internal URL to FastAPI ML service | `http://127.0.0.1:8000` |
| `CLIENT_URL` | Allowed origin for CORS | `http://localhost:5173` |
| `ADMIN_EMAIL` | Default seeded admin email | `admin@example.com` |
| `ADMIN_PASSWORD`| Default seeded admin password | `ChangeMe_123!` |

### Frontend (`frontend/.env`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL pointing to Node.js backend | `http://localhost:5000/api` |

### ML Service (`ml-service/app/main.py`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | FastAPI listening port | `8000` |
| `MODEL_PATH` | Path to `.h5` model file | `../model/toxic_comment_model.h5` |
| `TOKENIZER_PATH`| Path to `.pkl` tokenizer | `../model/tokenizer.pkl` |

---

## 📡 REST API Reference

### Public Endpoints
- `POST /api/auth/register` — Create a new user account.
- `POST /api/auth/login` — Authenticate and receive a JWT.
- `GET  /api/health` — Backend health check.
- `POST /api/predictions` — Run toxicity prediction on a single text string.

### Authenticated Endpoints (`Authorization: Bearer <token>`)
- `GET  /api/predictions/history` — Get personal prediction history.
- `GET  /api/model/info` — Inspect model architecture and preprocessing metadata.

### Researcher Endpoints (`Role: researcher` or `admin`)
- `POST /api/research/batch` — Bulk comment inference (array of 1 to 500 texts).
- `GET  /api/research/stats` — Aggregate platform metrics, weekly trends, and word analytics.

### Admin Endpoints (`Role: admin`)
- `GET   /api/admin/users` — List registered users and statuses.
- `PATCH /api/admin/users/:id/role` — Update user role (`user`, `researcher`, `admin`).
- `PATCH /api/admin/users/:id/status` — Activate or suspend a user account.
- `GET   /api/admin/audit` — View chronological audit trail logs.
- `GET   /api/admin/dashboard` — System telemetry and moderation overview.

---

## 👨‍💻 Authors

| Name                          | Role      |
| ----------------------------- | --------- |
| **Rashmi Ranjan Sahoo** |  Developer |
| **Subhrajit Das**     |ML Developer |
## ☁️ Render Cloud Deployment Guide

This project is pre-configured with a root [render.yaml](render.yaml) file for automated Infrastructure-as-Code deployment.

### ⚠️ Important Memory Notice for ML Service
The TensorFlow Keras model + vocabulary tokenizer requires **~600MB to 1GB of RAM**. 
Render's **Free Tier** limit is strictly 512MB RAM (which will trigger an OOM crash). 
For cloud deployment, run the `toxic-ml-service` on Render's **Starter Plan ($7/mo with 2GB RAM)**, or host the ML service on **Hugging Face Spaces** (free 16GB RAM) and point `ML_SERVICE_URL` to it.

### Step 1: Configure MongoDB Atlas
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Under **Security** -> **Network Access**, click **Add IP Address**.
3. Select **Allow Access From Anywhere (`0.0.0.0/0`)** to allow dynamic Render containers to connect.

### Step 2: Deploy Using Blueprint (1-Click)
1. Push your code to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com/), click **New +** -> **Blueprint**.
3. Select your repository: `Toxic-Lens-Toxic-Comment-Detection-Platform`.
4. Render will read `render.yaml` and provision:
   - `toxic-frontend` (Static Site with SPA rewrite rules)
   - `toxic-backend` (Node Web Service with proxy trust enabled)
   - `toxic-ml-service` (Python Web Service on Python 3.10)
5. Enter your `MONGODB_URI` when prompted, then click **Apply**.

### Step 3: Seed Administrator in Production
Once deployed, open the `toxic-backend` service in Render, click the **Shell** tab, and execute:
```bash
node src/utils/seedAdmin.js
```

---

## ❓ Troubleshooting & FAQs

<details>
<summary><b>1. Why does the ML service say <code>quantization_config</code> unrecognized?</b></summary>
When loading Keras 3 models saved in HDF5 (`.h5`) format across different minor versions, empty <code>quantization_config</code> tags can cause deserialization errors. ToxicLens includes an automatic config sanitizer in <code>ml-service/app/main.py</code> (<code>load_compatible_model</code>) that cleans these fields on the fly.
</details>

<details>
<summary><b>2. Why are users receiving HTTP 429 Too Many Requests in production?</b></summary>
Because Render proxies traffic through an internal load balancer, Express sees every request originating from the proxy IP unless <code>app.set("trust proxy", 1)</code> is declared. ToxicLens includes this setting out of the box in <code>backend/src/server.js</code>.
</details>

<details>
<summary><b>3. Why does page refresh return 404 on Render Static Site?</b></summary>
Vite uses client-side HTML5 pushState routing. The server must rewrite all non-file route requests to <code>/index.html</code>. This is pre-configured in <code>render.yaml</code> under the static site rewrite rules.
</details>

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — feel free to use and adapt for academic, personal, or commercial research.
