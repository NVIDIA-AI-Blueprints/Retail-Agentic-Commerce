"""FastAPI + MCP Server entry point for the Apps SDK Merchant Widget.

Run with:
    uvicorn src.apps_sdk.main:app --reload --port 2091
"""

from __future__ import annotations

import logging
import time
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Any, cast
from uuid import uuid4

import mcp.types as types
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mcp.server.fastmcp import FastMCP
from mcp.server.transport_security import TransportSecuritySettings

from src.apps_sdk.config import get_apps_sdk_settings
from src.apps_sdk.events import (
    emit_agent_activity_event,
    emit_checkout_event,
)
from src.apps_sdk.events import (
    router as events_router,
)
from src.apps_sdk.recommendation_helpers import (
    call_recommendation_agent,
)
from src.apps_sdk.recommendation_helpers import (
    cart_meta as _cart_meta,
)
from src.apps_sdk.recommendation_helpers import (
    checkout_meta as _checkout_meta,
)
from src.apps_sdk.recommendation_helpers import (
    classify_outcome_status as _classify_outcome_status,
)
from src.apps_sdk.recommendation_helpers import (
    recommendations_meta as _recommendations_meta,
)
from src.apps_sdk.recommendation_helpers import (
    record_apps_sdk_outcome as _record_apps_sdk_outcome,
)
from src.apps_sdk.recommendation_helpers import (
    record_recommendation_attribution_event as _record_recommendation_attribution_event,
)
from src.apps_sdk.recommendation_helpers import (
    search_meta as _search_meta,
)
from src.apps_sdk.rest_endpoints import active_sessions
from src.apps_sdk.rest_endpoints import router as rest_router
from src.apps_sdk.schemas import (
    AddToCartInput,
    CartItemInput,
    CartOutput,
    CheckoutInput,
    CheckoutOutput,
    GetCartInput,
    GetRecommendationsInput,
    GetRecommendationsOutput,
    PipelineTraceOutput,
    ProductOutput,
    RecommendationItemOutput,
    RemoveFromCartInput,
    SearchProductsInput,
    SearchProductsOutput,
    UpdateCartQuantityInput,
    UserOutput,
)
from src.apps_sdk.tools import (
    add_to_cart,
    checkout,
    get_cart,
    remove_from_cart,
    search_products,
    update_cart_quantity,
)
from src.apps_sdk.widget_endpoints import (
    DIST_DIR,
    PUBLIC_DIR,
    health_check,
    serve_widget,
    serve_widget_assets,
)
from src.apps_sdk.widget_endpoints import (
    router as widget_router,
)

settings = get_apps_sdk_settings()

# Agent URLs
RECOMMENDATION_AGENT_URL = settings.recommendation_agent_url
SEARCH_AGENT_URL = settings.search_agent_url

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
# MCP TOOL REGISTRATION
# =============================================================================


@mcp._mcp_server.list_tools()  # pyright: ignore[reportPrivateUsage]
async def list_mcp_tools() -> list[types.Tool]:
    """Register all available MCP tools with JSON Schema input/output contracts."""
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
    """Route and handle all tool calls."""
    tool_name = req.params.name
    args = req.params.arguments or {}

    if tool_name == "search-products":
        payload = SearchProductsInput.model_validate(args)
        started = time.perf_counter()
        result = await search_products(payload.query, payload.category, payload.limit)
        error_message = (
            str(result.get("error")) if result.get("error") is not None else None
        )
        status, error_code = _classify_outcome_status(
            agent_type="search",
            error_message=error_message,
        )
        await _record_apps_sdk_outcome(
            agent_type="search",
            status=status,
            latency_ms=int((time.perf_counter() - started) * 1000),
            error_code=error_code,
        )
        if result.get("error"):
            return types.ServerResult(
                types.CallToolResult(
                    content=[
                        types.TextContent(
                            type="text",
                            text=str(result.get("error")),
                        )
                    ],
                    structuredContent=result,
                    _meta=result.get("_meta", _search_meta()),
                    isError=True,
                )
            )
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

    if tool_name == "add-to-cart":
        payload = AddToCartInput.model_validate(args)
        result = await add_to_cart(payload.product_id, payload.quantity, payload.cart_id)
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

    if tool_name == "remove-from-cart":
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

    if tool_name == "update-cart-quantity":
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

    if tool_name == "get-cart":
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

    if tool_name == "checkout":
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

    if tool_name == "get-recommendations":
        payload = GetRecommendationsInput.model_validate(args)
        recommendation_request_id = f"rec_{uuid4().hex[:12]}"
        started = time.perf_counter()
        result = await call_recommendation_agent(
            payload.product_id,
            payload.product_name,
            payload.cart_items,
        )
        error_message = (
            str(result.get("error")) if result.get("error") is not None else None
        )
        status, error_code = _classify_outcome_status(
            agent_type="recommendation",
            error_message=error_message,
        )
        await _record_apps_sdk_outcome(
            agent_type="recommendation",
            status=status,
            latency_ms=int((time.perf_counter() - started) * 1000),
            error_code=error_code,
        )
        raw_recommendations_value: Any = result.get("recommendations")
        raw_recommendations: list[dict[str, Any]] = (
            [
                cast(dict[str, Any], rec)
                for rec in cast(list[Any], raw_recommendations_value)
                if isinstance(rec, dict)
            ]
            if isinstance(raw_recommendations_value, list)
            else []
        )
        for index, rec in enumerate(raw_recommendations):
            product_id = rec.get("product_id") or rec.get("productId")
            if not isinstance(product_id, str) or not product_id:
                continue
            position_value = rec.get("rank")
            position = int(position_value) if isinstance(position_value, int) else index + 1
            await _record_recommendation_attribution_event(
                event_type="impression",
                product_id=product_id,
                session_id=payload.session_id,
                recommendation_request_id=recommendation_request_id,
                position=position,
            )
        result["recommendationRequestId"] = recommendation_request_id
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


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan context manager."""
    logger.info("Apps SDK MCP Server starting up...")
    logger.info(f"Widget dist directory: {DIST_DIR}")
    logger.info(f"Search agent URL: {SEARCH_AGENT_URL}")

    async with mcp.session_manager.run():
        logger.info("MCP session manager initialized")
        yield

    logger.info("Apps SDK MCP Server shutting down...")


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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.debug else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include HTTP routes extracted from main.py.
app.include_router(widget_router)
app.include_router(events_router)
app.include_router(rest_router)


__all__ = [
    "app",
    "mcp",
    # Shared constants/functions used by tests and runtime imports.
    "DIST_DIR",
    "PUBLIC_DIR",
    "active_sessions",
    "emit_checkout_event",
    "emit_agent_activity_event",
    "health_check",
    "serve_widget",
    "serve_widget_assets",
    # Recommendation helper exports used by tests.
    "call_recommendation_agent",
    "_classify_outcome_status",
    "_record_apps_sdk_outcome",
    "_record_recommendation_attribution_event",
    # Schema exports used by tests.
    "CartItemInput",
    "GetRecommendationsInput",
    "RecommendationItemOutput",
    "PipelineTraceOutput",
    "GetRecommendationsOutput",
    "ProductOutput",
    "UserOutput",
]
