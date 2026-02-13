"""A2A Agent Card discovery endpoint.

Returns the Agent Card document used by platforms to discover this
business agent's A2A capabilities and UCP extension support.

This is a public endpoint (no API key required) since platforms need
to fetch the agent card before establishing authenticated sessions.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Request

from src.merchant.config import get_settings
from src.merchant.protocols.ucp.services.a2a_transport import build_agent_card

router = APIRouter(tags=["ucp-a2a"])


@router.get(
    "/.well-known/agent-card.json",
    summary="A2A Agent Card Discovery",
    description="Returns the A2A Agent Card for this merchant agent. Public endpoint.",
)
async def get_agent_card(request: Request) -> dict[str, Any]:
    """Return dynamically-built A2A Agent Card for discovery."""
    settings = get_settings()
    base_url = settings.ucp_base_url or str(request.base_url).rstrip("/")
    return build_agent_card(base_url)
