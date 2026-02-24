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
    emit_recommendation_complete_event,
    emit_recommendation_pending_event,
)
from src.apps_sdk.events import (
    router as events_router,
)
from src.apps_sdk.recommendation_helpers import (
    call_recommendation_agent,
    record_purchase_attribution as _record_purchase_attribution,
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
    CreateCheckoutSessionInput,
    GetCartInput,
    GetRecommendationsInput,
    GetRecommendationsOutput,
    PipelineTraceOutput,
    ProductOutput,
    RecommendationItemOutput,
    RemoveFromCartInput,
    SearchProductsInput,
    SearchProductsOutput,
    TrackRecommendationClickInput,
    UpdateCartQuantityInput,
    UpdateCheckoutSessionInput,
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
from src.apps_sdk.tools.acp_sessions import create_acp_session, update_acp_session
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
        types.Tool(
            name="create-checkout-session",
            title="Create Checkout Session",
            description="Create a new ACP checkout session with the Merchant API. Returns session with line items, promotions, and totals.",
            inputSchema=CreateCheckoutSessionInput.model_json_schema(by_alias=True),
            annotations=types.ToolAnnotations(
                destructiveHint=False,
                openWorldHint=True,
                readOnlyHint=False,
            ),
        ),
        types.Tool(
            name="update-checkout-session",
            title="Update Checkout Session",
            description="Update an existing ACP checkout session (items, shipping, discounts). Returns updated session with recalculated totals.",
            inputSchema=UpdateCheckoutSessionInput.model_json_schema(by_alias=True),
            annotations=types.ToolAnnotations(
                destructiveHint=False,
                openWorldHint=True,
                readOnlyHint=False,
            ),
        ),
        types.Tool(
            name="track-recommendation-click",
            title="Track Recommendation Click",
            description="Record a recommendation click event for attribution analytics.",
            inputSchema=TrackRecommendationClickInput.model_json_schema(by_alias=True),
            annotations=types.ToolAnnotations(
                destructiveHint=False,
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


def _ok(text: str, result: dict[str, Any], **kwargs: Any) -> types.ServerResult:
    """Build a successful ServerResult with text + structured content."""
    return types.ServerResult(
        types.CallToolResult(
            content=[types.TextContent(type="text", text=text)],
            structuredContent=result,
            **kwargs,
        )
    )


def _err(text: str, **kwargs: Any) -> types.ServerResult:
    """Build an error ServerResult."""
    return types.ServerResult(
        types.CallToolResult(
            content=[types.TextContent(type="text", text=text)],
            isError=True,
            **kwargs,
        )
    )


# ---------------------------------------------------------------------------
# Individual tool handlers
# ---------------------------------------------------------------------------


async def _handle_search_products(args: dict[str, Any]) -> types.ServerResult:
    payload = SearchProductsInput.model_validate(args)
    started = time.perf_counter()
    result = await search_products(payload.query, payload.category, payload.limit)
    error_message = (
        str(result.get("error")) if result.get("error") is not None else None
    )
    status, error_code = _classify_outcome_status(
        agent_type="search", error_message=error_message,
    )
    await _record_apps_sdk_outcome(
        agent_type="search",
        status=status,
        latency_ms=int((time.perf_counter() - started) * 1000),
        error_code=error_code,
    )
    meta = result.get("_meta", _search_meta())
    if result.get("error"):
        return _err(str(result.get("error")), structuredContent=result, _meta=meta)
    return _ok(
        f"Found {result.get('totalResults', 0)} products for '{payload.query}'",
        result,
        _meta=meta,
    )


async def _handle_add_to_cart(args: dict[str, Any]) -> types.ServerResult:
    payload = AddToCartInput.model_validate(args)
    result = await add_to_cart(payload.product_id, payload.quantity, payload.cart_id)
    return _ok(
        f"Added {payload.quantity} item(s) to cart",
        result,
        _meta=result.get("_meta", _cart_meta(result.get("cartId", ""))),
    )


async def _handle_remove_from_cart(args: dict[str, Any]) -> types.ServerResult:
    payload = RemoveFromCartInput.model_validate(args)
    result = await remove_from_cart(payload.product_id, payload.cart_id)
    return _ok(
        "Item removed from cart",
        result,
        _meta=result.get("_meta", _cart_meta(payload.cart_id)),
    )


async def _handle_update_cart_quantity(args: dict[str, Any]) -> types.ServerResult:
    payload = UpdateCartQuantityInput.model_validate(args)
    result = await update_cart_quantity(
        payload.product_id, payload.quantity, payload.cart_id,
    )
    return _ok(
        f"Cart quantity updated to {payload.quantity}",
        result,
        _meta=result.get("_meta", _cart_meta(payload.cart_id)),
    )


async def _handle_get_cart(args: dict[str, Any]) -> types.ServerResult:
    payload = GetCartInput.model_validate(args)
    result = await get_cart(payload.cart_id)
    return _ok(
        f"Cart has {result.get('itemCount', 0)} items",
        result,
        _meta=result.get("_meta", _cart_meta(payload.cart_id)),
    )


async def _handle_checkout(args: dict[str, Any]) -> types.ServerResult:
    payload = CheckoutInput.model_validate(args)

    if payload.cart_items:
        from src.apps_sdk.tools.cart import carts

        carts[payload.cart_id] = [
            {
                "id": item.get("id"),
                "name": item.get("name"),
                "basePrice": item.get("basePrice"),
                "quantity": item.get("quantity"),
                "variant": item.get("variant"),
                "size": item.get("size"),
            }
            for item in payload.cart_items
        ]

    result = await checkout(payload.cart_id, customer_name=payload.customer_name)

    if result.get("success") and payload.cart_items:
        await _record_purchase_attribution(
            cart_items=payload.cart_items,
            session_id=payload.cart_id,
            order_id=str(result.get("orderId") or ""),
        )

    success = result.get("success", False)
    return _ok(
        result.get("message", "Checkout failed"),
        result,
        _meta=result.get("_meta", _checkout_meta(success)),
    )


async def _handle_get_recommendations(args: dict[str, Any]) -> types.ServerResult:
    payload = GetRecommendationsInput.model_validate(args)
    recommendation_request_id = f"rec_{uuid4().hex[:12]}"

    rec_event_id = f"agent_rec_{uuid4().hex[:12]}"
    cart_items_for_sse = [
        {"productId": ci.product_id, "name": ci.name, "price": ci.price}
        for ci in payload.cart_items
    ]

    emit_recommendation_pending_event(
        event_id=rec_event_id,
        product_id=payload.product_id,
        product_name=payload.product_name,
        cart_items=cart_items_for_sse,
    )

    started = time.perf_counter()
    result = await call_recommendation_agent(
        payload.product_id, payload.product_name, payload.cart_items,
    )
    error_message = (
        str(result.get("error")) if result.get("error") is not None else None
    )
    status, error_code = _classify_outcome_status(
        agent_type="recommendation", error_message=error_message,
    )
    await _record_apps_sdk_outcome(
        agent_type="recommendation",
        status=status,
        latency_ms=int((time.perf_counter() - started) * 1000),
        error_code=error_code,
    )

    raw_recommendations = _extract_raw_recommendations(result)
    await _record_recommendation_impressions(
        raw_recommendations, payload.session_id, recommendation_request_id,
    )

    result["recommendationRequestId"] = recommendation_request_id
    latency_ms = int((time.perf_counter() - started) * 1000)

    emit_recommendation_complete_event(
        event_id=rec_event_id,
        product_id=payload.product_id,
        product_name=payload.product_name,
        cart_items=cart_items_for_sse,
        recommendations=[
            {
                "productId": rec.get("product_id") or rec.get("productId") or "",
                "productName": rec.get("product_name") or rec.get("productName") or "",
                "rank": rec.get("rank", idx + 1),
                "reasoning": rec.get("reasoning", ""),
            }
            for idx, rec in enumerate(raw_recommendations)
        ],
        user_intent=result.get("userIntent"),
        pipeline_trace=result.get("pipelineTrace"),
        recommendation_request_id=recommendation_request_id,
        latency_ms=latency_ms,
        error=error_message,
    )

    return _ok(
        f"Found {len(raw_recommendations)} recommendations",
        result,
        _meta=_recommendations_meta(),
    )


def _extract_raw_recommendations(result: dict[str, Any]) -> list[dict[str, Any]]:
    """Extract and normalise the recommendations list from the agent response."""
    raw_value: Any = result.get("recommendations")
    if not isinstance(raw_value, list):
        return []
    return [
        cast(dict[str, Any], rec)
        for rec in cast(list[Any], raw_value)
        if isinstance(rec, dict)
    ]


async def _record_recommendation_impressions(
    raw_recommendations: list[dict[str, Any]],
    session_id: str | None,
    recommendation_request_id: str,
) -> None:
    """Record an impression attribution event for each recommendation."""
    for index, rec in enumerate(raw_recommendations):
        product_id = rec.get("product_id") or rec.get("productId")
        if not isinstance(product_id, str) or not product_id:
            continue
        position_value = rec.get("rank")
        position = (
            int(position_value) if isinstance(position_value, int) else index + 1
        )
        await _record_recommendation_attribution_event(
            event_type="impression",
            product_id=product_id,
            session_id=session_id,
            recommendation_request_id=recommendation_request_id,
            position=position,
        )


async def _handle_create_checkout_session(args: dict[str, Any]) -> types.ServerResult:
    payload = CreateCheckoutSessionInput.model_validate(args)
    try:
        result = await create_acp_session(
            items=payload.items,
            buyer=payload.buyer,
            fulfillment_address=payload.fulfillment_address,
            discounts=payload.discounts,
        )
        return _ok(f"Checkout session {result.get('id', '')} created", result)
    except Exception as e:
        logger.exception("create-checkout-session failed")
        return _err(str(e))


async def _handle_update_checkout_session(args: dict[str, Any]) -> types.ServerResult:
    payload = UpdateCheckoutSessionInput.model_validate(args)
    try:
        result = await update_acp_session(
            session_id=payload.session_id,
            items=payload.items,
            fulfillment_option_id=payload.fulfillment_option_id,
            fulfillment_address=payload.fulfillment_address,
            discounts=payload.discounts,
        )
        return _ok(f"Session {payload.session_id} updated", result)
    except Exception as e:
        logger.exception("update-checkout-session failed for %s", payload.session_id)
        return _err(str(e))


async def _handle_track_recommendation_click(args: dict[str, Any]) -> types.ServerResult:
    payload = TrackRecommendationClickInput.model_validate(args)
    await _record_recommendation_attribution_event(
        event_type="click",
        product_id=payload.product_id,
        session_id=payload.session_id,
        recommendation_request_id=payload.recommendation_request_id,
        position=payload.position,
        source=payload.source,
    )
    return _ok("Click tracked", {"recorded": True})


# ---------------------------------------------------------------------------
# Dispatch table — maps tool name to handler
# ---------------------------------------------------------------------------

_TOOL_HANDLERS: dict[
    str,
    Any,  # Callable[[dict[str, Any]], Awaitable[types.ServerResult]]
] = {
    "search-products": _handle_search_products,
    "add-to-cart": _handle_add_to_cart,
    "remove-from-cart": _handle_remove_from_cart,
    "update-cart-quantity": _handle_update_cart_quantity,
    "get-cart": _handle_get_cart,
    "checkout": _handle_checkout,
    "get-recommendations": _handle_get_recommendations,
    "create-checkout-session": _handle_create_checkout_session,
    "update-checkout-session": _handle_update_checkout_session,
    "track-recommendation-click": _handle_track_recommendation_click,
}


async def _handle_call_tool(req: types.CallToolRequest) -> types.ServerResult:
    """Route and handle all tool calls."""
    tool_name = req.params.name
    handler = _TOOL_HANDLERS.get(tool_name)
    if handler is None:
        return _err(f"Unknown tool: {tool_name}")
    return await handler(req.params.arguments or {})


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
    "CreateCheckoutSessionInput",
    "UpdateCheckoutSessionInput",
    "TrackRecommendationClickInput",
    # Shared ACP session functions.
    "create_acp_session",
    "update_acp_session",
]
