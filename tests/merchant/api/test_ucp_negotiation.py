"""Tests for UCP capability negotiation (Phase 4).

Covers the intersection algorithm, extension pruning, per-capability
version compatibility, response capability filtering, negotiation failure
responses via A2A, severity mapping, and payment_handlers in responses.
"""

from __future__ import annotations

import uuid
from typing import Any

import httpx
import pytest
from fastapi.testclient import TestClient

from src.merchant.config import get_settings
from src.merchant.db.database import reset_engine
from src.merchant.protocols.ucp.api.schemas.checkout import UCPCapabilityVersion
from src.merchant.protocols.ucp.services import negotiation as ucp_service
from src.merchant.protocols.ucp.services.a2a_transport import (
    A2A_UCP_EXTENSION_URL,
    clear_context_sessions,
)
from src.merchant.protocols.ucp.services.negotiation import (
    NegotiationFailureError,
    _get_extends_list,
    build_business_profile,
    compute_capability_intersection,
    filter_capabilities_for_checkout,
)
from src.merchant.services.idempotency import reset_idempotency_store

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(autouse=True)
def _reset_state() -> None:
    ucp_service.clear_profile_cache()
    clear_context_sessions()
    reset_idempotency_store()


@pytest.fixture(autouse=True)
def use_temp_database(tmp_path, monkeypatch) -> None:
    db_path = tmp_path / "ucp_negotiation_test.db"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")
    get_settings.cache_clear()
    reset_engine()
    yield
    reset_engine()
    get_settings.cache_clear()


@pytest.fixture
def business_profile():
    return build_business_profile(request_base_url="http://localhost:8000")


@pytest.fixture
def a2a_headers() -> dict[str, str]:
    return {
        "UCP-Agent": 'profile="https://platform.example/profile"',
        "X-A2A-Extensions": A2A_UCP_EXTENSION_URL,
    }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _make_platform_profile(
    capabilities: dict[str, list[dict[str, Any]]],
    version: str | None = None,
) -> dict[str, Any]:
    """Build a minimal platform profile dict."""
    return {
        "ucp": {
            "version": version or get_settings().ucp_version,
            "capabilities": capabilities,
        }
    }


def _make_a2a_request(
    action: str,
    data: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Build a minimal A2A JSON-RPC request for a checkout action."""
    action_data: dict[str, Any] = {"action": action}
    if data:
        action_data.update(data)
    return {
        "jsonrpc": "2.0",
        "id": str(uuid.uuid4()),
        "method": "message/send",
        "params": {
            "message": {
                "role": "user",
                "messageId": str(uuid.uuid4()),
                "kind": "message",
                "parts": [{"type": "data", "data": action_data}],
            }
        },
    }


# ===========================================================================
# 1. _get_extends_list
# ===========================================================================


class TestGetExtendsList:
    def test_none_returns_empty(self) -> None:
        cap = UCPCapabilityVersion(version="2026-01-11", extends=None)
        assert _get_extends_list(cap) == []

    def test_string_returns_single_element_list(self) -> None:
        cap = UCPCapabilityVersion(
            version="2026-01-11", extends="dev.ucp.shopping.checkout"
        )
        assert _get_extends_list(cap) == ["dev.ucp.shopping.checkout"]

    def test_list_returns_list(self) -> None:
        cap = UCPCapabilityVersion(
            version="2026-01-11",
            extends=["dev.ucp.shopping.checkout", "dev.ucp.shopping.cart"],
        )
        assert _get_extends_list(cap) == [
            "dev.ucp.shopping.checkout",
            "dev.ucp.shopping.cart",
        ]


# ===========================================================================
# 2. Intersection Algorithm
# ===========================================================================


class TestComputeCapabilityIntersection:
    def test_full_intersection_matching_capabilities(self, business_profile) -> None:
        """Both sides support checkout + fulfillment + discount -> all kept."""
        platform = _make_platform_profile(
            {
                "dev.ucp.shopping.checkout": [{"version": get_settings().ucp_version}],
                "dev.ucp.shopping.fulfillment": [
                    {"version": get_settings().ucp_version}
                ],
                "dev.ucp.shopping.discount": [{"version": get_settings().ucp_version}],
            }
        )
        result = compute_capability_intersection(business_profile, platform)
        assert "dev.ucp.shopping.checkout" in result
        assert "dev.ucp.shopping.fulfillment" in result
        assert "dev.ucp.shopping.discount" in result

    def test_platform_only_checkout(self, business_profile) -> None:
        """Platform only supports checkout -> fulfillment pruned."""
        platform = _make_platform_profile(
            {
                "dev.ucp.shopping.checkout": [{"version": get_settings().ucp_version}],
            }
        )
        result = compute_capability_intersection(business_profile, platform)
        assert "dev.ucp.shopping.checkout" in result
        assert "dev.ucp.shopping.fulfillment" not in result

    def test_empty_intersection_no_matching_caps(self, business_profile) -> None:
        platform = _make_platform_profile(
            {"dev.ucp.shopping.cart": [{"version": get_settings().ucp_version}]}
        )
        result = compute_capability_intersection(business_profile, platform)
        assert result == {}

    def test_per_capability_version_check_excludes_newer_platform(
        self, business_profile
    ) -> None:
        """Platform cap version > business cap version -> excluded."""
        platform = _make_platform_profile(
            {
                "dev.ucp.shopping.checkout": [{"version": "2027-06-01"}],
            }
        )
        result = compute_capability_intersection(business_profile, platform)
        assert "dev.ucp.shopping.checkout" not in result

    def test_per_capability_version_check_includes_older_platform(
        self, business_profile
    ) -> None:
        """Platform cap version <= business cap version -> included."""
        platform = _make_platform_profile(
            {
                "dev.ucp.shopping.checkout": [{"version": "2025-01-01"}],
            }
        )
        result = compute_capability_intersection(business_profile, platform)
        assert "dev.ucp.shopping.checkout" in result

    def test_malformed_platform_caps_raises(self, business_profile) -> None:
        platform: dict[str, Any] = {
            "ucp": {"version": "2026-01-11", "capabilities": "bad"}
        }
        with pytest.raises(ValueError, match="capabilities"):
            compute_capability_intersection(business_profile, platform)


# ===========================================================================
# 3. Extension Pruning
# ===========================================================================


class TestExtensionPruning:
    def test_orphaned_single_parent_removed(self) -> None:
        """fulfillment extends checkout; platform lacks checkout -> pruned."""
        biz = build_business_profile(request_base_url="http://localhost:8000")
        platform = _make_platform_profile(
            {
                "dev.ucp.shopping.fulfillment": [
                    {"version": get_settings().ucp_version}
                ],
            }
        )
        result = compute_capability_intersection(biz, platform)
        assert "dev.ucp.shopping.fulfillment" not in result

    def test_multi_parent_kept_if_one_parent_present(self) -> None:
        """discount extends [checkout, cart]; checkout present -> kept."""
        biz = build_business_profile(request_base_url="http://localhost:8000")
        platform = _make_platform_profile(
            {
                "dev.ucp.shopping.checkout": [{"version": get_settings().ucp_version}],
                "dev.ucp.shopping.discount": [{"version": get_settings().ucp_version}],
            }
        )
        result = compute_capability_intersection(biz, platform)
        assert "dev.ucp.shopping.checkout" in result
        assert "dev.ucp.shopping.discount" in result

    def test_multi_parent_removed_if_no_parents(self) -> None:
        """discount extends [checkout, cart]; neither present -> pruned."""
        biz = build_business_profile(request_base_url="http://localhost:8000")
        platform = _make_platform_profile(
            {
                "dev.ucp.shopping.discount": [{"version": get_settings().ucp_version}],
            }
        )
        result = compute_capability_intersection(biz, platform)
        assert "dev.ucp.shopping.discount" not in result

    def test_transitive_pruning_chain(self) -> None:
        """Extension-of-extension: both removed when root missing."""
        caps = {
            "dev.ucp.shopping.checkout": [UCPCapabilityVersion(version="2026-01-11")],
            "dev.ucp.ext.a": [
                UCPCapabilityVersion(
                    version="2026-01-11", extends="dev.ucp.shopping.checkout"
                )
            ],
            "dev.ucp.ext.b": [
                UCPCapabilityVersion(version="2026-01-11", extends="dev.ucp.ext.a")
            ],
        }
        from src.merchant.protocols.ucp.api.schemas.checkout import (
            UCPBusinessProfile,
            UCPMetadata,
            UCPService,
        )

        profile = UCPBusinessProfile(
            ucp=UCPMetadata(
                version="2026-01-11",
                services={
                    "dev.ucp.shopping": [
                        UCPService(
                            version="2026-01-11",
                            transport="a2a",
                            endpoint="http://localhost:8000/.well-known/agent-card.json",
                        )
                    ]
                },
                capabilities=caps,
            )
        )
        platform = _make_platform_profile(
            {
                "dev.ucp.ext.a": [{"version": "2026-01-11"}],
                "dev.ucp.ext.b": [{"version": "2026-01-11"}],
            }
        )
        result = compute_capability_intersection(profile, platform)
        assert "dev.ucp.ext.a" not in result
        assert "dev.ucp.ext.b" not in result


# ===========================================================================
# 4. Response Capability Filtering
# ===========================================================================


class TestFilterCapabilitiesForCheckout:
    def test_checkout_and_extensions_kept(self) -> None:
        negotiated = {
            "dev.ucp.shopping.checkout": [UCPCapabilityVersion(version="2026-01-11")],
            "dev.ucp.shopping.fulfillment": [
                UCPCapabilityVersion(
                    version="2026-01-11", extends="dev.ucp.shopping.checkout"
                )
            ],
            "dev.ucp.shopping.discount": [
                UCPCapabilityVersion(
                    version="2026-01-11",
                    extends=["dev.ucp.shopping.checkout", "dev.ucp.shopping.cart"],
                )
            ],
        }
        result = filter_capabilities_for_checkout(negotiated)
        assert "dev.ucp.shopping.checkout" in result
        assert "dev.ucp.shopping.fulfillment" in result
        assert "dev.ucp.shopping.discount" in result

    def test_non_checkout_capabilities_excluded(self) -> None:
        negotiated = {
            "dev.ucp.shopping.checkout": [UCPCapabilityVersion(version="2026-01-11")],
            "dev.ucp.shopping.cart": [UCPCapabilityVersion(version="2026-01-11")],
        }
        result = filter_capabilities_for_checkout(negotiated)
        assert "dev.ucp.shopping.checkout" in result
        assert "dev.ucp.shopping.cart" not in result


# ===========================================================================
# 5. Business Profile Correctness
# ===========================================================================


class TestBusinessProfile:
    def test_discount_has_extends(self) -> None:
        profile = build_business_profile(request_base_url="http://localhost:8000")
        discount_caps = profile.ucp.capabilities["dev.ucp.shopping.discount"]
        assert discount_caps[0].extends == [
            "dev.ucp.shopping.checkout",
            "dev.ucp.shopping.cart",
        ]

    def test_payment_handlers_present(self) -> None:
        profile = build_business_profile(request_base_url="http://localhost:8000")
        assert profile.ucp.payment_handlers is not None
        assert "com.example.processor_tokenizer" in profile.ucp.payment_handlers

    def test_only_a2a_transport(self) -> None:
        profile = build_business_profile(request_base_url="http://localhost:8000")
        services = profile.ucp.services["dev.ucp.shopping"]
        assert len(services) == 1
        assert services[0].transport == "a2a"


# ===========================================================================
# 6. NegotiationFailureError
# ===========================================================================


class TestNegotiationFailureError:
    def test_exception_carries_code_and_content(self) -> None:
        exc = NegotiationFailureError(
            code="CAPABILITIES_INCOMPATIBLE",
            content="No compatible capabilities",
        )
        assert exc.code == "CAPABILITIES_INCOMPATIBLE"
        assert exc.content == "No compatible capabilities"
        assert str(exc) == "No compatible capabilities"


# ===========================================================================
# 7. A2A Negotiation Failure Responses (JSON-RPC result, not error)
# ===========================================================================


class TestA2ANegotiationFailure:
    def test_capabilities_incompatible_returns_result(
        self,
        auth_client: TestClient,
        a2a_headers: dict[str, str],
        monkeypatch,
    ) -> None:
        async def _mock_fetch(_url: str) -> dict[str, Any]:
            return _make_platform_profile({})

        monkeypatch.setattr(
            "src.merchant.protocols.ucp.services.a2a_transport.fetch_platform_profile",
            _mock_fetch,
        )

        request = _make_a2a_request(
            "create_checkout",
            {"line_items": [{"item": {"id": "prod_1"}, "quantity": 1}]},
        )
        response = auth_client.post("/a2a", json=request, headers=a2a_headers)

        assert response.status_code == 200
        body = response.json()
        # Per spec: negotiation failure -> JSON-RPC result, not error
        assert "error" not in body
        result = body["result"]
        checkout = result["parts"][0]["data"]["a2a.ucp.checkout"]
        assert checkout["ucp"]["capabilities"] == {}
        messages = checkout["messages"]
        assert len(messages) == 1
        assert messages[0]["code"] == "CAPABILITIES_INCOMPATIBLE"
        assert messages[0]["severity"] == "requires_buyer_input"

    def test_version_unsupported_returns_result(
        self,
        auth_client: TestClient,
        a2a_headers: dict[str, str],
        monkeypatch,
    ) -> None:
        async def _mock_fetch(_url: str) -> dict[str, Any]:
            return _make_platform_profile(
                {"dev.ucp.shopping.checkout": [{"version": "2027-01-01"}]},
                version="2027-01-01",
            )

        monkeypatch.setattr(
            "src.merchant.protocols.ucp.services.a2a_transport.fetch_platform_profile",
            _mock_fetch,
        )

        request = _make_a2a_request(
            "create_checkout",
            {"line_items": [{"item": {"id": "prod_1"}, "quantity": 1}]},
        )
        response = auth_client.post("/a2a", json=request, headers=a2a_headers)

        assert response.status_code == 200
        body = response.json()
        assert "error" not in body
        result = body["result"]
        checkout = result["parts"][0]["data"]["a2a.ucp.checkout"]
        assert checkout["ucp"]["capabilities"] == {}
        messages = checkout["messages"]
        assert len(messages) == 1
        assert messages[0]["code"] == "VERSION_UNSUPPORTED"
        assert messages[0]["severity"] == "requires_buyer_input"

    def test_discovery_failure_returns_jsonrpc_error(
        self,
        auth_client: TestClient,
        a2a_headers: dict[str, str],
        monkeypatch,
    ) -> None:
        async def _raise_request_error(_url: str) -> dict[str, Any]:
            raise httpx.RequestError("boom")

        monkeypatch.setattr(
            "src.merchant.protocols.ucp.services.a2a_transport.fetch_platform_profile",
            _raise_request_error,
        )

        request = _make_a2a_request(
            "create_checkout",
            {"line_items": [{"item": {"id": "prod_1"}, "quantity": 1}]},
        )
        response = auth_client.post("/a2a", json=request, headers=a2a_headers)

        assert response.status_code == 200
        body = response.json()
        assert "error" in body
        assert body["error"]["code"] == -32002


# ===========================================================================
# 8. Severity in Checkout Error Messages (via A2A)
# ===========================================================================


class TestSeverityMapping:
    def test_checkout_error_messages_have_severity_recoverable(
        self,
        auth_client: TestClient,
        a2a_headers: dict[str, str],
        monkeypatch,
    ) -> None:
        """Create a checkout via A2A; missing buyer -> incomplete with messages."""

        async def _mock_fetch(_url: str) -> dict[str, Any]:
            return _make_platform_profile(
                {
                    "dev.ucp.shopping.checkout": [
                        {"version": get_settings().ucp_version}
                    ],
                }
            )

        monkeypatch.setattr(
            "src.merchant.protocols.ucp.services.a2a_transport.fetch_platform_profile",
            _mock_fetch,
        )

        request = _make_a2a_request(
            "create_checkout",
            {"line_items": [{"item": {"id": "prod_1"}, "quantity": 1}]},
        )
        response = auth_client.post("/a2a", json=request, headers=a2a_headers)

        assert response.status_code == 200
        body = response.json()
        assert "error" not in body
        checkout = body["result"]["parts"][0]["data"]["a2a.ucp.checkout"]
        for msg in checkout.get("messages", []):
            if msg["type"] == "error":
                assert msg["severity"] == "recoverable"


# ===========================================================================
# 9. Payment Handlers in Response (via A2A)
# ===========================================================================


class TestPaymentHandlersInResponse:
    def test_response_includes_payment_handlers(
        self,
        auth_client: TestClient,
        a2a_headers: dict[str, str],
        monkeypatch,
    ) -> None:
        async def _mock_fetch(_url: str) -> dict[str, Any]:
            return _make_platform_profile(
                {
                    "dev.ucp.shopping.checkout": [
                        {"version": get_settings().ucp_version}
                    ],
                }
            )

        monkeypatch.setattr(
            "src.merchant.protocols.ucp.services.a2a_transport.fetch_platform_profile",
            _mock_fetch,
        )

        request = _make_a2a_request(
            "create_checkout",
            {"line_items": [{"item": {"id": "prod_1"}, "quantity": 1}]},
        )
        response = auth_client.post("/a2a", json=request, headers=a2a_headers)

        assert response.status_code == 200
        body = response.json()
        assert "error" not in body
        checkout = body["result"]["parts"][0]["data"]["a2a.ucp.checkout"]
        ucp_meta = checkout["ucp"]
        assert "payment_handlers" in ucp_meta
        assert ucp_meta["payment_handlers"] is not None
        assert "com.example.processor_tokenizer" in ucp_meta["payment_handlers"]
