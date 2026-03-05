# 🚕 Taxi Trip Duration Predictor – Master Execution Plan

**Project Type:** WEB (ML-Enabled Full-Stack Web Application)
**Tech Stack:** React + Tailwind CSS | FastAPI + Uvicorn | XGBoost + scikit-learn | PostgreSQL + SQLAlchemy + Alembic | Docker + Docker Compose | AWS EC2 + Nginx
**Source Documents:** PRD.md, Taxi_Predict_Project_Details.md, Deployment_Plan.md

---

## Overview

Build an end-to-end production ML system that predicts taxi trip duration (ETA) using historical trip data. The system exposes predictions via a React web UI and a REST API (FastAPI), trains/retrains XGBoost models, and deploys on AWS EC2 with Docker.

---

## Success Criteria

| Metric              | Target                |
| ------------------- | --------------------- |
| MAE                 | ≤ 180 seconds         |
| RMSE                | ≤ 250 seconds         |
| R² Score            | ≥ 0.80                |
| API Latency (p95)   | < 500 ms              |
| Prediction Logging  | Zero data loss        |
| Sequential Requests | 100 with no failures  |
| Deployment          | Public URL with HTTPS |

---

## File Structure

```
taxi-trip-predictor/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI entrypoint
│   │   ├── config.py               # Settings & env vars
│   │   ├── database.py             # SQLAlchemy engine & session
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py             # User ORM model
│   │   │   ├── prediction.py       # trip_predictions ORM
│   │   │   ├── model_metadata.py   # model_metadata ORM
│   │   │   └── training_job.py     # training_jobs ORM
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py             # Login request/response
│   │   │   ├── prediction.py       # Predict request/response
│   │   │   └── training.py         # Retrain request/response
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py             # POST /login
│   │   │   ├── predict.py          # POST /predict, GET /history
│   │   │   ├── metrics.py          # GET /metrics
│   │   │   └── retrain.py          # POST /retrain, POST /promote-model
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py     # JWT generation & validation
│   │   │   ├── prediction_service.py
│   │   │   └── training_service.py
│   │   └── ml/
│   │       ├── __init__.py
│   │       ├── feature_engineering.py  # Haversine, KMeans, time features
│   │       ├── train_pipeline.py       # XGBoost training + evaluation
│   │       └── inference.py            # Model loading & prediction
│   ├── alembic/                    # DB migrations
│   │   ├── env.py
│   │   └── versions/
│   ├── alembic.ini
│   ├── models/                     # Serialized .pkl files
│   │   └── active_model.pkl
│   ├── requirements.txt
│   ├── Dockerfile
│   └── tests/
│       ├── test_predict.py
│       ├── test_retrain.py
│       └── test_features.py
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── index.js
│   │   ├── App.jsx
│   │   ├── index.css               # Tailwind + global styles
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── MetricCard.jsx
│   │   │   ├── PredictionForm.jsx
│   │   │   ├── PredictionResult.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   └── HistoryTable.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── UserPrediction.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminHistory.jsx
│   │   │   └── AdminRetrain.jsx
│   │   ├── services/
│   │   │   └── api.js              # Axios instance + API calls
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # JWT state management
│   │   └── utils/
│   │       └── formatters.js       # Time/date formatters
│   ├── package.json
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml
├── nginx/
│   └── default.conf
├── .env
├── .env.example
├── PRD.md
├── Readme.md
├── Deployment_Plan.md
└── Taxi_Predict_Project_Details.md
```

---

## Task Breakdown

---

### 🔵 PHASE 1: Foundation (Database + Backend Scaffold)

#### Task 1.1 – Initialize Backend Project

- **Agent:** `backend-specialist`
- **Skills:** `python-patterns`, `clean-code`
- **Priority:** P0
- **Dependencies:** None
- **INPUT:** PRD tech stack (FastAPI, Python 3.10)
- **OUTPUT:** `backend/` folder with `app/main.py`, `requirements.txt`, `config.py`
- **VERIFY:** `pip install -r requirements.txt && uvicorn app.main:app` starts without errors
- [ ] Create `backend/` directory structure
- [ ] Write `requirements.txt` (fastapi, uvicorn, sqlalchemy, alembic, psycopg2-binary, xgboost, scikit-learn, pandas, numpy, joblib, python-jose, passlib, python-multipart)
- [ ] Create `app/main.py` with FastAPI app + CORS middleware
- [ ] Create `app/config.py` with Pydantic Settings (DATABASE_URL, SECRET_KEY, MODEL_PATH)

#### Task 1.2 – PostgreSQL Setup + SQLAlchemy Models

- **Agent:** `backend-specialist`
- **Skills:** `database-design`, `python-patterns`
- **Priority:** P0
- **Dependencies:** Task 1.1
- **INPUT:** DB entity tables from Taxi_Predict_Project_Details.md (users, trip_predictions, model_metadata, training_jobs)
- **OUTPUT:** ORM models + database engine + Alembic migrations
- **VERIFY:** `alembic upgrade head` creates all 4 tables in PostgreSQL
- [ ] Create `app/database.py` (engine, SessionLocal, Base)
- [ ] Create `app/models/user.py` (id UUID, email, password_hash, role, created_at)
- [ ] Create `app/models/prediction.py` (id, request_id, pickup/dropoff coords, pickup_datetime, predicted_duration_seconds, model_version, system_latency_ms, created_at)
- [ ] Create `app/models/model_metadata.py` (id, version, mae, rmse, r2_score, status, artifact_path, created_at)
- [ ] Create `app/models/training_job.py` (id, job_id, dataset_name, status, progress_percent, started_at, completed_at)
- [ ] Initialize Alembic and generate first migration
- [ ] Run migration against Docker PostgreSQL

#### Task 1.3 – Docker Compose (Dev Environment)

- **Agent:** `backend-specialist`
- **Skills:** `deployment-procedures`
- **Priority:** P0
- **Dependencies:** Task 1.1
- **INPUT:** Deployment_Plan.md docker-compose spec
- **OUTPUT:** `docker-compose.yml` with backend, frontend, db services
- **VERIFY:** `docker-compose up` starts all 3 containers, backend health endpoint returns 200
- [ ] Create `docker-compose.yml` (backend:8000, frontend:3000, db:postgres:14)
- [ ] Create `.env` and `.env.example` files
- [ ] Add health check endpoint `GET /health` to FastAPI

---

### 🟠 PHASE 2: Authentication + Core APIs

#### Task 2.1 – Authentication System (JWT)

- **Agent:** `backend-specialist`
- **Skills:** `api-patterns`, `clean-code`
- **Priority:** P1
- **Dependencies:** Task 1.2
- **INPUT:** POST /login contract from Project Details
- **OUTPUT:** Working JWT auth with role-based access (admin/dispatcher)
- **VERIFY:** Login returns valid JWT; protected endpoints reject requests without token
- [ ] Create `app/schemas/auth.py` (LoginRequest, LoginResponse, TokenPayload)
- [ ] Create `app/services/auth_service.py` (hash password, verify, create JWT, decode JWT)
- [ ] Create `app/routers/auth.py` (POST /login)
- [ ] Add JWT dependency for protected routes
- [ ] Seed an admin and dispatcher user for testing

#### Task 2.2 – Prediction API (POST /predict)

- **Agent:** `backend-specialist`
- **Skills:** `api-patterns`, `python-patterns`
- **Priority:** P1
- **Dependencies:** Task 1.2, Task 3.2 (model must exist)
- **INPUT:** POST /predict contract (pickup/dropoff coords + datetime)
- **OUTPUT:** Returns predicted_duration_seconds, predicted_duration_minutes, model_version, confidence, request_id
- **VERIFY:** `curl POST /predict` with valid coords returns ETA < 500ms
- [ ] Create `app/schemas/prediction.py` (PredictRequest, PredictResponse)
- [ ] Create `app/ml/inference.py` (load model at startup, predict function)
- [ ] Create `app/routers/predict.py` (POST /predict, GET /history)
- [ ] Create `app/services/prediction_service.py` (run inference, log to DB, measure latency)
- [ ] Add DB transaction wrapper for prediction logging

#### Task 2.3 – Metrics API (GET /metrics)

- **Agent:** `backend-specialist`
- **Skills:** `api-patterns`
- **Priority:** P1
- **Dependencies:** Task 1.2
- **INPUT:** GET /metrics contract
- **OUTPUT:** Returns mae, rmse, r2_score, active_model_version
- **VERIFY:** Endpoint returns correct metrics from model_metadata table
- [ ] Create `app/routers/metrics.py`
- [ ] Query latest active model_metadata record

#### Task 2.4 – Retrain API (POST /retrain + POST /promote-model)

- **Agent:** `backend-specialist`
- **Skills:** `api-patterns`, `python-patterns`
- **Priority:** P1
- **Dependencies:** Task 1.2, Task 3.1
- **INPUT:** POST /retrain (multipart CSV upload), POST /promote-model contracts
- **OUTPUT:** Accepts CSV, validates schema, triggers training, returns job_id + status
- **VERIFY:** Upload valid CSV → training job starts → new model artifact saved
- [ ] Create `app/schemas/training.py` (RetrainResponse, PromoteRequest)
- [ ] Create `app/routers/retrain.py` (POST /retrain, POST /promote-model)
- [ ] Create `app/services/training_service.py` (validate CSV schema, trigger pipeline, track job status)
- [ ] CSV Schema validation: check required columns, data types, null thresholds

---

### 🟡 PHASE 3: ML Pipeline

#### Task 3.1 – Feature Engineering Pipeline

- **Agent:** `backend-specialist`
- **Skills:** `python-patterns`, `clean-code`
- **Priority:** P1
- **Dependencies:** Task 1.1
- **INPUT:** Feature engineering spec from Project Details (Haversine, KMeans, time features)
- **OUTPUT:** `app/ml/feature_engineering.py` with sklearn Pipeline
- **VERIFY:** Pipeline transforms raw row → 6-feature vector (pickup_cluster_id, dropoff_cluster_id, hour, day_of_week, is_weekend, haversine_distance_km)
- [ ] Implement Haversine distance calculation
- [ ] Implement KMeans cluster encoding for pickup/dropoff coordinates
- [ ] Extract time features (hour, day_of_week, is_weekend)
- [ ] Wrap all in sklearn Pipeline
- [ ] Persist full pipeline (preprocessing + model) via joblib

#### Task 3.2 – XGBoost Training Pipeline

- **Agent:** `backend-specialist`
- **Skills:** `python-patterns`
- **Priority:** P1
- **Dependencies:** Task 3.1
- **INPUT:** Training spec (XGBRegressor, 80/20 split, hyperparams from Project Details)
- **OUTPUT:** `app/ml/train_pipeline.py` that trains, evaluates, serializes model
- **VERIFY:** Training outputs MAE ≤ 180, RMSE ≤ 250, R² ≥ 0.80 on test set
- [ ] Load and clean CSV data
- [ ] Apply feature_engineering pipeline
- [ ] Train/test split (80/20)
- [ ] Train XGBRegressor (n_estimators=1000, max_depth=7, lr=0.05, subsample=0.8, colsample_bytree=0.8)
- [ ] Evaluate (MAE, RMSE, R²)
- [ ] Save full pipeline as .pkl with joblib
- [ ] Store model_metadata in DB
- [ ] Optional: GridSearchCV for hyperparameter tuning

#### Task 3.3 – Model Inference Module

- **Agent:** `backend-specialist`
- **Skills:** `python-patterns`
- **Priority:** P1
- **Dependencies:** Task 3.1, Task 3.2
- **INPUT:** Serialized .pkl model file
- **OUTPUT:** `app/ml/inference.py` that loads model once at startup and predicts
- **VERIFY:** Inference completes in < 100ms per request
- [ ] Load model at FastAPI startup event (`joblib.load`)
- [ ] Expose predict function that accepts raw input and returns duration
- [ ] Never reload model per request (memory-cached)

---

### 🟢 PHASE 4: Frontend (React + Tailwind)

#### Task 4.1 – Initialize React Project

- **Agent:** `frontend-specialist`
- **Skills:** `frontend-design`, `clean-code`
- **Priority:** P2
- **Dependencies:** None
- **INPUT:** PRD tech stack (React, Tailwind CSS)
- **OUTPUT:** `frontend/` folder with React app + Tailwind configured
- **VERIFY:** `npm run dev` opens blank React app with Tailwind working
- [ ] Create React app (Vite)
- [ ] Install and configure Tailwind CSS
- [ ] Setup routing (react-router-dom)
- [ ] Create Axios API service instance (`services/api.js`)
- [ ] Create AuthContext for JWT state management

#### Task 4.2 – Login Page

- **Agent:** `frontend-specialist`
- **Skills:** `frontend-design`
- **Priority:** P2
- **Dependencies:** Task 4.1, Task 2.1
- **INPUT:** Login wireframe images (Login.png, Login-1.png)
- **OUTPUT:** `pages/LoginPage.jsx` matching wireframe
- **VERIFY:** Login form submits to POST /login, stores JWT, redirects based on role
- [ ] Build login form (email, password)
- [ ] Connect to POST /login API
- [ ] Store JWT in AuthContext
- [ ] Redirect: admin → AdminDashboard, dispatcher → UserDashboard
- [ ] Error handling for invalid credentials

#### Task 4.3 – User Dashboard + Prediction Flow

- **Agent:** `frontend-specialist`
- **Skills:** `frontend-design`
- **Priority:** P2
- **Dependencies:** Task 4.1, Task 2.2
- **INPUT:** Wireframes (User Dashboard.png, User New Prediction.png, User Prediction Output.png)
- **OUTPUT:** `UserDashboard.jsx`, `UserPrediction.jsx` pages
- **VERIFY:** User can enter trip details → click Predict → see ETA result
- [ ] Build UserDashboard with stats cards and quick actions
- [ ] Build PredictionForm component (5 fields: pickup lat/lng, dropoff lat/lng, datetime)
- [ ] Build PredictionResult component (shows predicted duration, model version)
- [ ] Connect form submission to POST /predict API
- [ ] Add loading state (disable button during API call)
- [ ] Display success/error messages

#### Task 4.4 – Admin Dashboard + Retrain Flow

- **Agent:** `frontend-specialist`
- **Skills:** `frontend-design`
- **Priority:** P2
- **Dependencies:** Task 4.1, Task 2.3, Task 2.4
- **INPUT:** Wireframes (Admin Dashboard.png, Admin Prediction History.png, Admin Retrain Model.png)
- **OUTPUT:** `AdminDashboard.jsx`, `AdminHistory.jsx`, `AdminRetrain.jsx` pages
- **VERIFY:** Admin sees metrics, prediction history table, and can upload CSV to retrain
- [ ] Build AdminDashboard with metric cards (MAE, RMSE, R², model version) from GET /metrics
- [ ] Build AdminHistory page with paginated table from GET /history
- [ ] Build AdminRetrain page with CSV file upload component
- [ ] Connect upload to POST /retrain API
- [ ] Show training job status/progress
- [ ] Add promote model button (POST /promote-model)

---

### 🔴 PHASE 5: Integration & Testing

#### Task 5.1 – End-to-End Integration

- **Agent:** `backend-specialist` + `frontend-specialist`
- **Skills:** `testing-patterns`, `clean-code`
- **Priority:** P3
- **Dependencies:** All Phase 2, 3, 4 tasks
- **INPUT:** Complete frontend + backend
- **OUTPUT:** Full working flow: Login → Predict → See History → Retrain
- **VERIFY:** Complete user journey works in browser
- [ ] Connect all frontend pages to real backend APIs
- [ ] Test complete user flow (login → predict → view result)
- [ ] Test complete admin flow (login → view metrics → view history → retrain → promote)
- [ ] Fix any CORS or integration issues

#### Task 5.2 – Backend Tests (Pytest)

- **Agent:** `backend-specialist`
- **Skills:** `testing-patterns`, `tdd-workflow`
- **Priority:** P3
- **Dependencies:** Phase 2, 3
- **INPUT:** All API endpoints and ML functions
- **OUTPUT:** `backend/tests/` with test files
- **VERIFY:** `pytest` passes all tests
- [ ] Write `test_predict.py` (test prediction endpoint, response format, latency)
- [ ] Write `test_retrain.py` (test CSV upload, schema validation, training trigger)
- [ ] Write `test_features.py` (test haversine, time features, KMeans transform)
- [ ] Test 100 sequential prediction requests with zero failures

#### Task 5.3 – Performance Optimization

- **Agent:** `backend-specialist`
- **Skills:** `performance-profiling`
- **Priority:** P3
- **Dependencies:** Task 5.1
- **INPUT:** NFR: API latency < 500ms, model load < 2s
- **OUTPUT:** Optimized system meeting all performance targets
- **VERIFY:** Latency test: 100 requests all < 500ms
- [ ] Ensure model loads at startup (not per request)
- [ ] Add DB indexes on trip_predictions.created_at and model_metadata.version
- [ ] Use connection pooling for PostgreSQL
- [ ] Profile and optimize any slow endpoints

---

### 🟣 PHASE 6: Deployment (Docker + AWS EC2)

#### Task 6.1 – Create Dockerfiles

- **Agent:** `backend-specialist`
- **Skills:** `deployment-procedures`
- **Priority:** P3
- **Dependencies:** Phase 5
- **INPUT:** Deployment_Plan.md Docker specs
- **OUTPUT:** Backend Dockerfile, Frontend Dockerfile (multi-stage), docker-compose.yml (production)
- **VERIFY:** `docker-compose up --build` runs all services successfully
- [ ] Create `backend/Dockerfile` (Python 3.10, pip install, uvicorn CMD)
- [ ] Create `frontend/Dockerfile` (Node 18 build stage → Nginx alpine serve)
- [ ] Update `docker-compose.yml` for production (env_file, volumes, depends_on)
- [ ] Test full Docker build locally

#### Task 6.2 – Nginx Reverse Proxy

- **Agent:** `backend-specialist`
- **Skills:** `deployment-procedures`
- **Priority:** P3
- **Dependencies:** Task 6.1
- **INPUT:** Nginx config from Deployment_Plan.md
- **OUTPUT:** `nginx/default.conf` routing / → frontend, /api/ → backend
- **VERIFY:** Access frontend via port 80, API via /api/ prefix
- [ ] Create `nginx/default.conf` with proxy_pass rules
- [ ] Add Nginx service to docker-compose or install on EC2

#### Task 6.3 – AWS EC2 Deployment

- **Agent:** `backend-specialist`
- **Skills:** `deployment-procedures`, `server-management`
- **Priority:** P3
- **Dependencies:** Task 6.1, Task 6.2
- **INPUT:** EC2 setup instructions from Deployment_Plan.md
- **OUTPUT:** Live system on EC2 with HTTPS
- **VERIFY:** Public URL loads frontend, /api/predict returns predictions, /docs shows Swagger
- [ ] Provision EC2 instance (t3.medium, Ubuntu 22.04, 30GB gp3)
- [ ] Configure security group (22, 80, 443)
- [ ] Install Docker + Docker Compose + Nginx + Certbot
- [ ] Clone repo and deploy
- [ ] Enable HTTPS with Let's Encrypt
- [ ] Setup Alembic migrations on prod DB
- [ ] Verify all endpoints work on public URL

---

## Phase X: Final Verification Checklist

> 🔴 **DO NOT mark project complete until ALL checks pass.**

- [ ] **Security:** No hardcoded secrets in code
- [ ] **Security:** JWT auth protects admin endpoints
- [ ] **API:** POST /predict returns correct format
- [ ] **API:** POST /retrain accepts CSV and triggers training
- [ ] **API:** GET /metrics returns model performance data
- [ ] **API:** GET /history returns paginated predictions
- [ ] **API:** POST /promote-model updates active model
- [ ] **API:** All endpoints respond < 500ms
- [ ] **ML:** Model R² ≥ 0.80, MAE ≤ 180s, RMSE ≤ 250s
- [ ] **ML:** Model loads at startup, not per request
- [ ] **Frontend:** Login flow works (both roles)
- [ ] **Frontend:** Prediction form submits and displays result
- [ ] **Frontend:** Admin dashboard shows metrics
- [ ] **Frontend:** Admin can retrain model via CSV upload
- [ ] **Frontend:** Prediction history table with pagination
- [ ] **DB:** All 4 tables created and populated
- [ ] **DB:** Zero data loss in prediction logging
- [ ] **Docker:** `docker-compose up` starts all services
- [ ] **Deploy:** HTTPS enabled on public domain
- [ ] **Deploy:** Swagger docs accessible at /docs
- [ ] **Deploy:** 100 sequential requests with zero failures
- [ ] **Build:** Frontend builds without errors
- [ ] **Build:** Backend starts without errors

---

## Agent Assignment Summary

| Phase                | Agent                                        | Skills                                                        |
| -------------------- | -------------------------------------------- | ------------------------------------------------------------- |
| Phase 1: Foundation  | `backend-specialist`                         | `python-patterns`, `database-design`, `deployment-procedures` |
| Phase 2: APIs        | `backend-specialist`                         | `api-patterns`, `python-patterns`, `clean-code`               |
| Phase 3: ML Pipeline | `backend-specialist`                         | `python-patterns`, `clean-code`                               |
| Phase 4: Frontend    | `frontend-specialist`                        | `frontend-design`, `clean-code`                               |
| Phase 5: Testing     | `backend-specialist` + `frontend-specialist` | `testing-patterns`, `performance-profiling`                   |
| Phase 6: Deployment  | `backend-specialist`                         | `deployment-procedures`, `server-management`                  |

---

## Slash Command Execution Order

| Step | Command                  | What It Does                             |
| ---- | ------------------------ | ---------------------------------------- |
| 1    | `/create` Phase 1        | Scaffold backend + DB + Docker           |
| 2    | `/enhance` Phase 2       | Build all API endpoints                  |
| 3    | `/enhance` Phase 3       | Build ML pipeline                        |
| 4    | `/ui-ux-pro-max` Phase 4 | Build all frontend pages from wireframes |
| 5    | `/test` Phase 5          | Write and run tests                      |
| 6    | `/deploy` Phase 6        | Dockerize + deploy to AWS                |
| 7    | `/status`                | Check progress at any time               |
| 8    | `/debug`                 | Fix any bugs encountered                 |
