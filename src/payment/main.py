"""FastAPI application entry point for the PSP (Payment Service Provider)."""

import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.payment.api.routes.payments import router as payments_router
from src.payment.config import get_payment_settings
from src.payment.db.database import init_payment_tables

settings = get_payment_settings()

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan context manager.

    Initializes the database tables on startup.

    Args:
        _app: FastAPI application instance (unused but required by protocol).

    Yields:
        None
    """
    # Initialize PSP tables (and merchant tables for foreign key support)
    from src.merchant.db import init_and_seed_db

    init_and_seed_db()  # Initialize merchant tables with seed data
    init_payment_tables()  # Initialize PSP-specific tables
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="PSP Delegated Payments for Agentic Commerce",
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
app.include_router(payments_router)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    """Health check endpoint.

    Returns:
        A dictionary with status "ok".
    """
    return {"status": "ok"}
