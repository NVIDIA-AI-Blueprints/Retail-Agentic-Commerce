"""Helper functions and constants for checkout service.

Contains utility functions for converting between database models and API schemas,
calculating line items, totals, and generating IDs.
"""

import json
import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

from sqlmodel import Session

from src.merchant.api.schemas import (
    Address,
    AddressInput,
    Buyer,
    BuyerInput,
    CheckoutSessionResponse,
    CheckoutStatusEnum,
    ContentTypeEnum,
    Item,
    LineItem,
    Link,
    LinkTypeEnum,
    MessageInfo,
    Order,
    PaymentMethodEnum,
    PaymentProvider,
    PaymentProviderEnum,
    PromotionMetadata,
    ShippingFulfillmentOption,
    Total,
    TotalTypeEnum,
)
from src.merchant.db.models import CheckoutSession, Product
from src.merchant.services.promotion import get_promotion_for_product

# =============================================================================
# Constants
# =============================================================================

TAX_RATE = 0.10  # 10% tax rate
DEFAULT_CURRENCY = "usd"
DEFAULT_SHOP_URL = "https://shop.example.com"


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
    existing_discount = existing_line_item.get("discount", 0)

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
    messages: list[MessageInfo] = [
        MessageInfo(
            param=msg_data["param"],
            content_type=ContentTypeEnum(msg_data["content_type"]),
            content=msg_data["content"],
        )
        for msg_data in messages_data
    ]

    return CheckoutSessionResponse(
        id=session.id,
        buyer=buyer,
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
        messages=list(messages),  # Cast for type compatibility
        links=links,
        order=order,
    )
