from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import auth, predict, metrics, retrain

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="ML-powered Taxi Trip Duration Prediction API",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS – allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.(vercel\.app|netlify\.app)",
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://taxi-predict.duckdns.org",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(predict.router)
app.include_router(metrics.router)
app.include_router(retrain.router)


@app.get("/health", tags=["System"])
def health_check():
    """Health check endpoint for Docker and load balancer."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


@app.get("/", tags=["System"])
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "docs": "/docs",
    }

