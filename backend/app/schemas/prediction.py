from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class PredictRequest(BaseModel):
    pickup_latitude: float
    pickup_longitude: float
    dropoff_latitude: float
    dropoff_longitude: float
    pickup_datetime: str  # ISO format: "2023-11-24T14:30:00"


class PredictResponse(BaseModel):
    predicted_duration_seconds: int
    predicted_duration_minutes: float
    model_version: str
    confidence: str
    request_id: str


class HistoryRecord(BaseModel):
    request_id: str
    pickup_latitude: float
    pickup_longitude: float
    dropoff_latitude: float
    dropoff_longitude: float
    pickup_datetime: datetime
    predicted_duration_seconds: int
    predicted_duration_minutes: float
    model_version: str
    system_latency_ms: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class HistoryResponse(BaseModel):
    total_records: int
    page: int
    limit: int
    records: list[HistoryRecord]
