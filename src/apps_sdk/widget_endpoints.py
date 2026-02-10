"""Widget/static file routes and health endpoint."""

from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter
from starlette.responses import FileResponse, HTMLResponse, Response

router = APIRouter()

# Path to widget dist directory
DIST_DIR = Path(__file__).parent / "dist"
# Path to widget public assets (images)
PUBLIC_DIR = Path(__file__).parent / "web" / "public"


@router.get("/widget/merchant-app.html", tags=["widget"], response_model=None)
async def serve_widget() -> Response | HTMLResponse:
    """Serve the merchant app widget HTML."""
    widget_path = DIST_DIR / "index.html"
    if widget_path.exists():
        content = widget_path.read_text()
        return Response(
            content=content,
            media_type="text/html",
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
            },
        )

    return HTMLResponse(
        content="""
            <!DOCTYPE html>
            <html>
            <head><title>Widget Not Built</title></head>
            <body style="background:#1a1a1a;color:white;font-family:sans-serif;padding:40px;text-align:center;">
                <h1>Widget Not Built</h1>
                <p>Run <code>cd src/apps_sdk/web && pnpm build</code> to build the widget.</p>
            </body>
            </html>
            """,
        status_code=200,
    )


@router.get("/widget/{asset:path}", tags=["widget"], response_model=None)
async def serve_widget_assets(asset: str) -> FileResponse | HTMLResponse:
    """Serve widget assets from dist/ or web/public/."""
    asset_path = DIST_DIR / asset
    if asset_path.exists() and asset_path.is_file():
        return FileResponse(asset_path)

    public_asset_path = PUBLIC_DIR / asset
    if public_asset_path.exists() and public_asset_path.is_file():
        return FileResponse(public_asset_path)

    return HTMLResponse(content="Asset not found", status_code=404)


@router.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}
