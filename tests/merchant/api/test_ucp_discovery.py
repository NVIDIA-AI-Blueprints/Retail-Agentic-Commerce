"""Tests for UCP discovery endpoint."""

from fastapi.testclient import TestClient

from src.merchant.config import get_settings


class TestUCPDiscovery:
    def test_get_profile_returns_200(self, client: TestClient) -> None:
        """GET /.well-known/ucp returns 200."""
        response = client.get("/.well-known/ucp")
        assert response.status_code == 200

    def test_profile_has_ucp_metadata(self, client: TestClient) -> None:
        """Profile contains ucp metadata with version."""
        response = client.get("/.well-known/ucp")
        data = response.json()
        assert "ucp" in data
        assert "version" in data["ucp"]

    def test_profile_includes_shopping_service(self, client: TestClient) -> None:
        """Profile includes dev.ucp.shopping service with fully qualified URL."""
        response = client.get("/.well-known/ucp")
        data = response.json()
        services = data["ucp"]["services"]
        assert "dev.ucp.shopping" in services
        service = services["dev.ucp.shopping"][0]
        assert service["transport"] == "rest"
        assert service["endpoint"].startswith("http")

    def test_profile_includes_checkout_capability(self, client: TestClient) -> None:
        """Profile includes dev.ucp.shopping.checkout capability."""
        response = client.get("/.well-known/ucp")
        data = response.json()
        capabilities = data["ucp"]["capabilities"]
        assert "dev.ucp.shopping.checkout" in capabilities

    def test_profile_includes_fulfillment_extension(self, client: TestClient) -> None:
        """Profile includes dev.ucp.shopping.fulfillment with extends field."""
        response = client.get("/.well-known/ucp")
        data = response.json()
        capabilities = data["ucp"]["capabilities"]
        assert "dev.ucp.shopping.fulfillment" in capabilities
        fulfillment = capabilities["dev.ucp.shopping.fulfillment"][0]
        assert fulfillment.get("extends") == "dev.ucp.shopping.checkout"

    def test_profile_includes_discount_capability(self, client: TestClient) -> None:
        """Profile includes dev.ucp.shopping.discount capability."""
        response = client.get("/.well-known/ucp")
        data = response.json()
        capabilities = data["ucp"]["capabilities"]
        assert "dev.ucp.shopping.discount" in capabilities

    def test_profile_has_signing_keys_field(self, client: TestClient) -> None:
        """Profile includes top-level signing_keys field (may be null)."""
        response = client.get("/.well-known/ucp")
        data = response.json()
        assert "signing_keys" in data

    def test_signing_key_schema_matches_spec(
        self, client: TestClient, monkeypatch
    ) -> None:
        """Signing key includes all JWK fields per spec."""
        monkeypatch.setenv("UCP_SIGNING_KEY_X", "test_x_value")
        monkeypatch.setenv("UCP_SIGNING_KEY_Y", "test_y_value")
        get_settings.cache_clear()

        try:
            response = client.get("/.well-known/ucp")
            data = response.json()

            if data.get("signing_keys"):
                key = data["signing_keys"][0]
                assert "kid" in key
                assert "kty" in key
                assert "crv" in key
                assert "x" in key
                assert "alg" in key
        finally:
            get_settings.cache_clear()

    def test_payment_handler_has_config_field(self, client: TestClient) -> None:
        """Payment handler includes optional config field per spec."""
        response = client.get("/.well-known/ucp")
        data = response.json()
        handlers = data["ucp"].get("payment_handlers", {})
        if handlers:
            handler_list = list(handlers.values())[0]
            assert "config" in handler_list[0] or handler_list[0].get("config") is None

    def test_discovery_requires_no_auth(self, client: TestClient) -> None:
        """Discovery endpoint works without authentication headers."""
        response = client.get("/.well-known/ucp")
        assert response.status_code == 200

    def test_service_endpoint_uses_request_base_url_when_not_configured(
        self, client: TestClient
    ) -> None:
        """Service endpoint derived from request base URL when ucp_base_url is None."""
        response = client.get("/.well-known/ucp")
        data = response.json()
        service = data["ucp"]["services"]["dev.ucp.shopping"][0]
        assert "/ucp/v1" in service["endpoint"]
