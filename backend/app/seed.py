"""
Seed script to create initial admin and dispatcher users.

Run inside Docker:
    docker-compose exec backend python -m app.seed
"""

from app.database import SessionLocal
from app.models.user import User
from app.models.model_metadata import ModelMetadata
from app.services.auth_service import hash_password


def seed():
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).first():
        print("Users already exist. Skipping seed.")
        db.close()
        return

    # Create admin user
    admin = User(
        email="admin@taxipredict.ai",
        password_hash=hash_password("admin123"),
        role="admin",
    )

    # Create dispatcher user
    dispatcher = User(
        email="dispatcher@taxipredict.ai",
        password_hash=hash_password("dispatch123"),
        role="dispatcher",
    )

    db.add_all([admin, dispatcher])

    # Seed a stub model_metadata so predictions can reference it
    stub_model = ModelMetadata(
        version="stub_v0.1",
        mae=None,
        rmse=None,
        r2_score=None,
        status="active",
        artifact_path="/app/models/stub",
    )
    db.add(stub_model)

    db.commit()
    print("Seeded: admin@taxipredict.ai (admin123), dispatcher@taxipredict.ai (dispatch123)")
    print("Seeded: stub_v0.1 model metadata (active)")
    db.close()


if __name__ == "__main__":
    seed()
