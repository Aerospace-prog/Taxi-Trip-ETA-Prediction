import time
import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.prediction import TripPrediction
from app.models.model_metadata import ModelMetadata


def generate_request_id() -> str:
    """Generate a unique trip prediction request ID."""
    return f"TRP-{uuid.uuid4().hex[:8].upper()}"


def log_prediction(
    db: Session,
    request_id: str,
    pickup_lat: float,
    pickup_lng: float,
    dropoff_lat: float,
    dropoff_lng: float,
    pickup_dt: datetime,
    predicted_seconds: int,
    model_version: str,
    latency_ms: int,
    user_id: uuid.UUID = None,
) -> TripPrediction:
    """Log a prediction record to the database inside a transaction."""
    record = TripPrediction(
        request_id=request_id,
        pickup_latitude=pickup_lat,
        pickup_longitude=pickup_lng,
        dropoff_latitude=dropoff_lat,
        dropoff_longitude=dropoff_lng,
        pickup_datetime=pickup_dt,
        predicted_duration_seconds=predicted_seconds,
        model_version=model_version,
        system_latency_ms=latency_ms,
        user_id=user_id,
    )
    with db.begin_nested():
        db.add(record)
    db.commit()
    return record


def get_prediction_history(
    db: Session,
    page: int = 1,
    limit: int = 20,
    user_id: uuid.UUID = None,
):
    """Retrieve paginated prediction history, optionally filtered by user."""
    query = db.query(TripPrediction)
    if user_id:
        query = query.filter(TripPrediction.user_id == user_id)
        
    total = query.count()
    records = (
        query
        .order_by(TripPrediction.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )
    return total, records


def get_active_model_version(db: Session) -> str:
    """Get the version string of the currently active model."""
    active = (
        db.query(ModelMetadata)
        .filter(ModelMetadata.status == "active")
        .order_by(ModelMetadata.created_at.desc())
        .first()
    )
    return active.version if active else "no_model_loaded"
