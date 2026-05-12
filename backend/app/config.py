from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    APP_NAME: str = "Taxi Trip Duration Predictor"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql://taxi:securepass@db:5432/taxi_eta"

    # JWT Auth
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ML Model
    MODEL_PATH: str = "/app/models/active_model.pkl"

    # Multi-City Configuration
    DEFAULT_CITY: str = "NYC"
    CITIES: dict = {
        "NYC": {
            "name": "New York City",
            "currency": "USD",
            "currency_symbol": "$",
            "bounds": {
                "lat_min": 40.5,
                "lat_max": 41.0,
                "lng_min": -74.3,
                "lng_max": -73.7,
            },
            "pricing": {
                "base_fare": 2.50,
                "per_km": 1.56,
                "per_min": 0.50,
            },
            "traffic_multiplier": 1.0
        },
        "BLR": {
            "name": "Bengaluru",
            "currency": "INR",
            "currency_symbol": "₹",
            "bounds": {
                "lat_min": 12.7,
                "lat_max": 13.2,
                "lng_min": 77.4,
                "lng_max": 77.8,
            },
            "pricing": {
                "base_fare": 30.0,
                "per_km": 15.0,
                "per_min": 2.0,
            },
            "traffic_multiplier": 1.6
        }
    }

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
