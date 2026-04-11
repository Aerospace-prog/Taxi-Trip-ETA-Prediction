"""
CLI script to train the initial model from downloaded data.

Run inside Docker:
    docker-compose exec backend python -m app.ml.train_cli
"""

import sys
import os
import logging

# Add parent dir to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

from app.ml.train_pipeline import train_model
from app.database import SessionLocal
from app.models.model_metadata import ModelMetadata


def main():
    # Find dataset
    data_dir = "/app/data"
    parquet_files = [f for f in os.listdir(data_dir) if f.endswith(".parquet")]
    csv_files = [f for f in os.listdir(data_dir) if f.endswith(".csv") and "zone" not in f.lower()]

    if parquet_files:
        file_path = os.path.join(data_dir, parquet_files[0])
        print(f"Using parquet: {file_path}")
    elif csv_files:
        file_path = os.path.join(data_dir, csv_files[0])
        print(f"Using CSV: {file_path}")
    else:
        print("No training data found in /app/data/")
        return

    # Train
    result = train_model(
        file_path=file_path,
        output_dir="/app/models",
        version="xgb_v1.0",
        sample_size=200000,
    )

    print(f"\n{'='*50}")
    print(f"Training Complete!")
    print(f"MAE:  {result['mae']}s")
    print(f"RMSE: {result['rmse']}s")
    print(f"R²:   {result['r2_score']}")
    print(f"Time: {result['training_time_seconds']}s")
    print(f"{'='*50}")

    # Save metadata to DB
    db = SessionLocal()
    try:
        metadata = ModelMetadata(
            version=result["version"],
            mae=result["mae"],
            rmse=result["rmse"],
            r2_score=result["r2_score"],
            status="active",
            artifact_path=result["artifact_path"],
        )
        # Archive any existing active models
        db.query(ModelMetadata).filter(ModelMetadata.status == "active").update({"status": "archive"})
        db.add(metadata)
        db.commit()
        print(f"Model metadata saved as 'active' in DB")
    finally:
        db.close()


if __name__ == "__main__":
    main()
