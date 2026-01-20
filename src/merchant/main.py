"""FastAPI application entry point for the Agentic Commerce middleware."""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.merchant.api.routes.checkout import router as checkout_router
from src.merchant.api.routes.health import router as health_router
from src.merchant.config import get_settings
from src.merchant.db import init_and_seed_db

settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan context manager.

    Initializes the database and seeds data on startup.

    Args:
        _app: FastAPI application instance (unused but required by protocol).

    Yields:
        None
    """
    init_and_seed_db()
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Agentic Commerce Protocol Reference Architecture",
    lifespan=lifespan,
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
app.include_router(checkout_router)
