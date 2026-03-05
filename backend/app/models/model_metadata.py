import uuid
from datetime import datetime

from sqlalchemy import String, Float, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ModelMetadata(Base):
    __tablename__ = "model_metadata"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    version: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    mae: Mapped[float] = mapped_column(Float, nullable=True)
    rmse: Mapped[float] = mapped_column(Float, nullable=True)
    r2_score: Mapped[float] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="candidate"
    )  # active / candidate / archive
    artifact_path: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    predictions = relationship("TripPrediction", backref="model", lazy="dynamic")

    def __repr__(self) -> str:
        return f"<ModelMetadata {self.version} ({self.status})>"
