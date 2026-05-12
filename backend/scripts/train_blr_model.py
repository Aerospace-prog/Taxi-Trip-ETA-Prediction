import sys
import os
import time

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.ml.train_pipeline import train_model
from app.database import SessionLocal
from app.models.model_metadata import ModelMetadata
from app.models.training_job import TrainingJob
import uuid

def main():
    print("Starting Bengaluru Model Training...")
    
    file_path = "/app/data/ct_rr.csv"
    version = f"xgb_BLR_v{int(time.time())}"
    job_id = f"TRN-{uuid.uuid4().hex[:8].upper()}"
    
    db = SessionLocal()
    
    # 1. Create a job record
    job = TrainingJob(
        job_id=job_id,
        dataset_name="ct_rr.csv",
        city_code="BLR",
        status="running",
        progress_percent=10
    )
    db.add(job)
    db.commit()
    
    try:
        # 2. Run the actual training using 200,000 samples to keep it fast
        print(f"Executing train_model for city BLR, version {version}")
        result = train_model(
            file_path=file_path,
            output_dir="/app/models",
            version=version,
            sample_size=200000,
            city_code="BLR"
        )
        
        print("Training complete! Metrics:", result["metrics"])
        
        # 3. Create active ModelMetadata immediately
        metadata = ModelMetadata(
            version=result["version"],
            city_code="BLR",
            mae=result["metrics"]["duration"]["mae"],
            rmse=result["metrics"]["duration"]["rmse"],
            r2_score=result["metrics"]["duration"]["r2"],
            status="active",
            artifact_path=result["artifact_path"]
        )
        
        # Archive any existing active BLR models
        db.query(ModelMetadata).filter(
            ModelMetadata.status == "active",
            ModelMetadata.city_code == "BLR"
        ).update({"status": "archive"})
        
        db.add(metadata)
        
        # 4. Mark job completed
        job.status = "completed"
        job.progress_percent = 100
        db.commit()
        
        print("Successfully trained and activated the BLR model!")
        
    except Exception as e:
        print(f"Error during training: {e}")
        job.status = "failed"
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    main()
