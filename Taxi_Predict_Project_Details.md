# **Feature Breakdown**

# _Upload Historical Taxi Trip Data (CSV)_

## **Objective**

Allow Admin to upload historical trip data for model retraining.

## **Implementation Plan**

### **Frontend (React \+ Tailwind)**

- File upload component (type="file", accept=".csv")
- Submit button → triggers API call
- Progress indicator (training status)
- Success/error message display

Library:

- Axios (for file upload)
- React state management

### **Backend (FastAPI)**

### **Endpoint:**

`POST /retrain`

| from fastapi import UploadFile, File |
| :----------------------------------- |

Steps:

1. Receive CSV file
2. Save temporarily to `/tmp` directory
3. Validate schema
4. Trigger training pipeline

### **CSV Schema Validation**

Use:

- pandas
- pydantic
- custom validation logic

Check for required columns:

- pickup_datetime
- pickup_latitude
- pickup_longitude
- dropoff_latitude
- dropoff_longitude
- trip_duration

Reject if:

- Missing columns
- Incorrect data types
- Null values beyond threshold

### **Storage**

- Save dataset metadata in `training_jobs` table
- Store file path reference
- Track job status

# _Feature Engineering Pipeline_

## **Objective**

Transform raw taxi trip data into ML-ready features.

## **Implementation (Backend Only)**

Use:

- pandas
- numpy
- scikit-learn
- sklearn.pipeline.Pipeline

## **A. Location Encoding**

### **Option Used:**

Cluster-based encoding

Use:

| from sklearn.cluster import KMeans |
| :--------------------------------- |

Steps:

- Fit KMeans on pickup & dropoff coordinates
- Create pickup_cluster_id
- Create dropoff_cluster_id

Save:

- Fitted KMeans model along with pipeline

## **B. Time Features**

Extract:

| df\["hour"\] \= df\["pickup_datetime"\].dt.hourdf\["day_of_week"\] \= df\["pickup_datetime"\].dt.dayofweekdf\["is_weekend"\] \= df\["day_of_week"\].isin(\[5,6\]) |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |

## **C. Distance Estimation**

Use Haversine Formula:

| import numpy as np |
| :----------------- |

Compute:

- Great-circle distance between pickup and dropoff

Add column:  
haversine_distance_km

**D. Final Feature Set**

- pickup_cluster_id
- dropoff_cluster_id
- hour
- day_of_week
- is_weekend
- haversine_distance_km

## **Important: Pipeline Persistence**

Wrap everything inside:

| from sklearn.pipeline import Pipeline |
| :------------------------------------ |

| Save: import joblibjoblib.dump(full_pipeline, "model_v2.pkl") |
| :------------------------------------------------------------ |

Never save only the model \- always save preprocessing \+ model together.

# _Training Pipeline (XGBoost Regression)_

## **Objective**

Train optimized regression model for trip duration prediction.

## **Implementation**

Use:

- xgboost
- scikit-learn
- train_test_split
- cross_val_score

### **Step 1 – Train/Test Split**

| from sklearn.model_selection import train_test_split |
| :--------------------------------------------------- |

_Split:_  
_80% training_  
_20% validation_

### **Step 2 – Model Training**

| from xgboost import XGBRegressor |
| :------------------------------- |

Initial Parameters:

- n_estimators=1000
- max_depth=7
- learning_rate=0.05
- subsample=0.8
- colsample_bytree=0.8

### **Step 3 – Hyperparameter Tuning**

Optional:

_GridSearchCV_

# _Model Evaluation View (Admin Dashboard)_

## **Metrics**

Use:

| from sklearn.metrics import mean_absolute_errorfrom sklearn.metrics import mean_squared_errorfrom sklearn.metrics import r2_score |
| :-------------------------------------------------------------------------------------------------------------------------------- |

Compute:

- MAE
- RMSE
- R²

Store results in:  
`model_metadata` table

## **Dashboard Display**

Backend:  
GET `/metrics`

Frontend:  
React fetch \+ display metric cards

# _REST API – Predict ETA_

## **Endpoint:**

`POST /predict`

**Backend Flow**

1. Receive JSON input
2. Validate using Pydantic
3. Load active model pipeline from memory
4. Apply feature engineering
5. Run inference
6. Log prediction
7. Return result

## **Model Loading Optimization**

| At server startup:model \= joblib.load("active_model.pkl") |
| :--------------------------------------------------------- |

Avoid loading per request.

## **Response Format**

| { "predicted_duration_seconds": 840, "predicted_duration_minutes": 14, "model_version": "xgb_v2.01", "confidence": "High"} |
| :------------------------------------------------------------------------------------------------------------------------- |

#

# _Simple Web Form (Dispatcher)_

## **Frontend**

Fields:

- pickup latitude
- pickup longitude
- dropoff latitude
- dropoff longitude
- pickup datetime

Use:

- React controlled inputs
- Basic validation

Submit:  
Axios → POST `/predict`

## **Loading State**

Use:

| setLoading(true) |
| :--------------- |

Disable button during API call.

# _Store Prediction Requests in Database_

## **PostgreSQL Table: trip_predictions**

Use:

- SQLAlchemy (ORM)

Steps:

- Insert record after inference
- Include model_version
- Include system_latency

## **Logging Accuracy**

Wrap in DB transaction:

with session.begin():  
 session.add(prediction_record)

# _Manual Retraining Trigger from UI_

## **Frontend**

Admin → Click "Retrain Model"

Upload CSV → POST `/retrain`

## **Backend**

Steps:

1. Save dataset
2. Trigger training function
3. Store job status
4. Evaluate new model
5. Save new model artifact
6. Update metadata
7. Option to promote

#

#

#

# **API PLANNING**

## **Authentication APIs**

### **POST /login**

| Request:{ "email": "dispatcher@taxipredict.ai", "password": "\*\*\*\*\*\*"}Response:{ "access_token": "jwt_token", "role": "dispatcher"} |
| :--------------------------------------------------------------------------------------------------------------------------------------- |

## **Prediction APIs**

### **POST /predict**

Used by: Dispatcher

**Request:**

| { "pickup_latitude": 40.7128, "pickup_longitude": \-74.0060, "dropoff_latitude": 40.7589, "dropoff_longitude": \-73.9851, "pickup_datetime": "2023-11-24T14:30:00"} |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |

**Response:**

| { "predicted_duration_seconds": 840, "predicted_duration_minutes": 14, "model_version": "xgb_v2.01_stable", "confidence": "High", "request_id": "TRP-94832"} |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------- |

### **GET /history**

Used by: Dispatcher/Admin

**Query Params:**

- page
- limit
- date_filter

**Response:**

| { "total_records": 250, "records": \[ { "request_id": "TRP-8821", "predicted_minutes": 14.1, "model_version": "xgb_v2.01_stable", "timestamp": "2023-11-24T14:32:10" } \]} |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

## **Metrics API**

### **GET /metrics**

Used by: Admin

**Response:**

| { "mae": 184.2, "rmse": 256.8, "r2_score": 0.892, "active_model_version": "xgb_v2.0.1_prod"} |
| :------------------------------------------------------------------------------------------- |

## **Retraining API**

### **POST /retrain**

Used by: Admin

**Request:**  
Multipart file upload (CSV)

**Response:**

| { "job_id": "TRN-8821", "status": "Running"} |
| :------------------------------------------- |

### **POST /promote-model**

Used by: Admin

**Request:**

| { "candidate_version": "v2.1.0-rc1"} |
| :----------------------------------- |

**Response:**

| { "status": "Model promoted successfully"} |
| :----------------------------------------- |

#

#

#

# **DATABASE ENTITY IDENTIFICATION**

Use PostgreSQL.

## **1\. users**

| Field         | Type      | Description        |
| ------------- | --------- | ------------------ |
| id            | UUID      | Primary key        |
| email         | VARCHAR   | Unique             |
| password_hash | TEXT      | Hashed password    |
| role          | VARCHAR   | admin / dispatcher |
| created_at    | TIMESTAMP |                    |

## **2\. trip_predictions**

| Field                      | Type      |
| -------------------------- | --------- |
| id                         | UUID      |
| request_id                 | VARCHAR   |
| pickup_latitude            | FLOAT     |
| pickup_longitude           | FLOAT     |
| dropoff_latitude           | FLOAT     |
| dropoff_longitude          | FLOAT     |
| pickup_datetime            | TIMESTAMP |
| predicted_duration_seconds | INT       |
| model_version              | VARCHAR   |
| system_latency_ms          | INT       |
| created_at                 | TIMESTAMP |

## **3\. model_metadata**

| Field         | Type                               |
| ------------- | ---------------------------------- |
| id            | UUID                               |
| version       | VARCHAR                            |
| mae           | FLOAT                              |
| rmse          | FLOAT                              |
| r2_score      | FLOAT                              |
| status        | VARCHAR (active/candidate/archive) |
| artifact_path | TEXT                               |
| created_at    | TIMESTAMP                          |

## **4\. training_jobs**

| Field            | Type      |
| ---------------- | --------- |
| id               | UUID      |
| job_id           | VARCHAR   |
| dataset_name     | VARCHAR   |
| status           | VARCHAR   |
| progress_percent | INT       |
| started_at       | TIMESTAMP |
| completed_at     | TIMESTAMP |

# **Database Entity Diagram (ER Diagram)**

![ER Diagram](./DocImages/ER_Diagram.png)

# **HLD For Taxi Predict**

![HLD](./DocImages/HLD.png)

# **LLD For Taxi Predict**

![LLD](./DocImages/LLD.png)

# **API CONTRACTS**

![API Contracts](./DocImages/API_Contract.png)

# **Consumer Flow Diagram (User / Dispatcher Perspective)**

![Consumer Flow Diagram](./DocImages/Consumer_Flow_Diagram.png)

# **Admin / Retraining Flow Diagram**

![Admin Retraining Flow Diagram](./DocImages/Admin_Retraining_Flow_Diagram.png)

# **ML Pipeline Diagram (Training vs Inference Separation)**

![ML Pipeline Diagram](./DocImages/ML_Pipeline_Diagram.png)
