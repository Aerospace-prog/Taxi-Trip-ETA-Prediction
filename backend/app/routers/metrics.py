from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.model_metadata import ModelMetadata
from app.schemas.training import MetricsResponse
from app.services.auth_service import get_current_user
from app.models.user import User

router = APIRouter(tags=["Metrics"])


@router.get("/metrics", response_model=MetricsResponse)
def get_model_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get performance metrics of the currently active model."""
    active_model = (
        db.query(ModelMetadata)
        .filter(ModelMetadata.status == "active")
        .order_by(ModelMetadata.created_at.desc())
        .first()
    )

    if not active_model:
        return MetricsResponse(
            mae=None,
            rmse=None,
            r2_score=None,
            active_model_version="no_active_model",
        )

    return MetricsResponse(
        mae=active_model.mae,
        rmse=active_model.rmse,
        r2_score=active_model.r2_score,
        active_model_version=active_model.version,
    )
