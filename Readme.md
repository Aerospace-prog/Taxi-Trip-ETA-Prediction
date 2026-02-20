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

| User Type                              | Description                                          |
| -------------------------------------- | ---------------------------------------------------- |
| Taxi Dispatch Operators                | Use ETA predictions to assign drivers efficiently    |
| Fleet Managers / Ride-sharing Startups | Monitor trip durations and optimize fleet operations |
| Transportation Analytics Teams         | Analyze trip patterns and model performance          |

---

## 🛠️ Tech Stack

| Layer      | Technology                            |
| ---------- | ------------------------------------- |
| Frontend   | React, Tailwind CSS                   |
| Backend    | FastAPI (Python)                      |
| ML Model   | XGBoost Regressor (with scikit-learn) |
| Database   | PostgreSQL                            |
| Deployment | Docker, AWS EC2 (t2.medium)           |

---

## 📊 Data Description

**Input Features:**

| Feature             | Description                    |
| ------------------- | ------------------------------ |
| `pickup_datetime`   | Date and time of pickup        |
| `pickup_latitude`   | Latitude of pickup location    |
| `pickup_longitude`  | Longitude of pickup location   |
| `dropoff_latitude`  | Latitude of drop-off location  |
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

| Aspect         | Detail                                                     |
| -------------- | ---------------------------------------------------------- |
| Problem Type   | Regression                                                 |
| Primary Model  | XGBoost Regressor                                          |
| Baseline Model | Random Forest Regressor                                    |
| Why XGBoost?   | High performance with tabular data and non-linear patterns |

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

| Requirement         | Target           |
| ------------------- | ---------------- |
| API Response Time   | < 500 ms         |
| System Availability | ≥ 95%            |
| Logging Accuracy    | 100%             |
| Model Loading Time  | < 2 seconds      |
| Environment         | Fully Dockerized |

---

## 🏆 Success Metrics

| Metric                        | Target                                                              |
| ----------------------------- | ------------------------------------------------------------------- |
| R² Score                      | > 0.85                                                              |
| RMSE                          | < 200 seconds (~55% improvement over baseline)                      |
| API Latency (95th percentile) | < 500 ms                                                            |
| Data Loss                     | Zero loss in prediction logs                                        |
| Functional Completion         | Working prediction pipeline + manual retraining + public deployment |

---

## ⚠️ Key Risks & Mitigation

| Risk                 | Mitigation                                      |
| -------------------- | ----------------------------------------------- |
| Overfitting          | Cross-validation and regularization             |
| Data Leakage         | Strict time-based train-test splitting          |
| Infrastructure Costs | Resource monitoring and efficient model serving |

---

# 🖼️ Wireframes – User Interface Design

[![View Wireframes on Visily](https://img.shields.io/badge/View_Wireframes-Visily-7B61FF?style=for-the-badge&logo=appveyor&logoColor=white)](https://app.visily.ai/projects/020892ce-7c05-4553-a223-2ab5ead7cd55/boards/2487689)

---

# 📄 PRD (Product Requirement Document)

To know more details of this project, go to the [**PRD.md**](./PRD.md) file.

# 📄 Project Details

To know more details of this project, go to the [**Taxi Predict Project Details.md**](./Taxi_Predict_Project_Details.md) file.

# 📄 Deployment Plan

To know more details of this project, go to the [**Deployment_Plan.md**](./Deployment_Plan.md) file.
