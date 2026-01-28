"""FastAPI + MCP Server entry point for the Apps SDK Merchant Widget.

Run with:
    uvicorn src.apps_sdk.main:app --reload --port 2091
"""

from __future__ import annotations

import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import mcp.types as types
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mcp.server.fastmcp import FastMCP
from mcp.server.transport_security import TransportSecuritySettings
from pydantic import BaseModel, ConfigDict, Field
from starlette.responses import FileResponse, HTMLResponse

from src.apps_sdk.config import get_apps_sdk_settings
from src.apps_sdk.tools import (
    add_to_cart,
    checkout,
    get_cart,
    remove_from_cart,
    search_products,
    update_cart_quantity,
)

settings = get_apps_sdk_settings()

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)

# =============================================================================
# MCP SERVER INITIALIZATION
# =============================================================================

mcp = FastMCP(
    name="acp-merchant",
    stateless_http=True,
    transport_security=TransportSecuritySettings(enable_dns_rebinding_protection=False),
)


# =============================================================================
# INPUT SCHEMAS (Pydantic Models)
# =============================================================================


class AddToCartInput(BaseModel):
    """Schema for add-to-cart tool."""

    product_id: str = Field(..., alias="productId", description="Product ID to add")
    quantity: int = Field(default=1, ge=1, description="Quantity to add")
    cart_id: str | None = Field(
        None, alias="cartId", description="Existing cart ID or None for new cart"
    )

    model_config = ConfigDict(populate_by_name=True, extra="forbid")


class RemoveFromCartInput(BaseModel):
    """Schema for remove-from-cart tool."""

    product_id: str = Field(..., alias="productId", description="Product ID to remove")
    cart_id: str = Field(..., alias="cartId", description="Cart ID")

    model_config = ConfigDict(populate_by_name=True, extra="forbid")


class UpdateCartQuantityInput(BaseModel):
    """Schema for update-cart-quantity tool."""

    product_id: str = Field(..., alias="productId", description="Product ID to update")
    quantity: int = Field(..., ge=0, description="New quantity (0 to remove)")
    cart_id: str = Field(..., alias="cartId", description="Cart ID")

    model_config = ConfigDict(populate_by_name=True, extra="forbid")


class GetCartInput(BaseModel):
    """Schema for get-cart tool."""

    cart_id: str = Field(..., alias="cartId", description="Cart ID")

    model_config = ConfigDict(populate_by_name=True, extra="forbid")


class CheckoutInput(BaseModel):
    """Schema for checkout tool."""

    cart_id: str = Field(..., alias="cartId", description="Cart ID to checkout")

    model_config = ConfigDict(populate_by_name=True, extra="forbid")


class SearchProductsInput(BaseModel):
    """Schema for search-products tool (entry point for widget discovery)."""

    query: str = Field(..., description="Search query for products")
    category: str | None = Field(None, description="Optional category filter")
    limit: int = Field(default=10, ge=1, le=50, description="Max results (1-50)")

    model_config = ConfigDict(populate_by_name=True, extra="forbid")


# =============================================================================
# OUTPUT SCHEMAS (Pydantic Models for Tool Responses)
# =============================================================================


class ProductOutput(BaseModel):
    """Schema for a product in search results."""

    id: str = Field(..., description="Product ID")
    sku: str = Field(..., description="Stock keeping unit")
    name: str = Field(..., description="Product name")
    basePrice: int = Field(..., alias="basePrice", description="Price in cents")
    stockCount: int = Field(..., alias="stockCount", description="Available stock")
    variant: str | None = Field(None, description="Product variant (e.g., color)")
    size: str | None = Field(None, description="Product size")
    imageUrl: str | None = Field(
        None, alias="imageUrl", description="Product image URL"
    )

    model_config = ConfigDict(populate_by_name=True)


class UserOutput(BaseModel):
    """Schema for user information in search results."""

    id: str = Field(..., description="User ID")
    name: str = Field(..., description="User display name")
    email: str = Field(..., description="User email")
    loyaltyPoints: int = Field(
        ..., alias="loyaltyPoints", description="Loyalty points balance"
    )
    tier: str = Field(..., description="Loyalty tier (e.g., Gold, Silver)")
    memberSince: str = Field(
        ..., alias="memberSince", description="Membership start date"
    )

    model_config = ConfigDict(populate_by_name=True)


class SearchProductsOutput(BaseModel):
    """Output schema for search-products tool."""

    products: list[ProductOutput] = Field(..., description="List of matching products")
    query: str = Field(..., description="Original search query")
    category: str | None = Field(None, description="Category filter applied")
    totalResults: int = Field(
        ..., alias="totalResults", description="Total number of results"
    )
    user: UserOutput | None = Field(None, description="Current user information")
    theme: str | None = Field(None, description="UI theme preference")
    locale: str | None = Field(None, description="User locale")

    model_config = ConfigDict(populate_by_name=True)


class CartItemOutput(BaseModel):
    """Schema for a cart item."""

    id: str = Field(..., description="Product ID")
    sku: str = Field(..., description="Stock keeping unit")
    name: str = Field(..., description="Product name")
    basePrice: int = Field(..., alias="basePrice", description="Price in cents")
    stockCount: int = Field(..., alias="stockCount", description="Available stock")
    variant: str | None = Field(None, description="Product variant")
    size: str | None = Field(None, description="Product size")
    imageUrl: str | None = Field(
        None, alias="imageUrl", description="Product image URL"
    )
    quantity: int = Field(..., description="Quantity in cart")

    model_config = ConfigDict(populate_by_name=True)


class CartOutput(BaseModel):
    """Output schema for cart operations (add, remove, update, get)."""

    cartId: str = Field(..., alias="cartId", description="Cart identifier")
    items: list[CartItemOutput] = Field(default=[], description="Items in cart")
    itemCount: int = Field(default=0, alias="itemCount", description="Total item count")
    subtotal: int = Field(default=0, description="Subtotal in cents")
    shipping: int = Field(default=0, description="Shipping cost in cents")
    tax: int = Field(default=0, description="Tax amount in cents")
    total: int = Field(default=0, description="Total amount in cents")
    error: str | None = Field(None, description="Error message if operation failed")

    model_config = ConfigDict(populate_by_name=True)


class CheckoutOutput(BaseModel):
    """Output schema for checkout tool."""

    success: bool = Field(..., description="Whether checkout succeeded")
    status: str = Field(
        ..., description="Order status: 'confirmed', 'failed', or 'pending'"
    )
    orderId: str | None = Field(
        None, alias="orderId", description="Order identifier if successful"
    )
    message: str = Field(..., description="Human-readable result message")
    total: int | None = Field(None, description="Order total in cents")
    itemCount: int | None = Field(
        None, alias="itemCount", description="Number of items in order"
    )
    orderUrl: str | None = Field(
        None, alias="orderUrl", description="URL to view order details"
    )
    error: str | None = Field(None, description="Error message if checkout failed")

    model_config = ConfigDict(populate_by_name=True)


# =============================================================================
# WIDGET METADATA HELPERS
# =============================================================================


def _search_meta() -> dict[str, Any]:
    """Metadata for search products (entry point tool).

    This is the primary entry point that exposes the widget URI to clients.
    Clients discover the widget location by calling search-products and
    reading _meta.openai/outputTemplate from the response.
    """
    return {
        "openai/outputTemplate": "ui://widget/merchant-app.html",
        "openai/toolInvocation/invoking": "Searching products...",
        "openai/toolInvocation/invoked": "Products found",
        "openai/widgetAccessible": True,
    }


def _cart_meta(cart_id: str) -> dict[str, Any]:
    """Metadata for cart widget."""
    return {
        "openai/outputTemplate": "ui://widget/merchant-app.html",
        "openai/toolInvocation/invoking": "Updating cart...",
        "openai/toolInvocation/invoked": "Cart updated",
        "openai/widgetAccessible": True,
        "openai/widgetSessionId": cart_id,
    }


def _checkout_meta(success: bool) -> dict[str, Any]:
    """Metadata for checkout completion."""
    return {
        "openai/outputTemplate": "ui://widget/merchant-app.html",
        "openai/toolInvocation/invoking": "Processing order...",
        "openai/toolInvocation/invoked": "Order placed!" if success else "Order failed",
        "openai/widgetAccessible": True,
        "openai/closeWidget": success,
    }


# =============================================================================
# MCP TOOL REGISTRATION
# =============================================================================


@mcp._mcp_server.list_tools()  # pyright: ignore[reportPrivateUsage]
async def list_mcp_tools() -> list[types.Tool]:
    """Register all available MCP tools with JSON Schema input/output contracts.

    The search-products tool is the entry point that exposes the widget URI.
    Clients discover the widget by calling this tool and reading
    _meta.openai/outputTemplate from the response.

    Per the Apps SDK spec, each tool advertises:
    - inputSchema: JSON Schema for input parameters
    - outputSchema: JSON Schema for structured output
    - annotations: Hints about tool behavior (destructive, read-only, etc.)
    """
    return [
        types.Tool(
            name="search-products",
            title="Search Products",
            description="Search for products by query and optional category. Entry point that returns the widget URI.",
            inputSchema=SearchProductsInput.model_json_schema(by_alias=True),
            outputSchema=SearchProductsOutput.model_json_schema(by_alias=True),
            _meta=_search_meta(),
            annotations=types.ToolAnnotations(
                destructiveHint=False,
                openWorldHint=False,
                readOnlyHint=True,
            ),
        ),
        types.Tool(
            name="add-to-cart",
            title="Add to Cart",
            description="Add a product to the shopping cart. Returns updated cart state.",
            inputSchema=AddToCartInput.model_json_schema(by_alias=True),
            outputSchema=CartOutput.model_json_schema(by_alias=True),
            _meta=_cart_meta(""),
            annotations=types.ToolAnnotations(
                destructiveHint=False,
                openWorldHint=False,
                readOnlyHint=False,
            ),
        ),
        types.Tool(
            name="remove-from-cart",
            title="Remove from Cart",
            description="Remove a product from the shopping cart. Returns updated cart state.",
            inputSchema=RemoveFromCartInput.model_json_schema(by_alias=True),
            outputSchema=CartOutput.model_json_schema(by_alias=True),
            _meta=_cart_meta(""),
            annotations=types.ToolAnnotations(
                destructiveHint=False,
                openWorldHint=False,
                readOnlyHint=False,
            ),
        ),
        types.Tool(
            name="update-cart-quantity",
            title="Update Cart Quantity",
            description="Update the quantity of a product in the cart. Returns updated cart state.",
            inputSchema=UpdateCartQuantityInput.model_json_schema(by_alias=True),
            outputSchema=CartOutput.model_json_schema(by_alias=True),
            _meta=_cart_meta(""),
            annotations=types.ToolAnnotations(
                destructiveHint=False,
                openWorldHint=False,
                readOnlyHint=False,
            ),
        ),
        types.Tool(
            name="get-cart",
            title="Get Cart",
            description="Get the current cart contents including items, totals, and item count.",
            inputSchema=GetCartInput.model_json_schema(by_alias=True),
            outputSchema=CartOutput.model_json_schema(by_alias=True),
            _meta=_cart_meta(""),
            annotations=types.ToolAnnotations(
                destructiveHint=False,
                openWorldHint=False,
                readOnlyHint=True,
            ),
        ),
        types.Tool(
            name="checkout",
            title="Checkout",
            description="Complete the checkout process using ACP payment flow. Returns order confirmation.",
            inputSchema=CheckoutInput.model_json_schema(by_alias=True),
            outputSchema=CheckoutOutput.model_json_schema(by_alias=True),
            _meta=_checkout_meta(True),
            annotations=types.ToolAnnotations(
                destructiveHint=True,
                openWorldHint=True,
                readOnlyHint=False,
            ),
        ),
    ]


# =============================================================================
# MCP RESOURCE REGISTRATION (Widget HTML)
# =============================================================================


@mcp._mcp_server.list_resources()  # pyright: ignore[reportPrivateUsage]
async def list_mcp_resources() -> list[types.Resource]:
    """Register widget HTML resources."""
    from pydantic import AnyUrl

    return [
        types.Resource(
            name="Merchant App Widget",
            title="ACP Merchant App",
            uri=AnyUrl("ui://widget/merchant-app.html"),
            description="Full merchant shopping experience with recommendations, cart, and checkout",
            mimeType="text/html+skybridge",
            _meta={
                "openai/widgetAccessible": True,
            },
        ),
    ]


# =============================================================================
# MCP TOOL HANDLERS
# =============================================================================


async def _handle_call_tool(req: types.CallToolRequest) -> types.ServerResult:
    """Route and handle all tool calls.

    The search-products tool is the entry point that clients call to discover
    the widget URI via _meta.openai/outputTemplate in the response.
    """
    tool_name = req.params.name
    args = req.params.arguments or {}

    if tool_name == "search-products":
        payload = SearchProductsInput.model_validate(args)
        result = await search_products(payload.query, payload.category, payload.limit)
        return types.ServerResult(
            types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text",
                        text=f"Found {result.get('totalResults', 0)} products for '{payload.query}'",
                    )
                ],
                structuredContent=result,
                _meta=result.get("_meta", _search_meta()),
            )
        )

    elif tool_name == "add-to-cart":
        payload = AddToCartInput.model_validate(args)
        result = await add_to_cart(
            payload.product_id, payload.quantity, payload.cart_id
        )
        return types.ServerResult(
            types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text",
                        text=f"Added {payload.quantity} item(s) to cart",
                    )
                ],
                structuredContent=result,
                _meta=result.get("_meta", _cart_meta(result.get("cartId", ""))),
            )
        )

    elif tool_name == "remove-from-cart":
        payload = RemoveFromCartInput.model_validate(args)
        result = await remove_from_cart(payload.product_id, payload.cart_id)
        return types.ServerResult(
            types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text",
                        text="Item removed from cart",
                    )
                ],
                structuredContent=result,
                _meta=result.get("_meta", _cart_meta(payload.cart_id)),
            )
        )

    elif tool_name == "update-cart-quantity":
        payload = UpdateCartQuantityInput.model_validate(args)
        result = await update_cart_quantity(
            payload.product_id, payload.quantity, payload.cart_id
        )
        return types.ServerResult(
            types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text",
                        text=f"Cart quantity updated to {payload.quantity}",
                    )
                ],
                structuredContent=result,
                _meta=result.get("_meta", _cart_meta(payload.cart_id)),
            )
        )

    elif tool_name == "get-cart":
        payload = GetCartInput.model_validate(args)
        result = await get_cart(payload.cart_id)
        return types.ServerResult(
            types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text",
                        text=f"Cart has {result.get('itemCount', 0)} items",
                    )
                ],
                structuredContent=result,
                _meta=result.get("_meta", _cart_meta(payload.cart_id)),
            )
        )

    elif tool_name == "checkout":
        payload = CheckoutInput.model_validate(args)
        result = await checkout(payload.cart_id)
        success = result.get("success", False)
        message = result.get("message", "Checkout failed")
        return types.ServerResult(
            types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text",
                        text=message,
                    )
                ],
                structuredContent=result,
                _meta=result.get("_meta", _checkout_meta(success)),
            )
        )

    # Unknown tool
    return types.ServerResult(
        types.CallToolResult(
            content=[types.TextContent(type="text", text=f"Unknown tool: {tool_name}")],
            isError=True,
        )
    )


# Register the handler
# pyright: ignore[reportPrivateUsage]
mcp._mcp_server.request_handlers[types.CallToolRequest] = _handle_call_tool  # pyright: ignore[reportPrivateUsage]


# =============================================================================
# FASTAPI APPLICATION
# =============================================================================

# Path to widget dist directory
DIST_DIR = Path(__file__).parent / "dist"


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan context manager.

    Initializes the MCP server session manager within the lifespan context.

    Args:
        _app: FastAPI application instance (unused but required by protocol).

    Yields:
        None
    """
    logger.info("Apps SDK MCP Server starting up...")
    logger.info(f"Widget dist directory: {DIST_DIR}")

    # Initialize MCP server's session manager
    async with mcp.session_manager.run():
        logger.info("MCP session manager initialized")
        yield

    logger.info("Apps SDK MCP Server shutting down...")


# Create main FastAPI app first so we can define routes before mounting MCP
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Apps SDK MCP Server for ACP Merchant Widget",
    lifespan=lifespan,
)

# Create the FastAPI app from MCP's streamable HTTP app
# Mount at /api so the MCP endpoint becomes /api/mcp
mcp_app = mcp.streamable_http_app()
app.mount("/api", mcp_app)

# Add CORS middleware for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.debug else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# WIDGET SERVING ROUTES
# =============================================================================


@app.get("/widget/merchant-app.html", tags=["widget"], response_model=None)
async def serve_widget() -> FileResponse | HTMLResponse:
    """Serve the merchant app widget HTML.

    Returns:
        The widget HTML file or a placeholder if not built.
    """
    # Vite outputs index.html by default
    widget_path = DIST_DIR / "index.html"
    if widget_path.exists():
        return FileResponse(widget_path, media_type="text/html")
    else:
        # Return a placeholder if widget not built yet
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


@app.get("/widget/{asset:path}", tags=["widget"], response_model=None)
async def serve_widget_assets(asset: str) -> FileResponse | HTMLResponse:
    """Serve widget assets (images, etc.).

    Args:
        asset: The asset path to serve.

    Returns:
        The asset file or a 404 error.
    """
    asset_path = DIST_DIR / asset
    if asset_path.exists() and asset_path.is_file():
        return FileResponse(asset_path)
    return HTMLResponse(content="Asset not found", status_code=404)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    """Health check endpoint.

    Returns:
        A dictionary with status "ok".
    """
    return {"status": "ok"}
