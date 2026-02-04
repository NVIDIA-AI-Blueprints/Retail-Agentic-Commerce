"""FastAPI application entry point for the Agentic Commerce middleware."""

import logging
import sys
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.merchant.api.routes.checkout import router as checkout_router
from src.merchant.api.routes.health import router as health_router
from src.merchant.api.routes.products import router as products_router
from src.merchant.api.routes.ucp.checkout import router as ucp_checkout_router
from src.merchant.api.routes.ucp.discovery import router as ucp_discovery_router
from src.merchant.config import get_settings
from src.merchant.db import init_and_seed_db
from src.merchant.middleware import ACPHeadersMiddleware, RequestLoggingMiddleware

settings = get_settings()


def configure_logging() -> None:
    """Configure application logging with proper levels and formatting.

    Sets up structured logging with:
    - Configurable log level via LOG_LEVEL env var
    - Suppressed verbose SQLAlchemy/uvicorn logs unless LOG_SQL=true
    - Clean, readable format for traceability
    """
    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)

    # Root logger configuration
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        stream=sys.stdout,
        force=True,  # Override any existing configuration
    )

    # Suppress noisy loggers unless explicitly requested
    if not settings.log_sql:
        # SQLAlchemy engine logs every SQL statement - very noisy
        logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
        logging.getLogger("sqlalchemy.pool").setLevel(logging.WARNING)

    # Reduce uvicorn access log noise (it duplicates our middleware logs)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

    # Keep uvicorn error logs visible
    logging.getLogger("uvicorn.error").setLevel(log_level)

    # Our application loggers at configured level
    logging.getLogger("agentic_commerce").setLevel(log_level)
    logging.getLogger("src.merchant").setLevel(log_level)


configure_logging()


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

# Add ACP headers middleware (handles Request-Id, Idempotency-Key)
app.add_middleware(ACPHeadersMiddleware)

# Add request/response logging middleware
app.add_middleware(RequestLoggingMiddleware)

# Include routers
app.include_router(health_router)
app.include_router(checkout_router)
app.include_router(products_router)
app.include_router(ucp_discovery_router)
app.include_router(ucp_checkout_router)
