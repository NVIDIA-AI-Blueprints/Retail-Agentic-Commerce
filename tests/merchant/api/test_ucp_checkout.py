"""Tests for UCP checkout REST endpoints."""

from __future__ import annotations

from typing import Any

import httpx
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from src.merchant.api.routes.ucp import checkout as ucp_checkout_routes
from src.merchant.config import get_settings
from src.merchant.db.database import get_engine, reset_engine
from src.merchant.db.models import CheckoutSession
from src.merchant.services import ucp as ucp_service


@pytest.fixture(autouse=True)
def clear_ucp_profile_cache() -> None:
    ucp_service.clear_profile_cache()


@pytest.fixture(autouse=True)
def use_temp_database(tmp_path, monkeypatch) -> None:
    db_path = tmp_path / "ucp_checkout_test.db"
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
def ucp_headers() -> dict[str, str]:
    return {"UCP-Agent": 'profile="https://platform.example/profile"'}


@pytest.fixture
def mock_platform_profile(monkeypatch, platform_profile) -> None:
    async def _mock_fetch_profile(_url: str) -> dict[str, Any]:
        return platform_profile

    monkeypatch.setattr(
        ucp_checkout_routes, "fetch_platform_profile", _mock_fetch_profile
    )


class TestUCPCheckoutEndpoints:
    @pytest.mark.usefixtures("mock_platform_profile")
    def test_create_ucp_checkout_returns_201(
        self,
        auth_client: TestClient,
        ucp_headers: dict[str, str],
    ) -> None:
        response = auth_client.post(
            "/checkout-sessions",
            headers=ucp_headers,
            json={"line_items": [{"item": {"id": "prod_1"}, "quantity": 1}]},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "incomplete"
        assert data["ucp"]["version"] == get_settings().ucp_version
        assert "dev.ucp.shopping.checkout" in data["ucp"]["capabilities"]

    @pytest.mark.usefixtures("mock_platform_profile")
    def test_create_ucp_checkout_stores_protocol(
        self,
        auth_client: TestClient,
        ucp_headers: dict[str, str],
    ) -> None:
        response = auth_client.post(
            "/checkout-sessions",
            headers=ucp_headers,
            json={"line_items": [{"item": {"id": "prod_1"}, "quantity": 1}]},
        )
        session_id = response.json()["id"]

        with Session(get_engine()) as session:
            stored = session.exec(
                select(CheckoutSession).where(CheckoutSession.id == session_id)
            ).first()
        assert stored is not None
        assert stored.protocol == "ucp"

    def test_missing_ucp_agent_returns_400(self, auth_client: TestClient) -> None:
        response = auth_client.post(
            "/checkout-sessions",
            json={"line_items": [{"item": {"id": "prod_1"}, "quantity": 1}]},
        )

        assert response.status_code == 400
        assert "UCP-Agent" in response.json()["detail"]

    def test_malformed_ucp_agent_returns_400(self, auth_client: TestClient) -> None:
        response = auth_client.post(
            "/checkout-sessions",
            headers={"UCP-Agent": "profile=missing-quotes"},
            json={"line_items": [{"item": {"id": "prod_1"}, "quantity": 1}]},
        )

        assert response.status_code == 400

    def test_profile_unreachable_returns_424(
        self, auth_client: TestClient, ucp_headers: dict[str, str], monkeypatch
    ) -> None:
        async def _raise_request_error(_url: str) -> dict[str, Any]:
            raise httpx.RequestError("boom")

        monkeypatch.setattr(
            ucp_checkout_routes, "fetch_platform_profile", _raise_request_error
        )

        response = auth_client.post(
            "/checkout-sessions",
            headers=ucp_headers,
            json={"line_items": [{"item": {"id": "prod_1"}, "quantity": 1}]},
        )

        assert response.status_code == 424

    def test_profile_malformed_returns_422(
        self, auth_client: TestClient, ucp_headers: dict[str, str], monkeypatch
    ) -> None:
        async def _raise_value_error(_url: str) -> dict[str, Any]:
            raise ValueError("bad profile")

        monkeypatch.setattr(
            ucp_checkout_routes, "fetch_platform_profile", _raise_value_error
        )

        response = auth_client.post(
            "/checkout-sessions",
            headers=ucp_headers,
            json={"line_items": [{"item": {"id": "prod_1"}, "quantity": 1}]},
        )

        assert response.status_code == 422

    def test_no_capability_intersection_returns_400(
        self, auth_client: TestClient, ucp_headers: dict[str, str], monkeypatch
    ) -> None:
        async def _mock_fetch_profile(_url: str) -> dict[str, Any]:
            return {
                "ucp": {
                    "version": get_settings().ucp_version,
                    "capabilities": {},
                }
            }

        monkeypatch.setattr(
            ucp_checkout_routes, "fetch_platform_profile", _mock_fetch_profile
        )

        response = auth_client.post(
            "/checkout-sessions",
            headers=ucp_headers,
            json={"line_items": [{"item": {"id": "prod_1"}, "quantity": 1}]},
        )

        assert response.status_code == 400

    def test_platform_version_unsupported_returns_400(
        self, auth_client: TestClient, ucp_headers: dict[str, str], monkeypatch
    ) -> None:
        async def _mock_fetch_profile(_url: str) -> dict[str, Any]:
            return {
                "ucp": {
                    "version": "2027-01-01",
                    "capabilities": {
                        "dev.ucp.shopping.checkout": [{"version": "2027-01-01"}]
                    },
                }
            }

        monkeypatch.setattr(
            ucp_checkout_routes, "fetch_platform_profile", _mock_fetch_profile
        )

        response = auth_client.post(
            "/checkout-sessions",
            headers=ucp_headers,
            json={"line_items": [{"item": {"id": "prod_1"}, "quantity": 1}]},
        )

        assert response.status_code == 400

    @pytest.mark.usefixtures("mock_platform_profile")
    def test_get_ucp_checkout_returns_200(
        self,
        auth_client: TestClient,
        ucp_headers: dict[str, str],
    ) -> None:
        create_response = auth_client.post(
            "/checkout-sessions",
            headers=ucp_headers,
            json={"line_items": [{"item": {"id": "prod_1"}, "quantity": 1}]},
        )
        session_id = create_response.json()["id"]

        response = auth_client.get(
            f"/checkout-sessions/{session_id}", headers=ucp_headers
        )

        assert response.status_code == 200

    @pytest.mark.usefixtures("mock_platform_profile")
    def test_update_ucp_checkout_transitions_ready(
        self,
        auth_client: TestClient,
        ucp_headers: dict[str, str],
    ) -> None:
        create_response = auth_client.post(
            "/checkout-sessions",
            headers=ucp_headers,
            json={"line_items": [{"item": {"id": "prod_1"}, "quantity": 1}]},
        )
        session_id = create_response.json()["id"]

        response = auth_client.put(
            f"/checkout-sessions/{session_id}",
            headers=ucp_headers,
            json={
                "line_items": [{"item": {"id": "prod_1"}, "quantity": 1}],
                "buyer": {"first_name": "Test", "email": "test@example.com"},
            },
        )

        assert response.status_code == 200
        assert response.json()["status"] == "ready_for_complete"

    @pytest.mark.usefixtures("mock_platform_profile")
    def test_complete_ucp_checkout_returns_completed(
        self,
        auth_client: TestClient,
        ucp_headers: dict[str, str],
    ) -> None:
        create_response = auth_client.post(
            "/checkout-sessions",
            headers=ucp_headers,
            json={"line_items": [{"item": {"id": "prod_1"}, "quantity": 1}]},
        )
        session_id = create_response.json()["id"]

        auth_client.put(
            f"/checkout-sessions/{session_id}",
            headers=ucp_headers,
            json={
                "line_items": [{"item": {"id": "prod_1"}, "quantity": 1}],
                "buyer": {"first_name": "Test", "email": "test@example.com"},
            },
        )

        response = auth_client.post(
            f"/checkout-sessions/{session_id}/complete",
            headers=ucp_headers,
            json={"payment_data": {"token": "tok_test", "provider": "stripe"}},
        )

        assert response.status_code == 200
        assert response.json()["status"] == "completed"

    @pytest.mark.usefixtures("mock_platform_profile")
    def test_cancel_ucp_checkout_returns_canceled(
        self,
        auth_client: TestClient,
        ucp_headers: dict[str, str],
    ) -> None:
        create_response = auth_client.post(
            "/checkout-sessions",
            headers=ucp_headers,
            json={"line_items": [{"item": {"id": "prod_1"}, "quantity": 1}]},
        )
        session_id = create_response.json()["id"]

        response = auth_client.post(
            f"/checkout-sessions/{session_id}/cancel", headers=ucp_headers
        )

        assert response.status_code == 200
        assert response.json()["status"] == "canceled"

    @pytest.mark.usefixtures("mock_platform_profile")
    def test_ucp_response_omits_deferred_fields(
        self,
        auth_client: TestClient,
        ucp_headers: dict[str, str],
    ) -> None:
        response = auth_client.post(
            "/checkout-sessions",
            headers=ucp_headers,
            json={"line_items": [{"item": {"id": "prod_1"}, "quantity": 1}]},
        )
        data = response.json()

        assert "fulfillment" not in data
        assert "payment" not in data
        assert "order" not in data
        assert "links" not in data
        assert "continue_url" not in data


@pytest.mark.asyncio
async def test_fetch_platform_profile_caches(monkeypatch) -> None:
    ucp_service.clear_profile_cache()
    calls: list[str] = []
    profile = {
        "ucp": {
            "version": get_settings().ucp_version,
            "capabilities": {
                "dev.ucp.shopping.checkout": [{"version": get_settings().ucp_version}]
            },
        }
    }

    class MockResponse:
        def raise_for_status(self) -> None:
            return None

        def json(self) -> dict[str, Any]:
            return profile

    class MockAsyncClient:
        def __init__(self, *_args, **_kwargs) -> None:
            return None

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb) -> None:
            return None

        async def get(self, url: str) -> MockResponse:
            calls.append(url)
            return MockResponse()

    monkeypatch.setattr(httpx, "AsyncClient", MockAsyncClient)

    first = await ucp_service.fetch_platform_profile("https://platform.example/profile")
    second = await ucp_service.fetch_platform_profile(
        "https://platform.example/profile"
    )

    assert first == second
    assert len(calls) == 1
