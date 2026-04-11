import time
from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.prediction import PredictRequest, PredictResponse, HistoryResponse, HistoryRecord
from app.services.auth_service import get_current_user
from app.services.prediction_service import generate_request_id, log_prediction, get_prediction_history
from app.ml.inference import predict as ml_predict
from app.models.user import User

router = APIRouter(tags=["Predictions"])


@router.post("/predict", response_model=PredictResponse)
def predict_trip_duration(
    body: PredictRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Predict taxi trip duration given pickup/dropoff coordinates and time."""
    start_time = time.time()

    # Run ML inference
    predicted_seconds, model_version, confidence = ml_predict(
        pickup_lat=body.pickup_latitude,
        pickup_lng=body.pickup_longitude,
        dropoff_lat=body.dropoff_latitude,
        dropoff_lng=body.dropoff_longitude,
        pickup_datetime_str=body.pickup_datetime,
    )

    latency_ms = int((time.time() - start_time) * 1000)
    request_id = generate_request_id()

    # Parse datetime
    pickup_dt = datetime.fromisoformat(body.pickup_datetime)

    # Log prediction to DB
    log_prediction(
        db=db,
        request_id=request_id,
        pickup_lat=body.pickup_latitude,
        pickup_lng=body.pickup_longitude,
        dropoff_lat=body.dropoff_latitude,
        dropoff_lng=body.dropoff_longitude,
        pickup_dt=pickup_dt,
        predicted_seconds=predicted_seconds,
        model_version=model_version,
        latency_ms=latency_ms,
    )

    return PredictResponse(
        predicted_duration_seconds=predicted_seconds,
        predicted_duration_minutes=round(predicted_seconds / 60, 1),
        model_version=model_version,
        confidence=confidence,
        request_id=request_id,
    )


@router.get("/history", response_model=HistoryResponse)
def get_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get paginated prediction history."""
    total, records = get_prediction_history(db, page, limit)

    return HistoryResponse(
        total_records=total,
        page=page,
        limit=limit,
        records=[
            HistoryRecord(
                request_id=r.request_id,
                pickup_latitude=r.pickup_latitude,
                pickup_longitude=r.pickup_longitude,
                dropoff_latitude=r.dropoff_latitude,
                dropoff_longitude=r.dropoff_longitude,
                pickup_datetime=r.pickup_datetime,
                predicted_duration_seconds=r.predicted_duration_seconds,
                predicted_duration_minutes=round(r.predicted_duration_seconds / 60, 1),
                model_version=r.model_version,
                system_latency_ms=r.system_latency_ms,
                created_at=r.created_at,
            )
            for r in records
        ],
    )
