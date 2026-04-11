import uuid
import os
from datetime import datetime

import pandas as pd
from sqlalchemy.orm import Session

from app.models.training_job import TrainingJob
from app.models.model_metadata import ModelMetadata

REQUIRED_COLUMNS = [
    "pickup_datetime",
    "pickup_latitude",
    "pickup_longitude",
    "dropoff_latitude",
    "dropoff_longitude",
    "trip_duration",
]


def validate_csv_schema(file_path: str) -> tuple[bool, str]:
    """Validate that a CSV file has the required columns and acceptable data."""
    try:
        df = pd.read_csv(file_path, nrows=5)
    except Exception as e:
        return False, f"Cannot read CSV: {str(e)}"

    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing:
        return False, f"Missing columns: {', '.join(missing)}"

    return True, "Schema valid"


def create_training_job(db: Session, dataset_name: str) -> TrainingJob:
    """Create a new training job record."""
    job = TrainingJob(
        job_id=f"TRN-{uuid.uuid4().hex[:8].upper()}",
        dataset_name=dataset_name,
        status="pending",
        progress_percent=0,
        started_at=datetime.utcnow(),
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def promote_model(db: Session, candidate_version: str) -> bool:
    """Promote a candidate model to active and archive the previous active."""
    candidate = (
        db.query(ModelMetadata)
        .filter(ModelMetadata.version == candidate_version, ModelMetadata.status == "candidate")
        .first()
    )
    if not candidate:
        return False

    # Archive current active model(s)
    db.query(ModelMetadata).filter(ModelMetadata.status == "active").update(
        {"status": "archive"}
    )

    # Promote candidate
    candidate.status = "active"
    db.commit()
    return True
