"""
Model inference module.

Loads the trained XGBoost pipeline bundle once at startup 
and exposes a predict() function for the API.
"""

import os
import logging
from typing import Optional

import joblib
import numpy as np
import pandas as pd

from app.config import get_settings
from app.ml.feature_engineering import (
    haversine_distance,
    TimeFeatureExtractor,
    DistanceCalculator,
)

logger = logging.getLogger(__name__)
settings = get_settings()

# Global model reference – loaded once, used for every request
_pipeline_bundle = None
_model_version = "stub_v0.1"


def load_model() -> bool:
    """
    Load the serialized pipeline bundle from disk.
    Returns True if real model loaded, False if using stub.
    """
    global _pipeline_bundle, _model_version

    model_path = settings.MODEL_PATH
    if os.path.exists(model_path):
        try:
            _pipeline_bundle = joblib.load(model_path)
            _model_version = _pipeline_bundle.get("version", "xgb_v1.0")
            logger.info(f"Model loaded: {_model_version} from {model_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to load model: {e}")

    logger.warning("No trained model found. Using stub predictions.")
    _pipeline_bundle = None
    _model_version = "stub_v0.1"
    return False


def reload_model() -> bool:
    """Force reload the model (called after training/promotion)."""
    return load_model()


def predict(
    pickup_lat: float,
    pickup_lng: float,
    dropoff_lat: float,
    dropoff_lng: float,
    pickup_datetime_str: str,
) -> tuple[int, str, str]:
    """
    Run inference on a single trip.

    Returns:
        (predicted_seconds, model_version, confidence)
    """
    if _pipeline_bundle is not None:
        try:
            return _predict_with_model(
                pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, pickup_datetime_str
            )
        except Exception as e:
            logger.error(f"Model prediction failed: {e}. Falling back to stub.")

    # Stub fallback: haversine-based estimate
    seconds = _stub_predict(pickup_lat, pickup_lng, dropoff_lat, dropoff_lng)
    return seconds, _model_version, "Low (stub)"


def _predict_with_model(
    pickup_lat: float,
    pickup_lng: float,
    dropoff_lat: float,
    dropoff_lng: float,
    pickup_datetime_str: str,
) -> tuple[int, str, str]:
    """Run prediction using the loaded XGBoost pipeline."""
    model = _pipeline_bundle["model"]
    cluster_encoder = _pipeline_bundle["cluster_encoder"]
    feature_columns = _pipeline_bundle["feature_columns"]

    # Build input dataframe
    input_df = pd.DataFrame([{
        "pickup_latitude": pickup_lat,
        "pickup_longitude": pickup_lng,
        "dropoff_latitude": dropoff_lat,
        "dropoff_longitude": dropoff_lng,
        "pickup_datetime": pickup_datetime_str,
        "trip_distance": haversine_distance(pickup_lat, pickup_lng, dropoff_lat, dropoff_lng),
    }])

    # Apply transformers
    time_ext = TimeFeatureExtractor()
    dist_calc = DistanceCalculator()
    input_df = time_ext.transform(input_df)
    input_df = dist_calc.transform(input_df)
    input_df = cluster_encoder.transform(input_df)

    # Select features in the correct order
    X = input_df[feature_columns]

    # Predict
    predicted = model.predict(X)
    seconds = max(int(predicted[0]), 60)

    # Confidence based on how typical the trip is
    distance = haversine_distance(pickup_lat, pickup_lng, dropoff_lat, dropoff_lng)
    if distance < 30 and seconds < 5400:
        confidence = "High"
    elif distance < 50:
        confidence = "Medium"
    else:
        confidence = "Low"

    return seconds, _model_version, confidence


def _stub_predict(
    pickup_lat: float,
    pickup_lng: float,
    dropoff_lat: float,
    dropoff_lng: float,
) -> int:
    """Haversine-based stub prediction (before model is trained)."""
    distance_km = haversine_distance(pickup_lat, pickup_lng, dropoff_lat, dropoff_lng)
    estimated_seconds = int((distance_km / 25) * 3600)  # ~25 km/h avg speed
    return max(estimated_seconds, 120)


def get_model_version() -> str:
    return _model_version


# Load model on module import
load_model()
