"""Pydantic schemas for Apps SDK MCP tools and REST endpoints."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


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
    cart_items: list[dict[str, Any]] | None = Field(
        None,
        alias="cartItems",
        description="Optional cart items to sync before checkout (widget use case)",
    )
    customer_name: str | None = Field(
        None,
        alias="customerName",
        description="Optional customer name for personalized messages",
    )

    model_config = ConfigDict(populate_by_name=True, extra="forbid")


class SearchProductsInput(BaseModel):
    """Schema for search-products tool (entry point for widget discovery)."""

    query: str = Field(..., description="Search query for products")
    category: str | None = Field(None, description="Optional category filter")
    limit: int = Field(default=3, ge=1, le=50, description="Max results (1-50)")

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
    session_id: str | None = Field(
        None,
        alias="sessionId",
        description="Optional cart/session identifier for attribution tracking",
    )

    model_config = ConfigDict(populate_by_name=True, extra="forbid")


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
    recommendationRequestId: str | None = Field(
        None,
        alias="recommendationRequestId",
        description="Identifier for click/purchase attribution across this recommendation set",
    )
    error: str | None = Field(None, description="Error message if request failed")

    model_config = ConfigDict(populate_by_name=True)


class RecommendationClickRequest(BaseModel):
    """Request body for recommendation click tracking."""

    product_id: str = Field(..., alias="productId")
    recommendation_request_id: str = Field(..., alias="recommendationRequestId")
    session_id: str | None = Field(None, alias="sessionId")
    position: int | None = None
    source: str = Field(default="apps_sdk_widget")

    model_config = ConfigDict(populate_by_name=True)


class CartAddRequest(BaseModel):
    """Request body for adding an item to cart."""

    product_id: str = Field(..., alias="productId")
    quantity: int = Field(default=1, ge=1)
    cart_id: str | None = Field(None, alias="cartId")

    model_config = ConfigDict(populate_by_name=True)


class CartCheckoutRequest(BaseModel):
    """Request body for checkout."""

    cart_id: str = Field(..., alias="cartId")
    cart_items: list[dict[str, Any]] = Field(..., alias="cartItems")
    customer_name: str | None = Field(None, alias="customerName")

    model_config = ConfigDict(populate_by_name=True)


class CartUpdateRequest(BaseModel):
    """Request body for updating cart (quantity changes)."""

    cart_id: str = Field(..., alias="cartId")
    cart_items: list[dict[str, Any]] = Field(..., alias="cartItems")
    action: str = Field(default="update")  # "update", "remove", "clear"

    model_config = ConfigDict(populate_by_name=True)


class ShippingUpdateRequest(BaseModel):
    """Request body for updating shipping option."""

    cart_id: str = Field(..., alias="cartId")
    shipping_option_id: str = Field(..., alias="shippingOptionId")
    shipping_option_name: str = Field(..., alias="shippingOptionName")
    shipping_price: int = Field(..., alias="shippingPrice")

    model_config = ConfigDict(populate_by_name=True)


class ACPCreateSessionRequest(BaseModel):
    """Request to create a checkout session via ACP."""

    items: list[dict[str, Any]] = Field(...)
    buyer: dict[str, str] | None = Field(None)
    fulfillment_address: dict[str, str] | None = Field(None, alias="fulfillmentAddress")
    discounts: dict[str, list[str]] | None = Field(None)

    model_config = ConfigDict(populate_by_name=True)


class ACPUpdateSessionRequest(BaseModel):
    """Request to update a checkout session via ACP."""

    session_id: str = Field(..., alias="sessionId")
    items: list[dict[str, Any]] | None = Field(None)
    fulfillment_option_id: str | None = Field(None, alias="fulfillmentOptionId")
    fulfillment_address: dict[str, str] | None = Field(None, alias="fulfillmentAddress")
    discounts: dict[str, list[str]] | None = Field(None)

    model_config = ConfigDict(populate_by_name=True)


# =============================================================================
# MCP Tool Input Schemas (used by callTool from widget)
# =============================================================================


class CreateCheckoutSessionInput(BaseModel):
    """Schema for create-checkout-session MCP tool."""

    items: list[dict[str, Any]] = Field(..., description="Items with id and quantity")
    buyer: dict[str, str] | None = Field(
        None, description="Buyer info (first_name, last_name, email)"
    )
    fulfillment_address: dict[str, str] | None = Field(
        None, alias="fulfillmentAddress", description="Shipping address"
    )
    discounts: dict[str, list[str]] | None = Field(None, description="Discount codes")

    model_config = ConfigDict(populate_by_name=True, extra="forbid")


class UpdateCheckoutSessionInput(BaseModel):
    """Schema for update-checkout-session MCP tool."""

    session_id: str = Field(..., alias="sessionId", description="Session ID to update")
    items: list[dict[str, Any]] | None = Field(None, description="Updated items")
    fulfillment_option_id: str | None = Field(
        None, alias="fulfillmentOptionId", description="Selected fulfillment option"
    )
    fulfillment_address: dict[str, str] | None = Field(
        None, alias="fulfillmentAddress", description="Updated shipping address"
    )
    discounts: dict[str, list[str]] | None = Field(None, description="Discount codes")

    model_config = ConfigDict(populate_by_name=True, extra="forbid")


class TrackRecommendationClickInput(BaseModel):
    """Schema for track-recommendation-click MCP tool."""

    product_id: str = Field(..., alias="productId", description="Clicked product ID")
    recommendation_request_id: str = Field(
        ...,
        alias="recommendationRequestId",
        description="Recommendation request ID for attribution",
    )
    session_id: str | None = Field(
        None, alias="sessionId", description="Cart/session ID"
    )
    position: int | None = Field(None, description="Position in recommendation list")
    source: str = Field(
        default="apps_sdk_widget", description="Click source identifier"
    )

    model_config = ConfigDict(populate_by_name=True, extra="forbid")
