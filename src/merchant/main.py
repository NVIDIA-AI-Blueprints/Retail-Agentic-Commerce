"""FastAPI application entry point for the Agentic Commerce middleware."""

import logging
import sys
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import Response

from a2a.server.apps import A2AStarletteApplication
from a2a.server.request_handlers import DefaultRequestHandler
from a2a.server.tasks import InMemoryTaskStore

from src.merchant.api.dependencies import verify_api_key
from src.merchant.api.routes.health import router as health_router
from src.merchant.api.routes.metrics import router as metrics_router
from src.merchant.api.routes.products import router as products_router
from src.merchant.config import get_settings
from src.merchant.db import init_and_seed_db
from src.merchant.middleware import ACPHeadersMiddleware, RequestLoggingMiddleware
from src.merchant.protocols.acp.api.routes.checkout import router as checkout_router
from src.merchant.protocols.ucp.api.routes.discovery import (
    router as ucp_discovery_router,
)
from src.merchant.protocols.ucp.services.agent_executor import (
    UCPCheckoutAgentExecutor,
    build_sdk_agent_card,
)

settings = get_settings()


def configure_logging() -> None:
    """Configure application logging with proper levels and formatting."""
    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)

    logging.basicConfig(
        level=log_level,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        stream=sys.stdout,
        force=True,
    )

    if not settings.log_sql:
        logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
        logging.getLogger("sqlalchemy.pool").setLevel(logging.WARNING)

    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(log_level)
    logging.getLogger("agentic_commerce").setLevel(log_level)
    logging.getLogger("src.merchant").setLevel(log_level)


configure_logging()


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan context manager."""
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
app.include_router(metrics_router)
app.include_router(products_router)
app.include_router(ucp_discovery_router)

# ---------------------------------------------------------------------------
# UCP A2A: SDK transport stack
# ---------------------------------------------------------------------------

_agent_card = build_sdk_agent_card(settings.ucp_base_url or "http://localhost:8000")
_handler = DefaultRequestHandler(
    agent_executor=UCPCheckoutAgentExecutor(),
    task_store=InMemoryTaskStore(),
)
_a2a_app = A2AStarletteApplication(agent_card=_agent_card, http_handler=_handler)


@app.post(
    "/a2a",
    summary="A2A JSON-RPC 2.0 Endpoint",
    description="Handles UCP checkout operations via A2A message/send.",
    dependencies=[Depends(verify_api_key)],
)
async def a2a_rpc(request: Request) -> Response:
    """Delegate JSON-RPC handling to the SDK transport stack."""
    return await _a2a_app._handle_requests(request)


@app.get(
    "/.well-known/agent-card.json",
    summary="A2A Agent Card Discovery",
    description="Returns the A2A Agent Card for this merchant agent. Public endpoint.",
)
async def agent_card_endpoint(request: Request) -> Response:
    """Return SDK-built A2A Agent Card for discovery."""
    return await _a2a_app._handle_get_agent_card(request)
