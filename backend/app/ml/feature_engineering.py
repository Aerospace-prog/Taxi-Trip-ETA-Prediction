"""
Feature engineering pipeline for taxi trip duration prediction.

Transforms raw trip data into ML-ready features:
- Haversine distance between pickup/dropoff
- Time features (hour, day_of_week, is_weekend)
- KMeans cluster encoding for pickup/dropoff locations
"""

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.cluster import KMeans


def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calculate great-circle distance between two points (in km).
    Accepts scalar or array inputs.
    """
    R = 6371  # Earth radius in km
    lat1, lat2 = np.radians(lat1), np.radians(lat2)
    dlat = lat2 - lat1
    dlng = np.radians(lng2 - lng1)

    a = np.sin(dlat / 2) ** 2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlng / 2) ** 2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
    return R * c


class TimeFeatureExtractor(BaseEstimator, TransformerMixin):
    """Extract time-based features from pickup_datetime."""

    def fit(self, X, y=None):
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        df = X.copy()
        dt = pd.to_datetime(df["pickup_datetime"])
        df["hour"] = dt.dt.hour
        df["day_of_week"] = dt.dt.dayofweek
        df["is_weekend"] = dt.dt.dayofweek.isin([5, 6]).astype(int)
        df["month"] = dt.dt.month
        return df


class DistanceCalculator(BaseEstimator, TransformerMixin):
    """Calculate haversine distance between pickup and dropoff."""

    def fit(self, X, y=None):
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        df = X.copy()
        df["haversine_distance_km"] = haversine_distance(
            df["pickup_latitude"],
            df["pickup_longitude"],
            df["dropoff_latitude"],
            df["dropoff_longitude"],
        )
        return df


class LocationClusterEncoder(BaseEstimator, TransformerMixin):
    """Encode pickup/dropoff locations into KMeans cluster IDs."""

    def __init__(self, n_clusters: int = 20):
        self.n_clusters = n_clusters
        self.pickup_kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        self.dropoff_kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)

    def fit(self, X: pd.DataFrame, y=None):
        pickup_coords = X[["pickup_latitude", "pickup_longitude"]].values
        dropoff_coords = X[["dropoff_latitude", "dropoff_longitude"]].values

        self.pickup_kmeans.fit(pickup_coords)
        self.dropoff_kmeans.fit(dropoff_coords)
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        df = X.copy()
        pickup_coords = df[["pickup_latitude", "pickup_longitude"]].values
        dropoff_coords = df[["dropoff_latitude", "dropoff_longitude"]].values

        df["pickup_cluster_id"] = self.pickup_kmeans.predict(pickup_coords)
        df["dropoff_cluster_id"] = self.dropoff_kmeans.predict(dropoff_coords)
        return df


# The final feature columns used for model training
FEATURE_COLUMNS = [
    "pickup_cluster_id",
    "dropoff_cluster_id",
    "hour",
    "day_of_week",
    "is_weekend",
    "month",
    "haversine_distance_km",
    "trip_distance",
]


def build_features(df: pd.DataFrame, cluster_encoder: LocationClusterEncoder = None, fit: bool = False):
    """
    Full feature engineering pipeline.

    Args:
        df: Raw dataframe with pickup/dropoff lat/lng, pickup_datetime
        cluster_encoder: Pre-fitted LocationClusterEncoder (None = create new)
        fit: If True, fit the cluster encoder on this data

    Returns:
        (feature_df, cluster_encoder)  features ready for model + fitted encoder
    """
    # Time features
    time_extractor = TimeFeatureExtractor()
    df = time_extractor.transform(df)

    # Distance
    distance_calc = DistanceCalculator()
    df = distance_calc.transform(df)

    # Location clusters
    if cluster_encoder is None:
        cluster_encoder = LocationClusterEncoder(n_clusters=20)

    if fit:
        cluster_encoder.fit(df)

    df = cluster_encoder.transform(df)

    # Select only the final feature columns (skip any that don't exist)
    available_features = [col for col in FEATURE_COLUMNS if col in df.columns]
    return df[available_features], cluster_encoder
