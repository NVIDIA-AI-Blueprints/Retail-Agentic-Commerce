"""FastAPI + MCP Server entry point for the Apps SDK Merchant Widget.

Run with:
    uvicorn src.apps_sdk.main:app --reload --port 2091
"""

from __future__ import annotations

import json
import logging
import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, cast

import httpx
import mcp.types as types
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mcp.server.fastmcp import FastMCP
from mcp.server.transport_security import TransportSecuritySettings
from pydantic import BaseModel, ConfigDict, Field
from starlette.responses import FileResponse, HTMLResponse, Response

from src.apps_sdk.config import get_apps_sdk_settings
from src.apps_sdk.tools import (
    add_to_cart,
    checkout,
    get_cart,
    remove_from_cart,
    search_products,
    update_cart_quantity,
)

# ARAG Recommendation Agent URL
RECOMMENDATION_AGENT_URL = os.getenv(
    "RECOMMENDATION_AGENT_URL", "http://localhost:8004"
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


class CartItemInput(BaseModel):
    """Schema for a cart item in recommendation requests."""

    product_id: str = Field(..., alias="productId", description="Product ID")
    name: str = Field(..., description="Product name")
    price: int = Field(..., description="Product price in cents")

    model_config = ConfigDict(populate_by_name=True, extra="forbid")


class GetRecommendationsInput(BaseModel):
    """Schema for get-recommendations tool."""

    product_id: str = Field(
        ..., alias="productId", description="Product ID to get recommendations for"
    )
    product_name: str = Field(..., alias="productName", description="Product name")
    cart_items: list[CartItemInput] = Field(
        default=[],
        alias="cartItems",
        description="Current cart items for context",
    )

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


class RecommendationItemOutput(BaseModel):
    """Schema for a single recommendation item."""

    productId: str = Field(..., alias="productId", description="Product ID")
    productName: str = Field(..., alias="productName", description="Product name")
    rank: int = Field(..., description="Ranking position (1-3)")
    reasoning: str = Field(..., description="Why this was recommended")

    model_config = ConfigDict(populate_by_name=True)


class PipelineTraceOutput(BaseModel):
    """Schema for ARAG pipeline trace."""

    candidatesFound: int = Field(
        ..., alias="candidatesFound", description="Total candidates found"
    )
    afterNliFilter: int = Field(
        ..., alias="afterNliFilter", description="Candidates after NLI filtering"
    )
    finalRanked: int = Field(..., alias="finalRanked", description="Final ranked count")

    model_config = ConfigDict(populate_by_name=True)


class GetRecommendationsOutput(BaseModel):
    """Output schema for get-recommendations tool."""

    recommendations: list[RecommendationItemOutput] = Field(
        default=[], description="List of recommended products"
    )
    userIntent: str | None = Field(
        None, alias="userIntent", description="Inferred user intent"
    )
    pipelineTrace: PipelineTraceOutput | None = Field(
        None, alias="pipelineTrace", description="ARAG pipeline trace"
    )
    error: str | None = Field(None, description="Error message if request failed")

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


def _recommendations_meta() -> dict[str, Any]:
    """Metadata for recommendations tool."""
    return {
        "openai/toolInvocation/invoking": "Getting recommendations...",
        "openai/toolInvocation/invoked": "Recommendations ready",
    }


def _parse_agent_response(raw_result: Any) -> dict[str, Any]:
    """Parse the ARAG agent response into a typed dictionary.

    NAT agents return {"value": "<JSON string>"} format.

    Args:
        raw_result: Raw JSON response from the agent.

    Returns:
        Parsed dictionary with recommendations, user_intent, pipeline_trace.
    """
    parsed: dict[str, Any] = {}

    if isinstance(raw_result, dict):
        # Cast to properly typed dict for pyright
        result_dict = cast(dict[str, Any], raw_result)
        value = result_dict.get("value")
        if isinstance(value, str):
            # Value is a JSON string
            loaded = json.loads(value)
            if isinstance(loaded, dict):
                parsed = cast(dict[str, Any], loaded)
        elif isinstance(value, dict):
            # Value is already a dict
            parsed = cast(dict[str, Any], value)
        elif "recommendations" in result_dict:
            # Direct response format
            parsed = result_dict
    elif isinstance(raw_result, str):
        loaded = json.loads(raw_result)
        if isinstance(loaded, dict):
            parsed = cast(dict[str, Any], loaded)

    return parsed


async def call_recommendation_agent(
    product_id: str,
    product_name: str,
    cart_items: list[CartItemInput],
) -> dict[str, Any]:
    """Call the ARAG recommendation agent at port 8004.

    Args:
        product_id: The product ID to get recommendations for.
        product_name: The product name.
        cart_items: Current cart items for context.

    Returns:
        Dictionary with recommendations, userIntent, and pipelineTrace.
    """
    # Build cart items for the agent
    agent_cart_items = [
        {
            "product_id": product_id,
            "name": product_name,
            "category": "apparel",
            "price": 2500,  # Default price, could be passed in
        }
    ]

    # Add existing cart items
    for item in cart_items:
        agent_cart_items.append(
            {
                "product_id": item.product_id,
                "name": item.name,
                "category": "apparel",
                "price": item.price,
            }
        )

    payload = {
        "input_message": json.dumps(
            {
                "cart_items": agent_cart_items,
                "session_context": {
                    "browse_history": ["casual wear", "t-shirts"],
                    "price_range_viewed": [2000, 5000],
                },
            }
        )
    }

    try:
        # Agent can take 20-30 seconds for ARAG pipeline
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{RECOMMENDATION_AGENT_URL}/generate",
                json=payload,
            )
            response.raise_for_status()
            raw_result = response.json()

            # Parse the agent response
            # NAT agents return {"value": "<JSON string>"} format
            parsed_result: dict[str, Any] = _parse_agent_response(raw_result)

            recommendations: list[dict[str, Any]] = list(
                parsed_result.get("recommendations", [])
            )
            # Enrich with product details from merchant API
            enriched = await enrich_recommendations(recommendations)

            return {
                "recommendations": enriched,
                "userIntent": parsed_result.get("user_intent"),
                "pipelineTrace": parsed_result.get("pipeline_trace"),
            }
    except httpx.TimeoutException:
        logger.error("Recommendation agent timeout")
        return {"recommendations": [], "error": "Recommendation agent timeout"}
    except httpx.HTTPStatusError as e:
        logger.error(f"Recommendation agent HTTP error: {e}")
        return {
            "recommendations": [],
            "error": f"Agent error: {e.response.status_code}",
        }
    except (httpx.ConnectError, httpx.ConnectTimeout) as e:
        logger.warning(f"Recommendation agent not available: {e}")
        return {"recommendations": [], "error": "Recommendation agent unavailable"}
    except Exception as e:
        logger.error(f"Recommendation agent error: {e}")
        return {"recommendations": [], "error": str(e)}


# Merchant API URL for product lookups
MERCHANT_API_URL = os.environ.get("MERCHANT_API_URL", "http://localhost:8000")


async def enrich_recommendations(
    recommendations: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Enrich recommendations with full product details from merchant API.

    Fetches product details (price, sku, image_url, stock) for each recommendation
    so the widget can display accurate information.

    Args:
        recommendations: List of recommendation dicts with product_id and product_name.

    Returns:
        Enriched recommendations with price, sku, image_url, and stock_count added.
    """
    if not recommendations:
        return recommendations

    async with httpx.AsyncClient(timeout=5.0) as client:
        for rec in recommendations:
            product_id = rec.get("product_id")
            if not product_id:
                continue

            try:
                response = await client.get(f"{MERCHANT_API_URL}/products/{product_id}")
                if response.status_code == 200:
                    product = response.json()
                    rec["price"] = product.get("base_price")
                    rec["sku"] = product.get("sku")
                    rec["image_url"] = product.get("image_url")
                    rec["stock_count"] = product.get("stock_count")
                    # Also ensure product_name matches the database
                    rec["product_name"] = product.get("name", rec.get("product_name"))
                else:
                    logger.warning(f"Product {product_id} not found in merchant API")
            except Exception as e:
                logger.warning(f"Failed to enrich product {product_id}: {e}")
                # Keep original recommendation data if lookup fails

    return recommendations


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
        types.Tool(
            name="get-recommendations",
            title="Get Recommendations",
            description="Get personalized product recommendations based on current product and cart context. Uses ARAG agent.",
            inputSchema=GetRecommendationsInput.model_json_schema(by_alias=True),
            outputSchema=GetRecommendationsOutput.model_json_schema(by_alias=True),
            _meta=_recommendations_meta(),
            annotations=types.ToolAnnotations(
                destructiveHint=False,
                openWorldHint=True,
                readOnlyHint=True,
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

    elif tool_name == "get-recommendations":
        payload = GetRecommendationsInput.model_validate(args)
        result = await call_recommendation_agent(
            payload.product_id,
            payload.product_name,
            payload.cart_items,
        )
        rec_count = len(result.get("recommendations", []))
        return types.ServerResult(
            types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text",
                        text=f"Found {rec_count} recommendations",
                    )
                ],
                structuredContent=result,
                _meta=_recommendations_meta(),
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
# Path to widget public assets (images)
PUBLIC_DIR = Path(__file__).parent / "web" / "public"


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
async def serve_widget() -> Response | HTMLResponse:
    """Serve the merchant app widget HTML.

    Returns:
        The widget HTML file or a placeholder if not built.
        Includes no-cache headers to prevent browser caching during development.
    """
    # Vite outputs index.html by default
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

    Checks both dist/ and web/public/ directories for assets.
    This allows the widget to load images from the public folder.

    Args:
        asset: The asset path to serve.

    Returns:
        The asset file or a 404 error.
    """
    # First check dist directory
    asset_path = DIST_DIR / asset
    if asset_path.exists() and asset_path.is_file():
        return FileResponse(asset_path)

    # Then check public directory for images
    public_asset_path = PUBLIC_DIR / asset
    if public_asset_path.exists() and public_asset_path.is_file():
        return FileResponse(public_asset_path)

    return HTMLResponse(content="Asset not found", status_code=404)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    """Health check endpoint.

    Returns:
        A dictionary with status "ok".
    """
    return {"status": "ok"}
