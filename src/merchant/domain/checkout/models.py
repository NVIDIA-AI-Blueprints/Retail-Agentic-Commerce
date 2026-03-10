# SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Pydantic schemas for ACP checkout session endpoints.

Based on the Agentic Checkout Protocol specification (docs/acp-spec.md).
"""

from enum import StrEnum
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

# =============================================================================
# Enums
# =============================================================================


class CheckoutStatusEnum(StrEnum):
    """Checkout session status values."""

    NOT_READY_FOR_PAYMENT = "not_ready_for_payment"
    READY_FOR_PAYMENT = "ready_for_payment"
    COMPLETED = "completed"
    CANCELED = "canceled"


class PaymentProviderEnum(StrEnum):
    """Supported payment providers."""

    STRIPE = "stripe"
    ADYEN = "adyen"


class PaymentMethodEnum(StrEnum):
    """Supported payment methods."""

    CARD = "card"


class SupportedLanguageEnum(StrEnum):
    """Supported languages for post-purchase messages."""

    EN = "en"
    ES = "es"
    FR = "fr"


class FulfillmentTypeEnum(StrEnum):
    """Fulfillment option types."""

    SHIPPING = "shipping"
    DIGITAL = "digital"


class TotalTypeEnum(StrEnum):
    """Total line item types."""

    ITEMS_BASE_AMOUNT = "items_base_amount"
    ITEMS_DISCOUNT = "items_discount"
    SUBTOTAL = "subtotal"
    DISCOUNT = "discount"
    FULFILLMENT = "fulfillment"
    TAX = "tax"
    FEE = "fee"
    TOTAL = "total"


class MessageTypeEnum(StrEnum):
    """Message types."""

    INFO = "info"
    WARNING = "warning"
    ERROR = "error"


class ContentTypeEnum(StrEnum):
    """Content format types."""

    PLAIN = "plain"
    MARKDOWN = "markdown"


class ErrorCodeEnum(StrEnum):
    """Error codes for error messages."""

    MISSING = "missing"
    INVALID = "invalid"
    OUT_OF_STOCK = "out_of_stock"
    PAYMENT_DECLINED = "payment_declined"
    REQUIRES_SIGN_IN = "requires_sign_in"
    REQUIRES_3DS = "requires_3ds"


class LinkTypeEnum(StrEnum):
    """Link types for HATEOAS links."""

    TERMS_OF_USE = "terms_of_use"
    PRIVACY_POLICY = "privacy_policy"
    SELLER_SHOP_POLICIES = "seller_shop_policies"


# =============================================================================
# Input Models (Request Schemas)
# =============================================================================


class ItemInput(BaseModel):
    """Item input for checkout requests."""

    model_config = ConfigDict(extra="forbid")

    id: str = Field(..., description="Product ID")
    quantity: Annotated[int, Field(gt=0, description="Quantity to purchase")]


class BuyerInput(BaseModel):
    """Buyer information input."""

    model_config = ConfigDict(extra="forbid")

    first_name: Annotated[str, Field(max_length=256, description="First name")]
    last_name: Annotated[
        str | None, Field(default=None, max_length=256, description="Last name")
    ] = None
    email: Annotated[str, Field(max_length=256, description="Email address")]
    phone_number: Annotated[
        str | None, Field(default=None, description="Phone number in E.164 format")
    ] = None


class AddressInput(BaseModel):
    """Address input for fulfillment or billing."""

    model_config = ConfigDict(extra="forbid")

    name: Annotated[str, Field(max_length=256, description="Recipient name")]
    line_one: Annotated[str, Field(max_length=60, description="Address line 1")]
    line_two: Annotated[
        str | None, Field(default=None, max_length=60, description="Address line 2")
    ] = None
    city: Annotated[str, Field(max_length=60, description="City/district/suburb")]
    state: Annotated[str, Field(description="State/province/region (ISO 3166-1)")]
    country: Annotated[str, Field(description="Country code (ISO 3166-1)")]
    postal_code: Annotated[str, Field(max_length=20, description="Postal/ZIP code")]
    phone_number: Annotated[
        str | None, Field(default=None, description="Phone number in E.164 format")
    ] = None


class PaymentDataInput(BaseModel):
    """Payment data input for completing checkout."""

    model_config = ConfigDict(extra="forbid")

    token: str = Field(..., description="Payment method token (e.g., spt_123)")
    provider: PaymentProviderEnum = Field(..., description="Payment processor")
    billing_address: AddressInput | None = Field(
        default=None, description="Billing address"
    )


class CreateCheckoutRequest(BaseModel):
    """Request body for creating a checkout session."""

    model_config = ConfigDict(extra="forbid")

    items: Annotated[
        list[ItemInput], Field(min_length=1, description="Items to purchase")
    ]
    buyer: BuyerInput | None = Field(default=None, description="Buyer information")
    fulfillment_address: AddressInput | None = Field(
        default=None, description="Shipping address"
    )
    capabilities: dict[str, object] | None = Field(
        default=None, description="Agent capabilities declaration"
    )
    discounts: dict[str, list[str]] | None = Field(
        default=None, description="Discount extension request payload"
    )
    coupons: list[str] | None = Field(
        default=None,
        description="DEPRECATED alias for discounts.codes",
    )


class UpdateCheckoutRequest(BaseModel):
    """Request body for updating a checkout session."""

    model_config = ConfigDict(extra="forbid")

    items: list[ItemInput] | None = Field(default=None, description="Updated items")
    buyer: BuyerInput | None = Field(default=None, description="Buyer information")
    fulfillment_address: AddressInput | None = Field(
        default=None, description="Shipping address"
    )
    fulfillment_option_id: str | None = Field(
        default=None, description="Selected fulfillment option ID"
    )
    discounts: dict[str, list[str]] | None = Field(
        default=None, description="Discount extension request payload"
    )
    coupons: list[str] | None = Field(
        default=None,
        description="DEPRECATED alias for discounts.codes",
    )


class CompleteCheckoutRequest(BaseModel):
    """Request body for completing a checkout session."""

    model_config = ConfigDict(extra="forbid")

    buyer: BuyerInput | None = Field(default=None, description="Buyer information")
    payment_data: PaymentDataInput = Field(..., description="Payment data")
    preferred_language: SupportedLanguageEnum = Field(
        default=SupportedLanguageEnum.EN,
        description="Preferred language for post-purchase messages (en, es, fr)",
    )


# =============================================================================
# Output Models (Response Schemas)
# =============================================================================


class Item(BaseModel):
    """Item reference in line items."""

    id: str = Field(..., description="Product ID")
    quantity: Annotated[int, Field(gt=0, description="Quantity")]


class Buyer(BaseModel):
    """Buyer information in response."""

    first_name: str = Field(..., description="First name")
    last_name: str | None = Field(default=None, description="Last name")
    email: str = Field(..., description="Email address")
    phone_number: str | None = Field(default=None, description="Phone number")


class Address(BaseModel):
    """Address in response."""

    name: str = Field(..., description="Recipient name")
    line_one: str = Field(..., description="Address line 1")
    line_two: str | None = Field(default=None, description="Address line 2")
    city: str = Field(..., description="City")
    state: str = Field(..., description="State/province")
    country: str = Field(..., description="Country code")
    postal_code: str = Field(..., description="Postal code")
    phone_number: str | None = Field(default=None, description="Phone number")


class PaymentProvider(BaseModel):
    """Payment provider configuration."""

    provider: PaymentProviderEnum = Field(..., description="Payment processor")
    supported_payment_methods: list[PaymentMethodEnum] = Field(
        ..., description="Accepted payment methods"
    )


class PromotionMetadata(BaseModel):
    """Promotion agent decision metadata."""

    action: str = Field(
        ..., description="Promotion action (e.g., DISCOUNT_10_PCT, NO_PROMO)"
    )
    reason_codes: list[str] = Field(
        default_factory=list, description="Reason codes for the decision"
    )
    reasoning: str = Field(default="", description="LLM reasoning for the decision")
    stock_count: int | None = Field(
        default=None, description="Product stock count at time of decision"
    )
    signals: dict[str, str] | None = Field(
        default=None, description="Pre-computed business signals sent to the agent"
    )


class LineItem(BaseModel):
    """Line item in checkout session."""

    id: str = Field(..., description="Line item ID")
    item: Item = Field(..., description="Item reference")
    name: str | None = Field(default=None, description="Product name")
    base_amount: Annotated[
        int, Field(ge=0, description="Base price before adjustments")
    ]
    discount: Annotated[int, Field(ge=0, description="Discount amount")]
    subtotal: Annotated[int, Field(ge=0, description="Amount after adjustments")]
    tax: Annotated[int, Field(ge=0, description="Tax amount")]
    total: Annotated[int, Field(ge=0, description="Final amount")]
    promotion: PromotionMetadata | None = Field(
        default=None, description="Promotion agent decision metadata"
    )


class FulfillmentOptionBase(BaseModel):
    """Base fulfillment option fields."""

    type: FulfillmentTypeEnum = Field(..., description="Fulfillment type")
    id: str = Field(..., description="Unique option ID")
    title: str = Field(..., description="Display title")
    subtitle: str = Field(..., description="Delivery estimate or description")
    subtotal: Annotated[int, Field(ge=0, description="Cost before tax")]
    tax: Annotated[int, Field(ge=0, description="Tax amount")]
    total: Annotated[int, Field(ge=0, description="Total cost")]


class ShippingFulfillmentOption(FulfillmentOptionBase):
    """Shipping fulfillment option."""

    type: FulfillmentTypeEnum = FulfillmentTypeEnum.SHIPPING
    carrier_info: str = Field(..., description="Carrier name")
    earliest_delivery_time: str = Field(..., description="Earliest delivery (RFC 3339)")
    latest_delivery_time: str = Field(..., description="Latest delivery (RFC 3339)")


class DigitalFulfillmentOption(FulfillmentOptionBase):
    """Digital fulfillment option."""

    type: FulfillmentTypeEnum = FulfillmentTypeEnum.DIGITAL


# Union type for fulfillment options
FulfillmentOption = ShippingFulfillmentOption | DigitalFulfillmentOption


class Total(BaseModel):
    """Total line in checkout summary."""

    type: TotalTypeEnum = Field(..., description="Total category")
    display_text: str = Field(..., description="Customer-facing label")
    amount: Annotated[int, Field(ge=0, description="Amount in minor units")]


class Allocation(BaseModel):
    """Allocation breakdown for a discount."""

    path: str = Field(..., description="JSONPath to allocation target")
    amount: Annotated[int, Field(ge=0, description="Allocated amount")]


class Coupon(BaseModel):
    """Coupon or promotion metadata for an applied discount."""

    id: str = Field(..., description="Coupon identifier")
    name: str = Field(..., description="Coupon display name")
    percent_off: float | None = Field(default=None, description="Percentage discount")
    amount_off: int | None = Field(default=None, description="Fixed discount amount")
    currency: str | None = Field(
        default=None, description="Currency for fixed discounts"
    )


class AppliedDiscount(BaseModel):
    """Discount successfully applied to the checkout session."""

    id: str = Field(..., description="Applied discount ID")
    code: str | None = Field(default=None, description="Submitted discount code")
    coupon: Coupon = Field(..., description="Underlying coupon details")
    amount: Annotated[int, Field(ge=0, description="Applied amount")]
    automatic: bool = Field(default=False, description="Whether discount was automatic")
    method: str | None = Field(default=None, description="Allocation method")
    priority: int | None = Field(default=None, description="Stacking priority")
    allocations: list[Allocation] | None = Field(
        default=None, description="Allocation breakdown"
    )


class RejectedDiscount(BaseModel):
    """Discount code that could not be applied."""

    code: str = Field(..., description="Rejected discount code")
    reason: str = Field(..., description="Rejection reason code")
    message: str | None = Field(
        default=None, description="Human-readable rejection reason"
    )


def _default_applied_discounts() -> list[AppliedDiscount]:
    return []


def _default_rejected_discounts() -> list[RejectedDiscount]:
    return []


class DiscountsResponse(BaseModel):
    """Discount extension response payload."""

    codes: list[str] = Field(
        default_factory=list, description="Submitted discount codes (echo)"
    )
    applied: list[AppliedDiscount] = Field(
        default_factory=_default_applied_discounts,
        description="Successfully applied discounts",
    )
    rejected: list[RejectedDiscount] = Field(
        default_factory=_default_rejected_discounts,
        description="Rejected discount codes",
    )


class ExtensionDeclaration(BaseModel):
    """Active extension declaration for checkout sessions."""

    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(..., description="Extension identifier")
    extends: list[str] = Field(
        default_factory=list, description="JSONPath fields extended by this extension"
    )
    schema_url: str | None = Field(
        default=None,
        alias="schema",
        serialization_alias="schema",
        description="Schema URL for this extension",
    )


def _default_extensions() -> list[ExtensionDeclaration]:
    return []


class Capabilities(BaseModel):
    """Minimal seller capabilities for extension negotiation."""

    extensions: list[ExtensionDeclaration] = Field(
        default_factory=_default_extensions,
        description="Active protocol extensions",
    )


class MessageInfo(BaseModel):
    """Info message."""

    type: MessageTypeEnum = MessageTypeEnum.INFO
    param: str = Field(..., description="JSONPath to related component (RFC 9535)")
    content_type: ContentTypeEnum = Field(..., description="Content format")
    content: str = Field(..., description="Message content")


class MessageError(BaseModel):
    """Error message."""

    type: MessageTypeEnum = MessageTypeEnum.ERROR
    code: ErrorCodeEnum = Field(..., description="Error code")
    param: str | None = Field(default=None, description="JSONPath to related component")
    content_type: ContentTypeEnum = Field(..., description="Content format")
    content: str = Field(..., description="Message content")


class MessageWarning(BaseModel):
    """Warning message."""

    type: MessageTypeEnum = MessageTypeEnum.WARNING
    code: str = Field(..., description="Warning code")
    param: str | None = Field(default=None, description="JSONPath to related component")
    content_type: ContentTypeEnum = Field(..., description="Content format")
    content: str = Field(..., description="Message content")


# Union type for messages
Message = MessageInfo | MessageWarning | MessageError


class Link(BaseModel):
    """HATEOAS link."""

    type: LinkTypeEnum = Field(..., description="Link category")
    url: str = Field(..., description="Link URL")


class Order(BaseModel):
    """Order created after checkout completion."""

    id: str = Field(..., description="Order ID")
    checkout_session_id: str = Field(..., description="Associated checkout session")
    permalink_url: str = Field(..., description="Customer-accessible order URL")


class CheckoutSessionResponse(BaseModel):
    """Full checkout session response (ACP-compliant)."""

    id: str = Field(..., description="Checkout session ID")
    buyer: Buyer | None = Field(default=None, description="Buyer information")
    capabilities: Capabilities | None = Field(
        default=None, description="Session capabilities"
    )
    payment_provider: PaymentProvider = Field(
        ..., description="Payment provider config"
    )
    status: CheckoutStatusEnum = Field(..., description="Session status")
    currency: str = Field(..., description="ISO 4217 currency code (lowercase)")
    line_items: list[LineItem] = Field(..., description="Items in checkout")
    fulfillment_address: Address | None = Field(
        default=None, description="Shipping address"
    )
    fulfillment_options: list[ShippingFulfillmentOption | DigitalFulfillmentOption] = (
        Field(..., description="Available fulfillment options")
    )
    fulfillment_option_id: str | None = Field(
        default=None, description="Selected fulfillment option"
    )
    totals: list[Total] = Field(..., description="Price totals")
    discounts: DiscountsResponse | None = Field(
        default=None, description="Discount extension response"
    )
    messages: list[MessageInfo | MessageWarning | MessageError] = Field(
        ..., description="Info and error messages"
    )
    links: list[Link] = Field(..., description="HATEOAS links")
    order: Order | None = Field(
        default=None, description="Order (present after completion)"
    )


# =============================================================================
# Error Response Schema
# =============================================================================


class ErrorTypeEnum(StrEnum):
    """Error response types."""

    INVALID_REQUEST = "invalid_request"
    NOT_FOUND = "not_found"
    METHOD_NOT_ALLOWED = "method_not_allowed"
    INTERNAL_ERROR = "internal_error"
    UNAUTHORIZED = "unauthorized"
    FORBIDDEN = "forbidden"


class ErrorResponseCodeEnum(StrEnum):
    """Error response codes."""

    REQUEST_NOT_IDEMPOTENT = "request_not_idempotent"
    INVALID_STATUS_TRANSITION = "invalid_status_transition"
    SESSION_NOT_FOUND = "session_not_found"
    PRODUCT_NOT_FOUND = "product_not_found"
    INVALID_PAYMENT = "invalid_payment"
    VALIDATION_ERROR = "validation_error"
    MISSING_API_KEY = "missing_api_key"
    INVALID_API_KEY = "invalid_api_key"
    CONFIGURATION_ERROR = "configuration_error"


class ErrorResponse(BaseModel):
    """Error response schema."""

    type: ErrorTypeEnum = Field(..., description="Error type")
    code: ErrorResponseCodeEnum = Field(..., description="Error code")
    message: str = Field(..., description="Human-readable message")
    param: str | None = Field(default=None, description="JSONPath to offending field")
