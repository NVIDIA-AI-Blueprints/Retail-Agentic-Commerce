"""Tests for UCP A2A (Agent-to-Agent) JSON-RPC 2.0 transport endpoint."""

from __future__ import annotations

import uuid
from typing import Any
from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient

from src.merchant.config import get_settings
from src.merchant.db.database import reset_engine
from src.merchant.services.a2a import (
    A2A_UCP_EXTENSION_URL,
    clear_context_sessions,
)
from src.merchant.services.idempotency import reset_idempotency_store
from src.merchant.services.ucp import clear_profile_cache

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(autouse=True)
def _reset_state() -> None:
    """Clear per-test state: profile cache, context sessions, idempotency."""
    clear_profile_cache()
    clear_context_sessions()
    reset_idempotency_store()


@pytest.fixture(autouse=True)
def _use_temp_database(tmp_path, monkeypatch) -> None:
    db_path = tmp_path / "ucp_a2a_test.db"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")
    get_settings.cache_clear()
    reset_engine()
    yield
    reset_engine()
    get_settings.cache_clear()


@pytest.fixture
def platform_profile() -> dict[str, Any]:
    return {
        "ucp": {
            "version": get_settings().ucp_version,
            "capabilities": {
                "dev.ucp.shopping.checkout": [{"version": get_settings().ucp_version}]
            },
        }
    }


@pytest.fixture
def mock_platform_profile(monkeypatch, platform_profile) -> None:
    async def _mock_fetch(_url: str) -> dict[str, Any]:
        return platform_profile

    monkeypatch.setattr("src.merchant.services.a2a.fetch_platform_profile", _mock_fetch)


@pytest.fixture
def a2a_headers() -> dict[str, str]:
    return {
        "UCP-Agent": 'profile="https://platform.example/profile"',
        "X-A2A-Extensions": A2A_UCP_EXTENSION_URL,
    }


def _make_request(
    action: str,
    data: dict[str, Any] | None = None,
    context_id: str | None = None,
    message_id: str | None = None,
    extra_parts: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Build a minimal A2A JSON-RPC request for a checkout action."""
    action_data = {"action": action}
    if data:
        action_data.update(data)
    parts: list[dict[str, Any]] = [{"type": "data", "data": action_data}]
    if extra_parts:
        parts.extend(extra_parts)
    message: dict[str, Any] = {
        "role": "user",
        "messageId": message_id or str(uuid.uuid4()),
        "kind": "message",
        "parts": parts,
    }
    if context_id:
        message["contextId"] = context_id
    return {
        "jsonrpc": "2.0",
        "id": str(uuid.uuid4()),
        "method": "message/send",
        "params": {"message": message},
    }


# ===========================================================================
# 1. JSON-RPC Envelope Validation
# ===========================================================================


class TestJsonRpcEnvelope:
    def test_malformed_json_returns_parse_error(self, auth_client: TestClient) -> None:
        response = auth_client.post(
            "/a2a", content=b"not-json", headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        assert response.json()["error"]["code"] == -32700

    def test_missing_jsonrpc_field_returns_invalid_request(
        self, auth_client: TestClient, a2a_headers: dict[str, str]
    ) -> None:
        response = auth_client.post(
            "/a2a",
            json={"id": "1", "method": "message/send"},
            headers=a2a_headers,
        )
        assert response.json()["error"]["code"] == -32600

    def test_missing_id_field_returns_invalid_request(
        self, auth_client: TestClient, a2a_headers: dict[str, str]
    ) -> None:
        response = auth_client.post(
            "/a2a",
            json={"jsonrpc": "2.0", "method": "message/send"},
            headers=a2a_headers,
        )
        assert response.json()["error"]["code"] == -32600

    def test_wrong_method_returns_method_not_found(
        self, auth_client: TestClient, a2a_headers: dict[str, str]
    ) -> None:
        response = auth_client.post(
            "/a2a",
            json={"jsonrpc": "2.0", "id": "1", "method": "tasks/create"},
            headers=a2a_headers,
        )
        assert response.json()["error"]["code"] == -32601


# ===========================================================================
# 2. Required Header Validation
# ===========================================================================


class TestHeaderValidation:
    def test_missing_ucp_agent_returns_invalid_params(
        self, auth_client: TestClient
    ) -> None:
        request = _make_request("create_checkout", {"product_id": "prod_1"})
        response = auth_client.post(
            "/a2a",
            json=request,
            headers={"X-A2A-Extensions": A2A_UCP_EXTENSION_URL},
        )
        body = response.json()
        assert body["error"]["code"] == -32602
        assert "UCP-Agent" in body["error"]["data"]["detail"]

    def test_missing_x_a2a_extensions_returns_invalid_params(
        self, auth_client: TestClient
    ) -> None:
        request = _make_request("create_checkout", {"product_id": "prod_1"})
        response = auth_client.post(
            "/a2a",
            json=request,
            headers={"UCP-Agent": 'profile="https://platform.example/p"'},
        )
        body = response.json()
        assert body["error"]["code"] == -32602
        assert "X-A2A-Extensions" in body["error"]["data"]["detail"]

    def test_wrong_extension_uri_returns_invalid_params(
        self, auth_client: TestClient
    ) -> None:
        request = _make_request("create_checkout", {"product_id": "prod_1"})
        response = auth_client.post(
            "/a2a",
            json=request,
            headers={
                "UCP-Agent": 'profile="https://platform.example/p"',
                "X-A2A-Extensions": "https://other.dev/wrong",
            },
        )
        body = response.json()
        assert body["error"]["code"] == -32602

    def test_unauthenticated_request_returns_401(
        self, client: TestClient, a2a_headers: dict[str, str]
    ) -> None:
        request = _make_request("create_checkout", {"product_id": "prod_1"})
        response = client.post("/a2a", json=request, headers=a2a_headers)
        assert response.status_code == 401


# ===========================================================================
# 3. Checkout Actions (happy path)
# ===========================================================================


class TestCheckoutActions:
    @pytest.mark.usefixtures("mock_platform_profile")
    def test_create_checkout(
        self, auth_client: TestClient, a2a_headers: dict[str, str]
    ) -> None:
        request = _make_request("create_checkout", {"product_id": "prod_1"})
        response = auth_client.post("/a2a", json=request, headers=a2a_headers)

        body = response.json()
        assert "error" not in body
        result = body["result"]
        assert result["role"] == "agent"
        assert result["kind"] == "message"
        assert "contextId" in result

        checkout = result["parts"][0]["data"]["a2a.ucp.checkout"]
        assert checkout["status"] == "incomplete"
        assert checkout["id"]
        assert checkout["ucp"]["payment_handlers"] is not None
        assert "com.example.processor_tokenizer" in checkout["ucp"]["payment_handlers"]

    @pytest.mark.usefixtures("mock_platform_profile")
    def test_create_checkout_with_buyer_starts_incomplete(
        self, auth_client: TestClient, a2a_headers: dict[str, str]
    ) -> None:
        request = _make_request(
            "create_checkout",
            {
                "product_id": "prod_1",
                "buyer": {
                    "first_name": "John",
                    "last_name": "Doe",
                    "email": "john@example.com",
                },
                "fulfillment_address": {
                    "name": "John Doe",
                    "line_one": "123 Main St",
                    "city": "San Francisco",
                    "state": "CA",
                    "country": "US",
                    "postal_code": "94102",
                },
            },
        )
        response = auth_client.post("/a2a", json=request, headers=a2a_headers)

        body = response.json()
        assert "error" not in body
        checkout = body["result"]["parts"][0]["data"]["a2a.ucp.checkout"]
        # A newly created checkout remains incomplete until fulfillment option
        # selection/update advances readiness for completion.
        assert checkout["status"] == "incomplete"

    @pytest.mark.usefixtures("mock_platform_profile")
    def test_get_checkout(
        self, auth_client: TestClient, a2a_headers: dict[str, str]
    ) -> None:
        # Create first
        create_req = _make_request("create_checkout", {"product_id": "prod_1"})
        create_resp = auth_client.post("/a2a", json=create_req, headers=a2a_headers)
        ctx = create_resp.json()["result"]["contextId"]

        # Get
        get_req = _make_request("get_checkout", context_id=ctx)
        get_resp = auth_client.post("/a2a", json=get_req, headers=a2a_headers)

        body = get_resp.json()
        assert "error" not in body
        checkout = body["result"]["parts"][0]["data"]["a2a.ucp.checkout"]
        assert checkout["id"]

    @pytest.mark.usefixtures("mock_platform_profile")
    def test_add_to_checkout(
        self, auth_client: TestClient, a2a_headers: dict[str, str]
    ) -> None:
        # Create
        create_req = _make_request("create_checkout", {"product_id": "prod_1"})
        create_resp = auth_client.post("/a2a", json=create_req, headers=a2a_headers)
        ctx = create_resp.json()["result"]["contextId"]

        # Add another product
        add_req = _make_request(
            "add_to_checkout",
            {"product_id": "prod_2", "quantity": 2},
            context_id=ctx,
        )
        add_resp = auth_client.post("/a2a", json=add_req, headers=a2a_headers)

        body = add_resp.json()
        assert "error" not in body
        checkout = body["result"]["parts"][0]["data"]["a2a.ucp.checkout"]
        assert len(checkout["line_items"]) == 2

    @pytest.mark.usefixtures("mock_platform_profile")
    def test_cancel_checkout(
        self, auth_client: TestClient, a2a_headers: dict[str, str]
    ) -> None:
        create_req = _make_request("create_checkout", {"product_id": "prod_1"})
        create_resp = auth_client.post("/a2a", json=create_req, headers=a2a_headers)
        ctx = create_resp.json()["result"]["contextId"]

        cancel_req = _make_request("cancel_checkout", context_id=ctx)
        cancel_resp = auth_client.post("/a2a", json=cancel_req, headers=a2a_headers)

        body = cancel_resp.json()
        assert "error" not in body
        checkout = body["result"]["parts"][0]["data"]["a2a.ucp.checkout"]
        assert checkout["status"] == "canceled"

    def test_complete_checkout_uses_negotiated_ucp_order_webhook_url(
        self, auth_client: TestClient, a2a_headers: dict[str, str], monkeypatch
    ) -> None:
        async def _mock_fetch(_url: str) -> dict[str, Any]:
            return {
                "ucp": {
                    "version": get_settings().ucp_version,
                    "capabilities": {
                        "dev.ucp.shopping.checkout": [
                            {"version": get_settings().ucp_version}
                        ],
                        "dev.ucp.shopping.order": [
                            {
                                "version": get_settings().ucp_version,
                                "config": {
                                    "webhook_url": "http://platform.example/webhooks/ucp-order"
                                },
                            }
                        ],
                    },
                }
            }

        monkeypatch.setattr(
            "src.merchant.services.a2a.fetch_platform_profile", _mock_fetch
        )
        post_purchase_mock = AsyncMock()
        monkeypatch.setattr(
            "src.merchant.services.a2a.trigger_post_purchase_flow_ucp",
            post_purchase_mock,
        )

        create_req = _make_request(
            "create_checkout",
            {
                "product_id": "prod_1",
                "buyer": {
                    "first_name": "John",
                    "last_name": "Doe",
                    "email": "john@example.com",
                },
                "fulfillment_address": {
                    "name": "John Doe",
                    "line_one": "123 Main St",
                    "city": "San Francisco",
                    "state": "CA",
                    "country": "US",
                    "postal_code": "94102",
                },
            },
        )
        create_resp = auth_client.post("/a2a", json=create_req, headers=a2a_headers)
        ctx = create_resp.json()["result"]["contextId"]

        complete_req = _make_request(
            "complete_checkout",
            context_id=ctx,
            extra_parts=[
                {
                    "type": "data",
                    "data": {
                        "a2a.ucp.checkout.payment": {
                            "instruments": [
                                {
                                    "type": "tokenized_card",
                                    "handler_id": "processor_tokenizer",
                                    "credential": {"token": "vt_test_123"},
                                }
                            ]
                        }
                    },
                }
            ],
        )
        complete_resp = auth_client.post("/a2a", json=complete_req, headers=a2a_headers)

        body = complete_resp.json()
        assert "error" not in body
        checkout = body["result"]["parts"][0]["data"]["a2a.ucp.checkout"]
        assert checkout["status"] == "completed"
        assert post_purchase_mock.await_count == 1
        assert (
            post_purchase_mock.await_args.kwargs["webhook_url"]
            == "http://platform.example/webhooks/ucp-order"
        )

    def test_complete_checkout_uses_fallback_ucp_order_webhook_url(
        self, auth_client: TestClient, a2a_headers: dict[str, str], monkeypatch
    ) -> None:
        monkeypatch.setenv(
            "UCP_ORDER_WEBHOOK_URL", "http://fallback.example/webhooks/ucp-order"
        )
        get_settings.cache_clear()

        async def _mock_fetch(_url: str) -> dict[str, Any]:
            return {
                "ucp": {
                    "version": get_settings().ucp_version,
                    "capabilities": {
                        "dev.ucp.shopping.checkout": [
                            {"version": get_settings().ucp_version}
                        ]
                    },
                }
            }

        monkeypatch.setattr(
            "src.merchant.services.a2a.fetch_platform_profile", _mock_fetch
        )
        post_purchase_mock = AsyncMock()
        monkeypatch.setattr(
            "src.merchant.services.a2a.trigger_post_purchase_flow_ucp",
            post_purchase_mock,
        )

        create_req = _make_request(
            "create_checkout",
            {
                "product_id": "prod_1",
                "buyer": {
                    "first_name": "John",
                    "last_name": "Doe",
                    "email": "john@example.com",
                },
                "fulfillment_address": {
                    "name": "John Doe",
                    "line_one": "123 Main St",
                    "city": "San Francisco",
                    "state": "CA",
                    "country": "US",
                    "postal_code": "94102",
                },
            },
        )
        create_resp = auth_client.post("/a2a", json=create_req, headers=a2a_headers)
        ctx = create_resp.json()["result"]["contextId"]

        complete_req = _make_request(
            "complete_checkout",
            context_id=ctx,
            extra_parts=[
                {
                    "type": "data",
                    "data": {
                        "a2a.ucp.checkout.payment": {
                            "instruments": [
                                {
                                    "type": "tokenized_card",
                                    "handler_id": "processor_tokenizer",
                                    "credential": {"token": "vt_test_456"},
                                }
                            ]
                        }
                    },
                }
            ],
        )
        complete_resp = auth_client.post("/a2a", json=complete_req, headers=a2a_headers)

        body = complete_resp.json()
        assert "error" not in body
        checkout = body["result"]["parts"][0]["data"]["a2a.ucp.checkout"]
        assert checkout["status"] == "completed"
        assert post_purchase_mock.await_count == 1
        assert (
            post_purchase_mock.await_args.kwargs["webhook_url"]
            == "http://fallback.example/webhooks/ucp-order"
        )


# ===========================================================================
# 4. Error Handling (application-level)
# ===========================================================================


class TestApplicationErrors:
    @pytest.mark.usefixtures("mock_platform_profile")
    def test_get_without_context_returns_session_not_found(
        self, auth_client: TestClient, a2a_headers: dict[str, str]
    ) -> None:
        request = _make_request("get_checkout", context_id="nonexistent-ctx")
        response = auth_client.post("/a2a", json=request, headers=a2a_headers)
        assert response.json()["error"]["code"] == -32000

    @pytest.mark.usefixtures("mock_platform_profile")
    def test_unknown_action_returns_invalid_params(
        self, auth_client: TestClient, a2a_headers: dict[str, str]
    ) -> None:
        request = _make_request("unknown_action")
        response = auth_client.post("/a2a", json=request, headers=a2a_headers)
        assert response.json()["error"]["code"] == -32602

    @pytest.mark.usefixtures("mock_platform_profile")
    def test_no_action_in_parts_returns_invalid_params(
        self, auth_client: TestClient, a2a_headers: dict[str, str]
    ) -> None:
        request = {
            "jsonrpc": "2.0",
            "id": "1",
            "method": "message/send",
            "params": {
                "message": {
                    "role": "user",
                    "messageId": str(uuid.uuid4()),
                    "kind": "message",
                    "parts": [{"type": "text", "text": "hello"}],
                }
            },
        }
        response = auth_client.post("/a2a", json=request, headers=a2a_headers)
        assert response.json()["error"]["code"] == -32602

    @pytest.mark.usefixtures("mock_platform_profile")
    def test_complete_checkout_with_unadvertised_handler_returns_invalid_params(
        self, auth_client: TestClient, a2a_headers: dict[str, str]
    ) -> None:
        create_req = _make_request("create_checkout", {"product_id": "prod_1"})
        create_resp = auth_client.post("/a2a", json=create_req, headers=a2a_headers)
        ctx = create_resp.json()["result"]["contextId"]

        complete_req = _make_request(
            "complete_checkout",
            context_id=ctx,
            extra_parts=[
                {
                    "type": "data",
                    "data": {
                        "a2a.ucp.checkout.payment": {
                            "instruments": [
                                {
                                    "id": "pm_bad",
                                    "type": "tokenized_card",
                                    "handler_id": "unknown_handler",
                                    "credential": {"token": "vt_test_bad"},
                                }
                            ]
                        }
                    },
                }
            ],
        )
        response = auth_client.post("/a2a", json=complete_req, headers=a2a_headers)
        body = response.json()
        assert body["error"]["code"] == -32602
        assert (
            body["error"]["message"]
            == "Unsupported payment handler_id: unknown_handler"
        )


# ===========================================================================
# 5. Context / Session Persistence
# ===========================================================================


class TestContextPersistence:
    @pytest.mark.usefixtures("mock_platform_profile")
    def test_first_message_generates_context_id(
        self, auth_client: TestClient, a2a_headers: dict[str, str]
    ) -> None:
        request = _make_request("create_checkout", {"product_id": "prod_1"})
        response = auth_client.post("/a2a", json=request, headers=a2a_headers)
        ctx = response.json()["result"]["contextId"]
        assert ctx  # not empty

    @pytest.mark.usefixtures("mock_platform_profile")
    def test_subsequent_messages_use_same_context(
        self, auth_client: TestClient, a2a_headers: dict[str, str]
    ) -> None:
        create_req = _make_request("create_checkout", {"product_id": "prod_1"})
        create_resp = auth_client.post("/a2a", json=create_req, headers=a2a_headers)
        ctx = create_resp.json()["result"]["contextId"]

        get_req = _make_request("get_checkout", context_id=ctx)
        get_resp = auth_client.post("/a2a", json=get_req, headers=a2a_headers)
        assert get_resp.json()["result"]["contextId"] == ctx


# ===========================================================================
# 6. messageId Idempotency
# ===========================================================================


class TestIdempotency:
    @pytest.mark.usefixtures("mock_platform_profile")
    def test_duplicate_message_id_returns_cached_response(
        self, auth_client: TestClient, a2a_headers: dict[str, str]
    ) -> None:
        msg_id = str(uuid.uuid4())
        request = _make_request(
            "create_checkout", {"product_id": "prod_1"}, message_id=msg_id
        )

        resp1 = auth_client.post("/a2a", json=request, headers=a2a_headers)
        resp2 = auth_client.post("/a2a", json=request, headers=a2a_headers)

        assert resp1.json() == resp2.json()


# ===========================================================================
# 7. Agent Card Endpoint
# ===========================================================================


class TestAgentCard:
    def test_agent_card_returns_valid_structure(self, auth_client: TestClient) -> None:
        response = auth_client.get("/.well-known/agent-card.json")
        assert response.status_code == 200

        card = response.json()
        assert card["name"] == "Agentic Commerce Merchant Agent"
        assert card["protocolVersion"] == "0.3.0"
        assert "/a2a" in card["url"]
        assert card["capabilities"]["streaming"] is False

        ext = card["capabilities"]["extensions"][0]
        assert ext["uri"] == A2A_UCP_EXTENSION_URL

        caps = ext["params"]["capabilities"]
        assert "dev.ucp.shopping.checkout" in caps
        assert isinstance(caps["dev.ucp.shopping.checkout"], list)

    def test_agent_card_is_public(self, client: TestClient) -> None:
        """Agent card does not require authentication."""
        response = client.get("/.well-known/agent-card.json")
        assert response.status_code == 200


# ===========================================================================
# 8. UCP Discovery includes A2A transport
# ===========================================================================


class TestDiscoveryA2A:
    def test_discovery_includes_a2a_service(self, client: TestClient) -> None:
        response = client.get("/.well-known/ucp")
        assert response.status_code == 200

        services = response.json()["ucp"]["services"]["dev.ucp.shopping"]
        transports = [s["transport"] for s in services]
        assert "a2a" in transports
        assert len(services) == 1  # A2A only, no REST

        a2a_entry = services[0]
        assert a2a_entry["version"] == get_settings().ucp_version
        assert a2a_entry["spec"] == "https://ucp.dev/specification/overview"
        assert "agent-card.json" in a2a_entry["endpoint"]
