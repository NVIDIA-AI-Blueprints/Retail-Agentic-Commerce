"""Tests for the health check endpoint."""

import pytest
from fastapi.testclient import TestClient


class TestHealthEndpoint:
    """Test suite for the /health endpoint."""

    def test_health_returns_200(self, client: TestClient) -> None:
        """Happy path: Health endpoint returns 200 OK."""
        response = client.get("/health")

        assert response.status_code == 200

    def test_health_returns_healthy_status(self, client: TestClient) -> None:
        """Happy path: Health endpoint returns healthy status."""
        response = client.get("/health")
        data = response.json()

        assert data["status"] == "healthy"

    def test_health_returns_version(self, client: TestClient) -> None:
        """Happy path: Health endpoint returns version string."""
        response = client.get("/health")
        data = response.json()

        assert "version" in data
        assert isinstance(data["version"], str)
        assert len(data["version"]) > 0

    def test_health_response_has_required_fields(self, client: TestClient) -> None:
        """Edge case: Response contains all required fields."""
        response = client.get("/health")
        data = response.json()

        required_fields = {"status", "version"}
        assert required_fields <= set(data.keys())

    def test_health_response_json_content_type(self, client: TestClient) -> None:
        """Edge case: Response has correct content type."""
        response = client.get("/health")

        assert "application/json" in response.headers["content-type"]

    @pytest.mark.parametrize("method", ["POST", "PUT", "DELETE", "PATCH"])
    def test_health_rejects_non_get_methods(
        self, client: TestClient, method: str
    ) -> None:
        """Failure case: Health endpoint rejects non-GET methods."""
        response = client.request(method, "/health")

        assert response.status_code == 405
