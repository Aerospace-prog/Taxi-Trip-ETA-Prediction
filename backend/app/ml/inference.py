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
# Dictionary mapping city_code -> pipeline bundle
_active_models = {}


def load_model() -> bool:
    """
    Load the serialized pipeline bundles from disk for all configured cities.
    Returns True if at least one real model loaded.
    """
    global _active_models
    _active_models = {}
    models_dir = "/app/models"
    loaded_any = False

    for city_code in settings.CITIES.keys():
        model_path = os.path.join(models_dir, f"active_model_{city_code}.pkl")
        if not os.path.exists(model_path) and city_code == "NYC":
            # Fallback to old name for NYC
            model_path = os.path.join(models_dir, "active_model.pkl")

        if os.path.exists(model_path):
            try:
                bundle = joblib.load(model_path)
                _active_models[city_code] = bundle
                version = bundle.get("version", "xgb_v1.0")
                logger.info(f"Model loaded for {city_code}: {version} from {model_path}")
                loaded_any = True
            except Exception as e:
                logger.error(f"Failed to load model for {city_code}: {e}")

    if not loaded_any:
        logger.warning("No trained models found. Using stub predictions.")

    return loaded_any


def reload_model() -> bool:
    """Force reload the model (called after training/promotion)."""
    return load_model()


def _get_city_for_coords(lat: float, lng: float) -> str:
    """Identify which city configuration to use based on coordinates."""
    for city_code, config in settings.CITIES.items():
        b = config["bounds"]
        if b["lat_min"] <= lat <= b["lat_max"] and b["lng_min"] <= lng <= b["lng_max"]:
            return city_code
    return settings.DEFAULT_CITY

def predict(
    pickup_lat: float,
    pickup_lng: float,
    dropoff_lat: float,
    dropoff_lng: float,
    pickup_datetime_str: str,
) -> tuple[int, float, str, str, str]:
    """
    Run inference on a single trip.

    Returns:
        (predicted_seconds, predicted_fare, model_version, confidence, city_code)
    """
    city_code = _get_city_for_coords(pickup_lat, pickup_lng)
    city_config = settings.CITIES.get(city_code)
    
    if city_code in _active_models:
        try:
            bundle = _active_models[city_code]
            seconds, fare, version, confidence = _predict_with_model(
                pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, pickup_datetime_str, city_config, bundle
            )
            return seconds, fare, version, confidence, city_code
        except Exception as e:
            logger.error(f"Model prediction failed for {city_code}: {e}. Falling back to stub.")

    # Stub fallback: haversine-based estimate
    seconds, fare = _stub_predict(pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, city_config)
    return seconds, fare, "stub_v0.1", "Low (stub)", city_code


def _predict_with_model(
    pickup_lat: float,
    pickup_lng: float,
    dropoff_lat: float,
    dropoff_lng: float,
    pickup_datetime_str: str,
    city_config: dict,
    bundle: dict
) -> tuple[int, float, str, str]:
    """Run prediction using the loaded XGBoost pipeline."""
    model_duration = bundle.get("model_duration", bundle.get("model"))
    model_fare = bundle.get("model_fare")
    cluster_encoder = bundle["cluster_encoder"]
    feature_columns = bundle["feature_columns"]
    version = bundle.get("version", "unknown")

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

    # Predict Duration (Base NYC pattern)
    predicted_dur = model_duration.predict(X)
    raw_seconds = max(int(predicted_dur[0]), 60)
    
    # Adjust for local city traffic
    seconds = int(raw_seconds * city_config.get("traffic_multiplier", 1.0))

    # Predict/Calculate Fare
    # We use local city pricing tokens instead of purely relying on NYC model output
    distance_km = haversine_distance(pickup_lat, pickup_lng, dropoff_lat, dropoff_lng)
    pricing = city_config["pricing"]
    
    # Calculate fare: Base + (Dist * Rate) + (Time * Rate)
    fare = pricing["base_fare"] + (distance_km * pricing["per_km"]) + ((seconds / 60) * pricing["per_min"])

    # Confidence based on how typical the trip is
    distance = distance_km
    if distance < 30 and seconds < 5400:
        confidence = "High"
    elif distance < 50:
        confidence = "Medium"
    else:
        confidence = "Low"

    return seconds, fare, version, confidence


def _stub_predict(
    pickup_lat: float,
    pickup_lng: float,
    dropoff_lat: float,
    dropoff_lng: float,
    city_config: dict
) -> tuple[int, float]:
    """Haversine-based stub prediction (before model is trained)."""
    distance_km = haversine_distance(pickup_lat, pickup_lng, dropoff_lat, dropoff_lng)
    
    # Base estimated speed ~25 km/h, adjusted by city multiplier
    avg_speed = 25 / city_config.get("traffic_multiplier", 1.0)
    estimated_seconds = int((distance_km / avg_speed) * 3600)
    seconds = max(estimated_seconds, 120)
    
    pricing = city_config["pricing"]
    fare = pricing["base_fare"] + (distance_km * pricing["per_km"]) + ((seconds / 60) * pricing["per_min"])
    
    return seconds, fare


def get_model_version(city_code: str = "NYC") -> str:
    """Get the version string of the active model for a given city."""
    if city_code in _active_models:
        return _active_models[city_code].get("version", "unknown")
    return "stub_v0.1"


# Load model on module import
load_model()
