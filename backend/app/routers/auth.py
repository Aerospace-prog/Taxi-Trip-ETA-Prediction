from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import LoginResponse, RegisterRequest
from app.services.auth_service import verify_password, create_access_token, hash_password

router = APIRouter(tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Authenticate user and return JWT access token (Supports Swagger Login)."""
    # Swagger uses 'username' field, which maps to our 'email'
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token({"sub": user.email, "role": user.role})

    return LoginResponse(
        access_token=token,
        role=user.role,
    )


@router.post("/register", response_model=LoginResponse)
def register(
    body: RegisterRequest,
    db: Session = Depends(get_db)
):
    """Register a new dispatcher user."""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == body.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create new user
    new_user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        role="dispatcher"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate token
    token = create_access_token({"sub": new_user.email, "role": new_user.role})

    return LoginResponse(
        access_token=token,
        role=new_user.role,
    )
