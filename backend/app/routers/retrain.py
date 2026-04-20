import os
import uuid
import tempfile
import logging
import threading
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.database import get_db, SessionLocal
from app.schemas.training import RetrainResponse, PromoteRequest, PromoteResponse
from app.services.auth_service import require_role
from app.services.training_service import validate_csv_schema, create_training_job, promote_model
from app.models.user import User
from app.models.training_job import TrainingJob
from app.models.model_metadata import ModelMetadata
from app.ml.train_pipeline import train_model
from app.ml.inference import reload_model

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Training"])


def _run_training(file_path: str, job_id: str, version: str):
    """Run training in a background thread."""
    db = SessionLocal()
    try:
        # Update job status to running
        job = db.query(TrainingJob).filter(TrainingJob.job_id == job_id).first()
        if job:
            job.status = "running"
            job.progress_percent = 10
            db.commit()

        # Execute training
        result = train_model(
            file_path=file_path,
            output_dir="/app/models",
            version=version,
            sample_size=200000,
        )

        # Save model metadata
        metadata = ModelMetadata(
            version=result["version"],
            mae=result["mae"],
            rmse=result["rmse"],
            r2_score=result["r2_score"],
            status="candidate",
            artifact_path=result["artifact_path"],
        )
        db.add(metadata)

        # Update job status to completed
        if job:
            job.status = "completed"
            job.progress_percent = 100
            job.completed_at = datetime.utcnow()

        db.commit()

        # Reload the active model
        reload_model()

        logger.info(f"Training complete: {result}")

    except Exception as e:
        logger.error(f"Training failed: {e}")
        if job:
            job.status = "failed"
            db.commit()
    finally:
        # Cleanup temp file
        if os.path.exists(file_path):
            os.remove(file_path)
        db.close()


@router.post("/retrain", response_model=RetrainResponse)
async def retrain_model_endpoint(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """
    Upload a CSV/Parquet dataset and trigger model retraining.
    Training runs in background. Admin role required.
    """
    valid_extensions = (".csv", ".parquet")
    if not file.filename.endswith(valid_extensions):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV and Parquet files are accepted",
        )

    # Save uploaded file
    tmp_dir = tempfile.mkdtemp()
    file_path = os.path.join(tmp_dir, file.filename)
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Validate CSV schema (skip for parquet)
    if file.filename.endswith(".csv"):
        is_valid, message = validate_csv_schema(file_path)
        if not is_valid:
            os.remove(file_path)
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=message,
            )

    # Create training job
    job = create_training_job(db, dataset_name=file.filename)
    version = f"xgb_v{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"

    # Launch training in background thread
    thread = threading.Thread(
        target=_run_training,
        args=(file_path, job.job_id, version),
        daemon=True,
    )
    thread.start()

    return RetrainResponse(
        job_id=job.job_id,
        status="running",
        candidate_version=version,
    )


@router.post("/promote-model", response_model=PromoteResponse)
def promote_candidate_model(
    body: PromoteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """
    Promote a candidate model to active.
    Archives the current active model. Admin role required.
    """
    success = promote_model(db, body.candidate_version)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate model '{body.candidate_version}' not found",
        )

    # Reload the model so predictions use the new one
    reload_model()

    return PromoteResponse(status="Model promoted successfully")
