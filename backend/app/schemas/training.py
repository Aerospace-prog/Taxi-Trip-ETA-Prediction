from pydantic import BaseModel
from typing import Optional


class RetrainResponse(BaseModel):
    job_id: str
    status: str


class PromoteRequest(BaseModel):
    candidate_version: str


class PromoteResponse(BaseModel):
    status: str


class MetricsResponse(BaseModel):
    mae: Optional[float] = None
    rmse: Optional[float] = None
    r2_score: Optional[float] = None
    active_model_version: Optional[str] = None
