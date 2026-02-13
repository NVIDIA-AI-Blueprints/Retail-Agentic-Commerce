"""Checkout domain helpers and calculators."""

import json
import uuid
from datetime import UTC, datetime, timedelta
from typing import Any, cast

from sqlmodel import Session

from src.merchant.db.models import CheckoutSession, Product
from src.merchant.domain.checkout.models import (
    Address,
    AddressInput,
    Allocation,
    AppliedDiscount,
    Buyer,
    BuyerInput,
    Capabilities,
    CheckoutSessionResponse,
    CheckoutStatusEnum,
    ContentTypeEnum,
    Coupon,
    DiscountsResponse,
    ErrorCodeEnum,
    ExtensionDeclaration,
    Item,
    LineItem,
    Link,
    LinkTypeEnum,
    MessageError,
    MessageInfo,
    MessageTypeEnum,
    MessageWarning,
    Order,
    PaymentMethodEnum,
    PaymentProvider,
    PaymentProviderEnum,
    PromotionMetadata,
    RejectedDiscount,
    ShippingFulfillmentOption,
    Total,
    TotalTypeEnum,
)
from src.merchant.services.promotion import (
    get_promotion_for_product,
    validate_discount_against_margin,
)

# =============================================================================
# Constants
# =============================================================================

TAX_RATE = 0.10  # 10% tax rate
DEFAULT_CURRENCY = "usd"
DEFAULT_SHOP_URL = "https://shop.example.com"
DISCOUNT_EXTENSION_SCHEMA_URL = (
    "https://agenticcommerce.dev/schemas/discount/2026-01-27.json"
)
DISCOUNT_EXTENSION_DECLARATION = ExtensionDeclaration(
    name="discount",
    extends=[
        "$.CheckoutSessionCreateRequest.discounts",
        "$.CheckoutSessionUpdateRequest.discounts",
        "$.CheckoutSession.discounts",
    ],
    schema=DISCOUNT_EXTENSION_SCHEMA_URL,
)
COUPON_SAVE10 = "SAVE10"


# =============================================================================
# ID Generation Functions
# =============================================================================


def generate_session_id() -> str:
    """Generate a unique checkout session ID."""
    return f"checkout_{uuid.uuid4().hex[:12]}"


def generate_line_item_id() -> str:
    """Generate a unique line item ID."""
    return f"li_{uuid.uuid4().hex[:8]}"


def generate_order_id() -> str:
    """Generate a unique order ID."""
    return f"order_{uuid.uuid4().hex[:12]}"


# =============================================================================
# Buyer Conversion Functions
# =============================================================================


def buyer_input_to_dict(buyer: BuyerInput) -> dict[str, Any]:
    """Convert BuyerInput to dictionary for JSON storage."""
    return {
        "first_name": buyer.first_name,
        "last_name": buyer.last_name,
        "email": buyer.email,
        "phone_number": buyer.phone_number,
    }


def dict_to_buyer(data: dict[str, Any]) -> Buyer:
    """Convert dictionary to Buyer response model."""
    return Buyer(
        first_name=data["first_name"],
        last_name=data.get("last_name"),
        email=data["email"],
        phone_number=data.get("phone_number"),
    )


# =============================================================================
# Address Conversion Functions
# =============================================================================


def address_input_to_dict(address: AddressInput) -> dict[str, Any]:
    """Convert AddressInput to dictionary for JSON storage."""
    return {
        "name": address.name,
        "line_one": address.line_one,
        "line_two": address.line_two,
        "city": address.city,
        "state": address.state,
        "country": address.country,
        "postal_code": address.postal_code,
        "phone_number": address.phone_number,
    }


def dict_to_address(data: dict[str, Any]) -> Address:
    """Convert dictionary to Address response model."""
    return Address(
        name=data["name"],
        line_one=data["line_one"],
        line_two=data.get("line_two"),
        city=data["city"],
        state=data["state"],
        country=data["country"],
        postal_code=data["postal_code"],
        phone_number=data.get("phone_number"),
    )


# =============================================================================
# Line Item Functions
# =============================================================================


def _recompute_line_item_totals(line_item: dict[str, Any]) -> None:
    """Recompute subtotal, tax, and total after discount updates."""
    subtotal = max(0, int(line_item["base_amount"]) - int(line_item["discount"]))
    tax = int(subtotal * TAX_RATE)
    line_item["subtotal"] = subtotal
    line_item["tax"] = tax
    line_item["total"] = subtotal + tax


def _normalize_discount_codes(codes: list[str] | None) -> list[str]:
    """Normalize submitted discount codes."""
    if not codes:
        return []
    normalized: list[str] = []
    for raw_code in codes:
        code = raw_code.strip().upper()
        if code:
            normalized.append(code)
    return normalized


def _promotion_percent_from_action(action: str | None) -> float | None:
    """Infer promotion percentage from action metadata."""
    if not action:
        return None
    if action.startswith("DISCOUNT_") and action.endswith("_PCT"):
        parts = action.split("_")
        if len(parts) >= 3 and parts[1].isdigit():
            return float(parts[1])
    return None


def _build_automatic_applied_discounts(
    line_items: list[dict[str, Any]],
) -> list[AppliedDiscount]:
    """Build automatic discount entries from promotion metadata."""
    applied: list[AppliedDiscount] = []
    for idx, line_item in enumerate(line_items):
        promotion_discount = int(
            line_item.get("promotion_discount", line_item.get("discount", 0))
        )
        if promotion_discount <= 0:
            continue

        promotion_data = cast(dict[str, Any], line_item.get("promotion") or {})
        action = str(promotion_data.get("action", "AUTOMATIC_PROMOTION"))
        percent_off = _promotion_percent_from_action(action)
        coupon = Coupon(
            id=f"promo_{line_item['id']}",
            name=action.replace("_", " ").title(),
            percent_off=percent_off,
            currency=DEFAULT_CURRENCY,
        )
        applied.append(
            AppliedDiscount(
                id=f"applied_promo_{line_item['id']}",
                coupon=coupon,
                amount=promotion_discount,
                automatic=True,
                method="each",
                priority=idx + 1,
                allocations=[
                    Allocation(path=f"$.line_items[{idx}]", amount=promotion_discount)
                ],
            )
        )
    return applied


def apply_discount_codes(
    line_items: list[dict[str, Any]],
    products_by_id: dict[str, Product],
    submitted_codes: list[str] | None,
) -> tuple[list[dict[str, Any]], dict[str, Any], list[dict[str, Any]]]:
    """Apply coupon discounts on top of promotion discounts.

    This MVP intentionally supports only SAVE10 while preserving
    compatibility with the ACP discount extension response shape.
    """
    normalized_codes = _normalize_discount_codes(submitted_codes)

    # Reset coupon discount before re-applying submitted codes.
    for line_item in line_items:
        promotion_discount = int(
            line_item.get("promotion_discount", line_item.get("discount", 0))
        )
        line_item["promotion_discount"] = promotion_discount
        line_item["coupon_discount"] = 0
        line_item["discount"] = promotion_discount
        _recompute_line_item_totals(line_item)

    applied: list[AppliedDiscount] = _build_automatic_applied_discounts(line_items)
    rejected: list[RejectedDiscount] = []
    warning_messages: list[dict[str, Any]] = []
    save10_applied = False

    for code_index, code in enumerate(normalized_codes):
        if code != COUPON_SAVE10:
            message = f"Code '{code}' is not recognized."
            rejected.append(
                RejectedDiscount(
                    code=code,
                    reason="discount_code_invalid",
                    message=message,
                )
            )
            warning_messages.append(
                {
                    "type": MessageTypeEnum.WARNING.value,
                    "code": "discount_code_invalid",
                    "param": f"$.discounts.codes[{code_index}]",
                    "content_type": ContentTypeEnum.PLAIN.value,
                    "content": message,
                }
            )
            continue

        if save10_applied:
            message = f"Code '{code}' is already applied."
            rejected.append(
                RejectedDiscount(
                    code=code,
                    reason="discount_code_already_applied",
                    message=message,
                )
            )
            warning_messages.append(
                {
                    "type": MessageTypeEnum.WARNING.value,
                    "code": "discount_code_already_applied",
                    "param": f"$.discounts.codes[{code_index}]",
                    "content_type": ContentTypeEnum.PLAIN.value,
                    "content": message,
                }
            )
            continue

        coupon_amount_total = 0
        allocations: list[Allocation] = []
        for line_index, line_item in enumerate(line_items):
            product_id = str(line_item["item"]["id"])
            product = products_by_id.get(product_id)
            if product is None:
                continue

            promotion_discount = int(line_item.get("promotion_discount", 0))
            subtotal_before_coupon = max(
                0, int(line_item["base_amount"]) - promotion_discount
            )
            raw_coupon_discount = int(subtotal_before_coupon * 0.10)
            if raw_coupon_discount <= 0:
                continue

            max_total_discount = max(
                0,
                int(line_item["base_amount"])
                - int(line_item["base_amount"] * product.min_margin),
            )
            remaining_discount_budget = max(0, max_total_discount - promotion_discount)
            coupon_discount = min(raw_coupon_discount, remaining_discount_budget)

            proposed_total_discount = promotion_discount + coupon_discount
            if coupon_discount <= 0 or not validate_discount_against_margin(
                int(line_item["base_amount"]),
                proposed_total_discount,
                product.min_margin,
            ):
                continue

            line_item["coupon_discount"] = coupon_discount
            line_item["discount"] = proposed_total_discount
            _recompute_line_item_totals(line_item)

            coupon_amount_total += coupon_discount
            allocations.append(
                Allocation(path=f"$.line_items[{line_index}]", amount=coupon_discount)
            )

        if coupon_amount_total <= 0:
            message = f"Code '{code}' could not be applied because pricing constraints were not met."
            rejected.append(
                RejectedDiscount(
                    code=code,
                    reason="discount_code_combination_disallowed",
                    message=message,
                )
            )
            warning_messages.append(
                {
                    "type": MessageTypeEnum.WARNING.value,
                    "code": "discount_code_combination_disallowed",
                    "param": f"$.discounts.codes[{code_index}]",
                    "content_type": ContentTypeEnum.PLAIN.value,
                    "content": message,
                }
            )
            continue

        applied.append(
            AppliedDiscount(
                id=f"applied_coupon_{code.lower()}",
                code=code,
                coupon=Coupon(
                    id="coupon_save10",
                    name="Save 10%",
                    percent_off=10.0,
                    currency=DEFAULT_CURRENCY,
                ),
                amount=coupon_amount_total,
                automatic=False,
                method="each",
                priority=100,
                allocations=allocations,
            )
        )
        save10_applied = True

    discounts_payload = DiscountsResponse(
        codes=normalized_codes,
        applied=applied,
        rejected=rejected,
    )
    return (
        line_items,
        discounts_payload.model_dump(),
        warning_messages,
    )


def calculate_line_item(
    product: Product,
    quantity: int,
    discount_per_unit: int = 0,
    promotion_info: dict[str, Any] | None = None,
    line_item_id: str | None = None,
) -> dict[str, Any]:
    """Calculate line item totals for a product.

    Args:
        product: Product database model.
        quantity: Quantity ordered.
        discount_per_unit: Discount amount per unit in cents (default 0).
        promotion_info: Optional promotion metadata (action, reason_codes, reasoning).
        line_item_id: Optional existing line item ID to preserve (for updates).

    Returns:
        Dictionary with line item data for JSON storage.
    """
    base_amount = product.base_price * quantity
    total_discount = discount_per_unit * quantity
    subtotal = base_amount - total_discount
    tax = int(subtotal * TAX_RATE)
    total = subtotal + tax

    line_item: dict[str, Any] = {
        "id": line_item_id or generate_line_item_id(),
        "item": {
            "id": product.id,
            "quantity": quantity,
        },
        "name": product.name,
        "base_amount": base_amount,
        "discount": total_discount,
        "promotion_discount": total_discount,
        "coupon_discount": 0,
        "subtotal": subtotal,
        "tax": tax,
        "total": total,
    }

    # Add promotion metadata if available (include stock_count for agent activity display)
    if promotion_info:
        line_item["promotion"] = {
            "action": promotion_info.get("action", "NO_PROMO"),
            "reason_codes": promotion_info.get("reason_codes", []),
            "reasoning": promotion_info.get("reasoning", ""),
            "stock_count": product.stock_count,
        }

    return line_item


async def calculate_line_item_with_promotion(
    db: Session, product: Product, quantity: int
) -> dict[str, Any]:
    """Calculate line item with promotion agent discount.

    Calls the promotion service to get dynamic pricing based on
    inventory levels and competitor pricing.

    Args:
        db: Database session.
        product: Product database model.
        quantity: Quantity ordered.

    Returns:
        Dictionary with line item data including promotion discount.
    """
    # Get promotion decision from the agent (fail-open behavior)
    promotion_result = await get_promotion_for_product(db, product)

    # Calculate line item with the discount
    return calculate_line_item(
        product=product,
        quantity=quantity,
        discount_per_unit=promotion_result["discount"],
        promotion_info=promotion_result,
    )


def recalculate_line_item_from_existing(
    product: Product,
    quantity: int,
    existing_line_item: dict[str, Any],
) -> dict[str, Any]:
    """Recalculate line item totals using existing promotion data.

    This function is used during session updates to avoid re-calling the
    promotion agent. It preserves the per-unit discount from the original
    promotion decision and recalculates totals for the new quantity.

    Args:
        product: Product database model.
        quantity: New quantity ordered.
        existing_line_item: Existing line item data with promotion info.

    Returns:
        Dictionary with recalculated line item data.
    """
    # Extract per-unit discount from existing line item
    existing_quantity = existing_line_item["item"]["quantity"]
    existing_discount = existing_line_item.get(
        "promotion_discount", existing_line_item.get("discount", 0)
    )

    # Calculate per-unit discount (avoid division by zero)
    if existing_quantity > 0:
        discount_per_unit = existing_discount // existing_quantity
    else:
        discount_per_unit = 0

    # Preserve existing promotion metadata
    promotion_info = existing_line_item.get("promotion")

    # Recalculate with new quantity, preserving the line item ID
    return calculate_line_item(
        product=product,
        quantity=quantity,
        discount_per_unit=discount_per_unit,
        promotion_info=promotion_info,
        line_item_id=existing_line_item["id"],
    )


def dict_to_line_item(data: dict[str, Any]) -> LineItem:
    """Convert dictionary to LineItem response model."""
    # Extract promotion metadata if present
    promotion = None
    if "promotion" in data and data["promotion"]:
        promotion = PromotionMetadata(
            action=data["promotion"].get("action", "NO_PROMO"),
            reason_codes=data["promotion"].get("reason_codes", []),
            reasoning=data["promotion"].get("reasoning", ""),
            stock_count=data["promotion"].get("stock_count"),
        )

    return LineItem(
        id=data["id"],
        item=Item(id=data["item"]["id"], quantity=data["item"]["quantity"]),
        name=data.get("name"),
        base_amount=data["base_amount"],
        discount=data["discount"],
        subtotal=data["subtotal"],
        tax=data["tax"],
        total=data["total"],
        promotion=promotion,
    )


# =============================================================================
# Fulfillment Functions
# =============================================================================


def generate_fulfillment_options(has_address: bool) -> list[dict[str, Any]]:
    """Generate available fulfillment options.

    Args:
        has_address: Whether a fulfillment address has been provided.

    Returns:
        List of fulfillment option dictionaries.
    """
    if not has_address:
        return []

    now = datetime.now(UTC)
    standard_earliest = now + timedelta(days=5)
    standard_latest = now + timedelta(days=7)
    express_earliest = now + timedelta(days=2)
    express_latest = now + timedelta(days=3)

    return [
        {
            "type": "shipping",
            "id": "shipping_standard",
            "title": "Standard Shipping",
            "subtitle": "5-7 business days",
            "carrier_info": "USPS",
            "earliest_delivery_time": standard_earliest.isoformat(),
            "latest_delivery_time": standard_latest.isoformat(),
            "subtotal": 599,
            "tax": 0,
            "total": 599,
        },
        {
            "type": "shipping",
            "id": "shipping_express",
            "title": "Express Shipping",
            "subtitle": "2-3 business days",
            "carrier_info": "UPS",
            "earliest_delivery_time": express_earliest.isoformat(),
            "latest_delivery_time": express_latest.isoformat(),
            "subtotal": 1299,
            "tax": 0,
            "total": 1299,
        },
    ]


def dict_to_fulfillment_option(data: dict[str, Any]) -> ShippingFulfillmentOption:
    """Convert dictionary to FulfillmentOption response model."""
    return ShippingFulfillmentOption(
        type=data["type"],
        id=data["id"],
        title=data["title"],
        subtitle=data["subtitle"],
        carrier_info=data["carrier_info"],
        earliest_delivery_time=data["earliest_delivery_time"],
        latest_delivery_time=data["latest_delivery_time"],
        subtotal=data["subtotal"],
        tax=data["tax"],
        total=data["total"],
    )


# =============================================================================
# Totals Functions
# =============================================================================


def calculate_totals(
    line_items: list[dict[str, Any]],
    fulfillment_options: list[dict[str, Any]],
    selected_option_id: str | None,
) -> list[dict[str, Any]]:
    """Calculate checkout totals.

    Args:
        line_items: List of line item dictionaries.
        fulfillment_options: List of fulfillment option dictionaries.
        selected_option_id: ID of selected fulfillment option.

    Returns:
        List of total dictionaries.
    """
    items_base_amount: int = sum(item["base_amount"] for item in line_items)
    items_discount: int = sum(item["discount"] for item in line_items)
    items_subtotal: int = sum(item["subtotal"] for item in line_items)
    items_tax: int = sum(item["tax"] for item in line_items)

    # Get fulfillment cost if option selected
    fulfillment_cost: int = 0
    if selected_option_id:
        for option in fulfillment_options:
            if option["id"] == selected_option_id:
                fulfillment_cost = int(option["total"])
                break

    total: int = items_subtotal + items_tax + fulfillment_cost

    totals: list[dict[str, Any]] = [
        {
            "type": TotalTypeEnum.ITEMS_BASE_AMOUNT.value,
            "display_text": "Items",
            "amount": items_base_amount,
        },
    ]

    if items_discount > 0:
        totals.append(
            {
                "type": TotalTypeEnum.ITEMS_DISCOUNT.value,
                "display_text": "Discount",
                "amount": items_discount,
            }
        )

    totals.extend(
        [
            {
                "type": TotalTypeEnum.SUBTOTAL.value,
                "display_text": "Subtotal",
                "amount": items_subtotal,
            },
            {
                "type": TotalTypeEnum.TAX.value,
                "display_text": "Tax",
                "amount": items_tax,
            },
        ]
    )

    if fulfillment_cost > 0:
        totals.append(
            {
                "type": TotalTypeEnum.FULFILLMENT.value,
                "display_text": "Shipping",
                "amount": fulfillment_cost,
            }
        )

    totals.append(
        {
            "type": TotalTypeEnum.TOTAL.value,
            "display_text": "Total",
            "amount": total,
        }
    )

    return totals


def dict_to_total(data: dict[str, Any]) -> Total:
    """Convert dictionary to Total response model."""
    return Total(
        type=TotalTypeEnum(data["type"]),
        display_text=data["display_text"],
        amount=data["amount"],
    )


def dict_to_message(
    data: dict[str, Any],
) -> MessageInfo | MessageWarning | MessageError:
    """Convert dictionary to message response model."""
    message_type = data.get("type", MessageTypeEnum.INFO.value)
    if message_type == MessageTypeEnum.ERROR.value:
        raw_code = data.get("code", ErrorCodeEnum.INVALID.value)
        try:
            code = ErrorCodeEnum(raw_code)
        except ValueError:
            code = ErrorCodeEnum.INVALID
        return MessageError(
            code=code,
            param=data.get("param"),
            content_type=ContentTypeEnum(data["content_type"]),
            content=data["content"],
        )
    if message_type == MessageTypeEnum.WARNING.value:
        return MessageWarning(
            code=data.get("code", "warning"),
            param=data.get("param"),
            content_type=ContentTypeEnum(data["content_type"]),
            content=data["content"],
        )
    return MessageInfo(
        param=data.get("param", "$"),
        content_type=ContentTypeEnum(data["content_type"]),
        content=data["content"],
    )


# =============================================================================
# Link Functions
# =============================================================================


def generate_default_links() -> list[dict[str, Any]]:
    """Generate default HATEOAS links."""
    return [
        {
            "type": LinkTypeEnum.TERMS_OF_USE.value,
            "url": f"{DEFAULT_SHOP_URL}/terms",
        },
        {
            "type": LinkTypeEnum.PRIVACY_POLICY.value,
            "url": f"{DEFAULT_SHOP_URL}/privacy",
        },
        {
            "type": LinkTypeEnum.SELLER_SHOP_POLICIES.value,
            "url": f"{DEFAULT_SHOP_URL}/policies",
        },
    ]


def dict_to_link(data: dict[str, Any]) -> Link:
    """Convert dictionary to Link response model."""
    return Link(type=LinkTypeEnum(data["type"]), url=data["url"])


# =============================================================================
# Session Helper Functions
# =============================================================================


def check_ready_for_payment(session: CheckoutSession) -> bool:
    """Check if session has all required fields for payment.

    A session is ready for payment when:
    - At least one line item exists
    - Buyer info is provided
    - Fulfillment details are provided (ACP only)

    Args:
        session: CheckoutSession database model.

    Returns:
        True if ready for payment, False otherwise.
    """
    line_items = json.loads(session.line_items_json)
    if not line_items:
        return False

    if session.buyer_json is None:
        return False

    if session.protocol == "ucp":
        return True

    if session.fulfillment_address_json is None:
        return False

    return session.selected_fulfillment_option_id is not None


def session_to_response(session: CheckoutSession) -> CheckoutSessionResponse:
    """Convert CheckoutSession database model to API response.

    Args:
        session: CheckoutSession database model.

    Returns:
        CheckoutSessionResponse for API.
    """
    # Parse JSON fields
    line_items_data: list[dict[str, Any]] = json.loads(session.line_items_json)
    fulfillment_options_data: list[dict[str, Any]] = json.loads(
        session.fulfillment_options_json
    )
    totals_data: list[dict[str, Any]] = (
        json.loads(session.totals_json) if session.totals_json != "{}" else []
    )
    messages_data: list[dict[str, Any]] = json.loads(session.messages_json)
    links_data: list[dict[str, Any]] = json.loads(session.links_json)
    metadata_data: dict[str, Any] = (
        json.loads(session.metadata_json) if session.metadata_json else {}
    )

    # Convert to response models
    line_items = [dict_to_line_item(item) for item in line_items_data]
    fulfillment_options: list[ShippingFulfillmentOption] = [
        dict_to_fulfillment_option(opt) for opt in fulfillment_options_data
    ]
    totals = [dict_to_total(t) for t in totals_data] if totals_data else []
    links = [dict_to_link(link) for link in links_data]

    # Parse optional fields
    buyer = None
    if session.buyer_json:
        buyer_data = json.loads(session.buyer_json)
        buyer = dict_to_buyer(buyer_data)

    fulfillment_address = None
    if session.fulfillment_address_json:
        address_data = json.loads(session.fulfillment_address_json)
        fulfillment_address = dict_to_address(address_data)

    order = None
    if session.order_json:
        order_data = json.loads(session.order_json)
        order = Order(
            id=order_data["id"],
            checkout_session_id=order_data["checkout_session_id"],
            permalink_url=order_data["permalink_url"],
        )

    # Convert messages
    messages = [dict_to_message(msg_data) for msg_data in messages_data]

    discounts = None
    raw_discounts = metadata_data.get("discounts")
    if isinstance(raw_discounts, dict):
        discounts = DiscountsResponse.model_validate(raw_discounts)
    else:
        discounts = DiscountsResponse(
            codes=[],
            applied=_build_automatic_applied_discounts(line_items_data),
            rejected=[],
        )

    return CheckoutSessionResponse(
        id=session.id,
        buyer=buyer,
        capabilities=Capabilities(extensions=[DISCOUNT_EXTENSION_DECLARATION]),
        payment_provider=PaymentProvider(
            provider=PaymentProviderEnum.STRIPE,
            supported_payment_methods=[PaymentMethodEnum.CARD],
        ),
        status=CheckoutStatusEnum(session.status.value),
        currency=session.currency.lower(),
        line_items=line_items,
        fulfillment_address=fulfillment_address,
        fulfillment_options=list(fulfillment_options),  # Cast for type compatibility
        fulfillment_option_id=session.selected_fulfillment_option_id,
        totals=totals,
        discounts=discounts,
        messages=list(messages),
        links=links,
        order=order,
    )
