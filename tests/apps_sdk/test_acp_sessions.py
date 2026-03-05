"""Tests for shared ACP session helpers used by Apps SDK."""

from __future__ import annotations

from typing import Any
from unittest.mock import patch

import pytest

from src.apps_sdk.tools.acp_sessions import create_acp_session


@pytest.fixture(autouse=True)
def mock_checkout_http_client() -> None:
    """Override global checkout HTTP mock for this module."""
    # tests/apps_sdk/conftest.py patches AsyncClient.__aenter__ to always raise.
    # These tests need to exercise real request/response handling paths.
    return None


class _MockResponse:
    def __init__(self, status_code: int, payload: dict[str, Any]) -> None:
        self.status_code = status_code
        self._payload = payload
        self.text = ""

    def json(self) -> dict[str, Any]:
        return self._payload


@pytest.mark.asyncio
async def test_create_acp_session_emits_promotion_signals() -> None:
    """Forwards promotion signals to SSE so price position is deterministic."""
    merchant_response = {
        "id": "cs_test_123",
        "line_items": [
            {
                "id": "li_1",
                "item": {"id": "prod_16", "quantity": 1},
                "name": "Leather Loafers",
                "base_amount": 8500,
                "discount": 850,
                "promotion": {
                    "action": "DISCOUNT_10_PCT",
                    "reason_codes": [
                        "HIGH_INVENTORY",
                        "CLEARANCE",
                        "DEMAND_DECELERATING",
                    ],
                    "reasoning": "Test reasoning",
                    "stock_count": 25,
                    "signals": {
                        "inventory_pressure": "low",
                        "competition_position": "above_market",
                        "seasonal_urgency": "off_season",
                        "product_lifecycle": "clearance",
                        "demand_velocity": "decelerating",
                    },
                },
            }
        ],
        "totals": [],
    }

    class _MockAsyncClient:
        def __init__(self, *_args: Any, **_kwargs: Any) -> None:
            pass

        async def __aenter__(self) -> _MockAsyncClient:
            return self

        async def __aexit__(
            self,
            _exc_type: type[BaseException] | None,
            _exc: BaseException | None,
            _tb: Any,
        ) -> None:
            return None

        async def post(self, *_args: Any, **_kwargs: Any) -> _MockResponse:
            return _MockResponse(201, merchant_response)

    with (
        patch("src.apps_sdk.tools.acp_sessions.httpx.AsyncClient", _MockAsyncClient),
        patch(
            "src.apps_sdk.tools.acp_sessions.emit_agent_activity_event"
        ) as emit_agent,
    ):
        result = await create_acp_session(items=[{"id": "prod_16", "quantity": 1}])

    assert result["id"] == "cs_test_123"
    emit_agent.assert_called_once()
    assert emit_agent.call_args.kwargs["signals"] == {
        "inventory_pressure": "low",
        "competition_position": "above_market",
        "seasonal_urgency": "off_season",
        "product_lifecycle": "clearance",
        "demand_velocity": "decelerating",
    }
