"""Tests for API security features (Feature 4).

Tests cover:
- API key authentication (Bearer and X-API-Key headers)
- Idempotency key handling
- ACP header handling (Request-Id, Idempotency-Key echo)
"""

import uuid

from fastapi.testclient import TestClient


class TestAPIKeyAuthentication:
    """Test suite for API key authentication."""

    def test_missing_api_key_returns_401(self, client: TestClient) -> None:
        """Failure case: Request without API key returns 401 Unauthorized."""
        response = client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )

        assert response.status_code == 401
        data = response.json()
        assert data["detail"]["type"] == "unauthorized"
        assert data["detail"]["code"] == "missing_api_key"

    def test_invalid_api_key_returns_403(self, client: TestClient) -> None:
        """Failure case: Request with invalid API key returns 403 Forbidden."""
        response = client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
            headers={"Authorization": "Bearer invalid-key"},
        )

        assert response.status_code == 403
        data = response.json()
        assert data["detail"]["type"] == "forbidden"
        assert data["detail"]["code"] == "invalid_api_key"

    def test_valid_bearer_token_returns_201(self, auth_client: TestClient) -> None:
        """Happy path: Valid Bearer token allows request."""
        response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )

        assert response.status_code == 201
        assert "id" in response.json()

    def test_valid_x_api_key_returns_201(
        self, auth_client_x_api_key: TestClient
    ) -> None:
        """Happy path: Valid X-API-Key header allows request."""
        response = auth_client_x_api_key.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )

        assert response.status_code == 201
        assert "id" in response.json()

    def test_bearer_takes_precedence_over_x_api_key(self, client: TestClient) -> None:
        """Edge case: Bearer token is used when both headers present."""
        # Both headers present, Bearer is valid
        response = client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
            headers={
                "Authorization": "Bearer test-api-key-12345",
                "X-API-Key": "different-key",
            },
        )

        assert response.status_code == 201

    def test_health_endpoint_requires_no_auth(self, client: TestClient) -> None:
        """Happy path: Health endpoint is accessible without authentication."""
        response = client.get("/health")

        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    def test_get_checkout_requires_auth(self, client: TestClient) -> None:
        """Failure case: GET checkout session requires authentication."""
        response = client.get("/checkout_sessions/some_id")

        assert response.status_code == 401


class TestIdempotency:
    """Test suite for idempotency key handling."""

    def test_request_without_idempotency_key_works(
        self, auth_client: TestClient
    ) -> None:
        """Happy path: Requests without idempotency key work normally."""
        response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )

        assert response.status_code == 201

    def test_same_key_same_request_returns_cached(
        self, auth_client: TestClient
    ) -> None:
        """Happy path: Same idempotency key with same request returns cached response."""
        idempotency_key = str(uuid.uuid4())
        request_body = {"items": [{"id": "prod_1", "quantity": 1}]}

        # First request
        response1 = auth_client.post(
            "/checkout_sessions",
            json=request_body,
            headers={"Idempotency-Key": idempotency_key},
        )
        assert response1.status_code == 201
        session_id_1 = response1.json()["id"]

        # Second request with same key and body
        response2 = auth_client.post(
            "/checkout_sessions",
            json=request_body,
            headers={"Idempotency-Key": idempotency_key},
        )
        assert response2.status_code == 201
        session_id_2 = response2.json()["id"]

        # Should return the same cached session
        assert session_id_1 == session_id_2
        assert response2.headers.get("X-Idempotency-Cached") == "true"

    def test_same_key_different_request_returns_409(
        self, auth_client: TestClient
    ) -> None:
        """Failure case: Same idempotency key with different request returns 409."""
        idempotency_key = str(uuid.uuid4())

        # First request
        response1 = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
            headers={"Idempotency-Key": idempotency_key},
        )
        assert response1.status_code == 201

        # Second request with same key but different body
        response2 = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_2", "quantity": 2}]},
            headers={"Idempotency-Key": idempotency_key},
        )
        assert response2.status_code == 409
        data = response2.json()
        assert data["type"] == "invalid_request"
        assert data["code"] == "request_not_idempotent"

    def test_different_keys_create_different_sessions(
        self, auth_client: TestClient
    ) -> None:
        """Edge case: Different idempotency keys create different sessions."""
        request_body = {"items": [{"id": "prod_1", "quantity": 1}]}

        response1 = auth_client.post(
            "/checkout_sessions",
            json=request_body,
            headers={"Idempotency-Key": str(uuid.uuid4())},
        )
        response2 = auth_client.post(
            "/checkout_sessions",
            json=request_body,
            headers={"Idempotency-Key": str(uuid.uuid4())},
        )

        assert response1.status_code == 201
        assert response2.status_code == 201
        assert response1.json()["id"] != response2.json()["id"]

    def test_idempotency_key_echoed_in_response(self, auth_client: TestClient) -> None:
        """Happy path: Idempotency-Key header is echoed in response."""
        idempotency_key = str(uuid.uuid4())

        response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
            headers={"Idempotency-Key": idempotency_key},
        )

        assert response.headers.get("Idempotency-Key") == idempotency_key

    def test_idempotency_only_applies_to_post(self, auth_client: TestClient) -> None:
        """Edge case: Idempotency does not apply to GET requests."""
        # Create a session first
        create_response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )
        session_id = create_response.json()["id"]

        # GET requests with same idempotency key should not be cached
        idempotency_key = str(uuid.uuid4())

        response1 = auth_client.get(
            f"/checkout_sessions/{session_id}",
            headers={"Idempotency-Key": idempotency_key},
        )
        response2 = auth_client.get(
            f"/checkout_sessions/{session_id}",
            headers={"Idempotency-Key": idempotency_key},
        )

        assert response1.status_code == 200
        assert response2.status_code == 200
        # GET should not have the cached header
        assert response1.headers.get("X-Idempotency-Cached") is None


class TestACPHeaders:
    """Test suite for ACP header handling."""

    def test_request_id_generated_when_missing(self, auth_client: TestClient) -> None:
        """Happy path: Request-Id is generated if not provided."""
        response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
        )

        assert response.status_code == 201
        request_id = response.headers.get("Request-Id")
        assert request_id is not None
        # Should be a valid UUID
        uuid.UUID(request_id)

    def test_request_id_echoed_when_provided(self, auth_client: TestClient) -> None:
        """Happy path: Request-Id is echoed when provided."""
        provided_request_id = str(uuid.uuid4())

        response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
            headers={"Request-Id": provided_request_id},
        )

        assert response.status_code == 201
        assert response.headers.get("Request-Id") == provided_request_id

    def test_request_id_present_on_error_responses(self, client: TestClient) -> None:
        """Edge case: Request-Id is present even on error responses."""
        provided_request_id = str(uuid.uuid4())

        response = client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
            headers={"Request-Id": provided_request_id},
        )

        # 401 because no auth
        assert response.status_code == 401
        assert response.headers.get("Request-Id") == provided_request_id

    def test_idempotency_key_present_on_409(self, auth_client: TestClient) -> None:
        """Edge case: Idempotency-Key is echoed even on 409 conflict."""
        idempotency_key = str(uuid.uuid4())

        # First request
        auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_1", "quantity": 1}]},
            headers={"Idempotency-Key": idempotency_key},
        )

        # Conflict request
        response = auth_client.post(
            "/checkout_sessions",
            json={"items": [{"id": "prod_2", "quantity": 2}]},
            headers={"Idempotency-Key": idempotency_key},
        )

        assert response.status_code == 409
        assert response.headers.get("Idempotency-Key") == idempotency_key


class TestRequestValidation:
    """Test suite for request validation (Pydantic schema validation)."""

    def test_extra_fields_rejected(self, auth_client: TestClient) -> None:
        """Failure case: Extra fields in request body are rejected."""
        response = auth_client.post(
            "/checkout_sessions",
            json={
                "items": [{"id": "prod_1", "quantity": 1}],
                "unknown_field": "should_fail",
            },
        )

        assert response.status_code == 422

    def test_missing_required_field_returns_422(self, auth_client: TestClient) -> None:
        """Failure case: Missing required fields return 422."""
        response = auth_client.post(
            "/checkout_sessions",
            json={},  # Missing required 'items' field
        )

        assert response.status_code == 422

    def test_invalid_field_type_returns_422(self, auth_client: TestClient) -> None:
        """Failure case: Invalid field types return 422."""
        response = auth_client.post(
            "/checkout_sessions",
            json={"items": "not_a_list"},  # Should be a list
        )

        assert response.status_code == 422

    def test_nested_extra_fields_rejected(self, auth_client: TestClient) -> None:
        """Failure case: Extra fields in nested objects are rejected."""
        response = auth_client.post(
            "/checkout_sessions",
            json={
                "items": [{"id": "prod_1", "quantity": 1, "extra": "field"}],
            },
        )

        assert response.status_code == 422
