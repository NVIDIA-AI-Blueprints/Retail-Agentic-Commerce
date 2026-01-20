"""FastAPI application entry point for the Agentic Commerce middleware."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.merchant.api.routes.health import router as health_router
from src.merchant.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Agentic Commerce Protocol Reference Architecture",
)

# Configure CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.debug else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)
