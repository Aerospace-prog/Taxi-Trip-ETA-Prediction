import uuid
import os
from datetime import datetime

import pandas as pd
from sqlalchemy.orm import Session

from app.models.training_job import TrainingJob
from app.models.model_metadata import ModelMetadata

REQUIRED_COLUMNS_NYC = [
    "pickup_datetime",
    "pickup_latitude",
    "pickup_longitude",
    "dropoff_latitude",
    "dropoff_longitude",
    "trip_duration",
]

REQUIRED_COLUMNS_BLR = [
    "ts",
    "pick_lat",
    "pick_lng",
    "drop_lat",
    "drop_lng"
]


def validate_csv_schema(file_path: str, city_code: str = "NYC") -> tuple[bool, str]:
    """Validate that a CSV file has the required columns and acceptable data."""
    try:
        df = pd.read_csv(file_path, nrows=5)
    except Exception as e:
        return False, f"Cannot read CSV: {str(e)}"

    req_cols = REQUIRED_COLUMNS_BLR if city_code == "BLR" else REQUIRED_COLUMNS_NYC

    missing = [col for col in req_cols if col not in df.columns]
    if missing:
        return False, f"Missing columns: {', '.join(missing)}"

    return True, "Schema valid"


def create_training_job(db: Session, dataset_name: str, city_code: str = "NYC") -> TrainingJob:
    """Create a new training job record."""
    job = TrainingJob(
        job_id=f"TRN-{uuid.uuid4().hex[:8].upper()}",
        dataset_name=dataset_name,
        city_code=city_code,
        status="pending",
        progress_percent=0,
        started_at=datetime.utcnow(),
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def promote_model(db: Session, candidate_version: str, city_code: str = "NYC") -> bool:
    """Promote a candidate model to active and archive the previous active for that city."""
    candidate = (
        db.query(ModelMetadata)
        .filter(
            ModelMetadata.version == candidate_version, 
            ModelMetadata.status == "candidate",
            ModelMetadata.city_code == city_code
        )
        .first()
    )
    if not candidate:
        return False

    # Archive current active model(s) for this city
    db.query(ModelMetadata).filter(
        ModelMetadata.status == "active",
        ModelMetadata.city_code == city_code
    ).update(
        {"status": "archive"}
    )

    # Promote candidate
    candidate.status = "active"
    db.commit()
    return True
