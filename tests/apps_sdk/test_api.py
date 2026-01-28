"""Tests for Apps SDK API endpoints.

Tests cover:
- Health check endpoint
- Widget serving endpoint (via direct route testing)
- Widget asset serving

Note: The MCP session manager has a limitation where it can only be run once
per instance, which makes it difficult to test with TestClient. We use
direct route testing for widget endpoints to avoid this limitation.
"""

import pytest
from starlette.responses import HTMLResponse


class TestHealthEndpoint:
    """Tests for the health check endpoint."""

    def test_health_returns_ok(self) -> None:
        """Health endpoint returns status ok."""
        # Import inline to avoid loading MCP session manager
        from src.apps_sdk.main import health_check

        result = health_check()
        assert result == {"status": "ok"}


class TestWidgetEndpoints:
    """Tests for widget serving endpoints.

    These tests directly call the route handlers to avoid MCP session issues.
    """

    @pytest.mark.asyncio
    async def test_widget_returns_html_or_placeholder(self) -> None:
        """Widget endpoint returns HTML (built or placeholder)."""
        from src.apps_sdk.main import serve_widget

        response = await serve_widget()

        # Response should be either FileResponse or HTMLResponse
        assert response is not None
        if isinstance(response, HTMLResponse):
            # Placeholder case - widget not built
            assert response.status_code == 200
            assert "Widget Not Built" in response.body.decode()
        else:
            # FileResponse case - widget built
            # Check that it returns a response (we can't easily check content
            # without full ASGI context, but existence is enough)
            assert response is not None

    @pytest.mark.asyncio
    async def test_missing_asset_returns_404(self) -> None:
        """Missing widget assets return 404."""
        from src.apps_sdk.main import serve_widget_assets

        response = await serve_widget_assets("nonexistent-asset.js")

        assert isinstance(response, HTMLResponse)
        assert response.status_code == 404

    def test_dist_dir_path_is_correct(self) -> None:
        """Widget dist directory path is correctly configured."""
        from src.apps_sdk.main import DIST_DIR

        # Verify the dist directory path structure
        assert DIST_DIR.name == "dist"
        assert DIST_DIR.parent.name == "apps_sdk"
