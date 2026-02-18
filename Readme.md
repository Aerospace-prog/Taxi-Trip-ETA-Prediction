# 🚕 Taxi Trip Duration Prediction – System for Dispatch / ETA


## 📌 Problem Statement

Taxi dispatch systems need accurate **Estimated Time of Arrival (ETA)** predictions before assigning drivers to trips. Inaccurate ETA leads to:

- Driver misallocation
- Increased ride cancellations
- Reduced customer satisfaction
- Revenue inefficiencies

This project builds an **end-to-end deployable system** that predicts taxi trip duration using historical trip data and exposes predictions through a web interface and REST API.

> **Goal:** Create a production-style ML system — not just a trained model.

---

## 🎯 Objectives

- Build a **high-precision regression model** for trip duration prediction
- Deliver a **REST API** for real-time ETA estimation
- Provide a **web-based UI** for trip duration input, prediction, and history
- Deploy the complete system on **AWS EC2** using **Docker**

---

## 👥 Target Users

| User Type | Description |
|-----------|------------|
| Taxi Dispatch Operators | Use ETA predictions to assign drivers efficiently |
| Fleet Managers / Ride-sharing Startups | Monitor trip durations and optimize fleet operations |
| Transportation Analytics Teams | Analyze trip patterns and model performance |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Tailwind CSS |
| Backend | FastAPI (Python) |
| ML Model | XGBoost Regressor (with scikit-learn) |
| Database | PostgreSQL |
| Deployment | Docker, AWS EC2 (t2.medium) |

---

## 📊 Data Description

**Input Features:**

| Feature | Description |
|---------|------------|
| `pickup_datetime` | Date and time of pickup |
| `pickup_latitude` | Latitude of pickup location |
| `pickup_longitude` | Longitude of pickup location |
| `dropoff_latitude` | Latitude of drop-off location |
| `dropoff_longitude` | Longitude of drop-off location |

**Target Variable:** `trip_duration` (in seconds)

**Derived Features:**

- **Haversine Distance** – calculated from pickup/drop-off coordinates
- **Hour of Day** – extracted from pickup time
- **Day of Week** – extracted from pickup date
- **Month** – extracted from pickup date
- **Is Weekend** – indicator flag

---

## 🤖 ML Approach

| Aspect | Detail |
|--------|--------|
| Problem Type | Regression |
| Primary Model | XGBoost Regressor |
| Baseline Model | Random Forest Regressor |
| Why XGBoost? | High performance with tabular data and non-linear patterns |

### Data Pipeline

1. CSV Upload & Schema Validation
2. Missing Value & Outlier Handling (filtering extreme trip durations)
3. Feature Engineering (distance calculation + time extraction)
4. Model Training & Hyperparameter Tuning
5. Model Serialization (`.pkl`) for inference

---

## ✅ Core Features

### ML Layer
- Automated feature engineering
- XGBoost training with evaluation dashboard (MAE, RMSE, R²)
- Model version tracking

### Backend (FastAPI)
- `/predict` – Get trip duration prediction
- `/retrain` – Trigger model retraining
- `/metrics` – View model performance metrics
- Prediction logging to database

### Frontend (React)
- Trip input form
- ETA display
- Model metrics view
- Retraining trigger for admin

### Database (PostgreSQL)
- Stores historical predictions
- Stores model metadata and version history

---

## ⚡ Non-Functional Requirements

| Requirement | Target |
|------------|--------|
| API Response Time | < 500 ms |
| System Availability | ≥ 95% |
| Logging Accuracy | 100% |
| Model Loading Time | < 2 seconds |
| Environment | Fully Dockerized |

---

## 🏆 Success Metrics

| Metric | Target |
|--------|--------|
| R² Score | > 0.85 |
| RMSE | < 200 seconds (~55% improvement over baseline) |
| API Latency (95th percentile) | < 500 ms |
| Data Loss | Zero loss in prediction logs |
| Functional Completion | Working prediction pipeline + manual retraining + public deployment |

---

## ⚠️ Key Risks & Mitigation

| Risk | Mitigation |
|------|-----------|
| Overfitting | Cross-validation and regularization |
| Data Leakage | Strict time-based train-test splitting |
| Infrastructure Costs | Resource monitoring and efficient model serving |

---

# ️ Wireframes – User Interface Design

---

## 🔐 Authentication

### Login Screen

The login screen provides secure authentication for both **Users** and **Admins** to access the system.

![Login Screen](./Wireframe%20Images/Login.png)

![Login Screen - Alternate View](./Wireframe%20Images/Login-1.png)

---

## 👤 User Panel

### User Dashboard

The dashboard shows **real-time statistics** and **average trip durations** at a glance. Users can quickly navigate to make a new prediction or view their history.

![User Dashboard](./Wireframe%20Images/User%20Dashboard.png)

### New Prediction

An interactive form where users enter **pickup/drop-off coordinates** and **pickup time** to get an estimated trip duration.

![User New Prediction](./Wireframe%20Images/User%20New%20Prediction.png)

### Prediction Output

Displays the **estimated trip duration** returned by the model, along with trip details and a summary of the input data.

![User Prediction Output](./Wireframe%20Images/User%20Prediction%20Output.png)

---

## 🛡️ Admin Panel

### Admin Dashboard

The admin dashboard provides an overview of **system health, model performance metrics**, and quick actions for management.

![Admin Dashboard](./Wireframe%20Images/Admin%20Dashboard.png)

### Admin – New Trip ETA Prediction

Admins can also run predictions with additional controls and options not available to regular users.

![Admin New Trip ETA Prediction](./Wireframe%20Images/Admin%20New%20Trip%20ETA%20Prediction.png)

### Admin – Prediction History

A complete log of **all past predictions**, including input data, predicted duration, and timestamps — useful for auditing and analysis.

![Admin Prediction History](./Wireframe%20Images/Admin%20Prediction%20History.png)

### Admin – Prediction Output

Detailed view of prediction results with model metadata (version, accuracy) for admin verification.

![Admin Prediction Output](./Wireframe%20Images/Admin%20Prediction%20Output.png)

### Admin – Retrain Model

Interface for uploading **new trip data** and triggering model retraining. Shows whether the new model improved over the previous version.

![Admin Retrain Model](./Wireframe%20Images/Admin%20Retrain%20Model.png)

---

---

# 📅 Project Timeline (9 Weeks)

| Week | Phase | Description |
|------|-------|------------|
| W1 | Project Launch & Scope | Finalize metrics, tech stack, repo setup |
| W2 | Product Design & Wireframes | Define User/Admin flows |
| W3 | Technical Design & EDA | Baseline models and architecture |
| W4 | Development Sprint 1 | Foundations: FastAPI, React, Docker, DB |
| W5 | Development Sprint 2 | Core ML: Feature pipeline and XGBoost training |
| W6 | Development Sprint 3 | Working Flow: Metrics dashboard, retraining endpoint |
| W7 | Deployment | Cloud setup on AWS EC2, monitoring |
| W8 | Scalability & Maturity | Fine-tuning, caching, async logging |
| W9 | Final Evaluation | Stretch features (SHAP/Map integration), final defense |

---

## 📦 Deliverables

- ✅ Functional ML Model (`.pkl`)
- ✅ Prediction API Service & Metrics Dashboard
- ✅ React Web Application
- ✅ Docker Configuration & Deployment Manual
- ✅ Final Project Documentation / PRD

---

# ✅ Wireframe Summary

| # | Screen | What It Shows |
|---|--------|--------------|
| 1 | Login | Authentication screen for Users and Admins |
| 2 | User Dashboard | Main landing page after user login |
| 3 | User New Prediction | Form to enter trip details for prediction |
| 4 | User Prediction Output | Displays the estimated trip duration |
| 5 | Admin Dashboard | Admin overview with system metrics |
| 6 | Admin ETA Prediction | Admin prediction interface |
| 7 | Admin Prediction History | Past predictions and their results |
| 8 | Admin Prediction Output | Admin view of prediction results |
| 9 | Admin Retrain Model | Interface to upload data and retrain the model |
