"""Health check endpoint for the Agentic Commerce middleware."""

from typing import TypedDict

from fastapi import APIRouter

from src.merchant.config import get_settings

router = APIRouter(tags=["health"])


class HealthResponse(TypedDict):
    """Health check response schema."""

    status: str
    version: str


@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    """Return the health status of the application.

    Returns:
        HealthResponse: A dictionary containing status and version.
    """
    settings = get_settings()
    return HealthResponse(
        status="healthy",
        version=settings.app_version,
    )
