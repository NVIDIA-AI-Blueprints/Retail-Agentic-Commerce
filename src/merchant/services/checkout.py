"""Checkout session service layer for ACP endpoints.

Handles business logic for creating, updating, completing, and canceling
checkout sessions according to the Agentic Checkout Protocol specification.

Integrates with the Promotion Agent for dynamic pricing via the 3-layer
hybrid architecture (see services/promotion.py).
"""

import json
import logging
import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

from sqlmodel import Session, select

from src.merchant.api.schemas import (
    Address,
    AddressInput,
    Buyer,
    BuyerInput,
    CheckoutSessionResponse,
    CheckoutStatusEnum,
    ContentTypeEnum,
    CreateCheckoutRequest,
    Item,
    LineItem,
    Link,
    LinkTypeEnum,
    MessageInfo,
    Order,
    PaymentDataInput,
    PaymentMethodEnum,
    PaymentProvider,
    PaymentProviderEnum,
    PromotionMetadata,
    ShippingFulfillmentOption,
    Total,
    TotalTypeEnum,
    UpdateCheckoutRequest,
)
from src.merchant.db.models import CheckoutSession, CheckoutStatus, Product
from src.merchant.services.promotion import get_promotion_for_product

logger = logging.getLogger(__name__)

# =============================================================================
# Constants
# =============================================================================

TAX_RATE = 0.10  # 10% tax rate
DEFAULT_CURRENCY = "usd"
DEFAULT_SHOP_URL = "https://shop.example.com"


# =============================================================================
# Helper Functions
# =============================================================================


def _generate_session_id() -> str:
    """Generate a unique checkout session ID."""
    return f"checkout_{uuid.uuid4().hex[:12]}"


def _generate_line_item_id() -> str:
    """Generate a unique line item ID."""
    return f"li_{uuid.uuid4().hex[:8]}"


def _generate_order_id() -> str:
    """Generate a unique order ID."""
    return f"order_{uuid.uuid4().hex[:12]}"


def _buyer_input_to_dict(buyer: BuyerInput) -> dict[str, Any]:
    """Convert BuyerInput to dictionary for JSON storage."""
    return {
        "first_name": buyer.first_name,
        "last_name": buyer.last_name,
        "email": buyer.email,
        "phone_number": buyer.phone_number,
    }


def _dict_to_buyer(data: dict[str, Any]) -> Buyer:
    """Convert dictionary to Buyer response model."""
    return Buyer(
        first_name=data["first_name"],
        last_name=data.get("last_name"),
        email=data["email"],
        phone_number=data.get("phone_number"),
    )


def _address_input_to_dict(address: AddressInput) -> dict[str, Any]:
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


def _dict_to_address(data: dict[str, Any]) -> Address:
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


def _calculate_line_item(
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
        "id": line_item_id or _generate_line_item_id(),
        "item": {
            "id": product.id,
            "quantity": quantity,
        },
        "base_amount": base_amount,
        "discount": total_discount,
        "subtotal": subtotal,
        "tax": tax,
        "total": total,
    }

    # Add promotion metadata if available
    if promotion_info:
        line_item["promotion"] = {
            "action": promotion_info.get("action", "NO_PROMO"),
            "reason_codes": promotion_info.get("reason_codes", []),
            "reasoning": promotion_info.get("reasoning", ""),
        }

    return line_item


async def _calculate_line_item_with_promotion(
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
    return _calculate_line_item(
        product=product,
        quantity=quantity,
        discount_per_unit=promotion_result["discount"],
        promotion_info=promotion_result,
    )


def _recalculate_line_item_from_existing(
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
    return _calculate_line_item(
        product=product,
        quantity=quantity,
        discount_per_unit=discount_per_unit,
        promotion_info=promotion_info,
        line_item_id=existing_line_item["id"],
    )


def _dict_to_line_item(data: dict[str, Any]) -> LineItem:
    """Convert dictionary to LineItem response model."""
    # Extract promotion metadata if present
    promotion = None
    if "promotion" in data and data["promotion"]:
        promotion = PromotionMetadata(
            action=data["promotion"].get("action", "NO_PROMO"),
            reason_codes=data["promotion"].get("reason_codes", []),
            reasoning=data["promotion"].get("reasoning", ""),
        )

    return LineItem(
        id=data["id"],
        item=Item(id=data["item"]["id"], quantity=data["item"]["quantity"]),
        base_amount=data["base_amount"],
        discount=data["discount"],
        subtotal=data["subtotal"],
        tax=data["tax"],
        total=data["total"],
        promotion=promotion,
    )


def _generate_fulfillment_options(has_address: bool) -> list[dict[str, Any]]:
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


def _dict_to_fulfillment_option(data: dict[str, Any]) -> ShippingFulfillmentOption:
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


def _calculate_totals(
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


def _dict_to_total(data: dict[str, Any]) -> Total:
    """Convert dictionary to Total response model."""
    return Total(
        type=TotalTypeEnum(data["type"]),
        display_text=data["display_text"],
        amount=data["amount"],
    )


def _generate_default_links() -> list[dict[str, Any]]:
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


def _dict_to_link(data: dict[str, Any]) -> Link:
    """Convert dictionary to Link response model."""
    return Link(type=LinkTypeEnum(data["type"]), url=data["url"])


def _check_ready_for_payment(session: CheckoutSession) -> bool:
    """Check if session has all required fields for payment.

    A session is ready for payment when:
    - At least one line item exists
    - Buyer info is provided
    - Fulfillment address is provided
    - Fulfillment option is selected

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

    if session.fulfillment_address_json is None:
        return False

    return session.selected_fulfillment_option_id is not None


def _session_to_response(session: CheckoutSession) -> CheckoutSessionResponse:
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
    line_items = [_dict_to_line_item(item) for item in line_items_data]
    fulfillment_options: list[ShippingFulfillmentOption] = [
        _dict_to_fulfillment_option(opt) for opt in fulfillment_options_data
    ]
    totals = [_dict_to_total(t) for t in totals_data] if totals_data else []
    links = [_dict_to_link(link) for link in links_data]

    # Parse optional fields
    buyer = None
    if session.buyer_json:
        buyer_data = json.loads(session.buyer_json)
        buyer = _dict_to_buyer(buyer_data)

    fulfillment_address = None
    if session.fulfillment_address_json:
        address_data = json.loads(session.fulfillment_address_json)
        fulfillment_address = _dict_to_address(address_data)

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


# =============================================================================
# Service Functions
# =============================================================================


class CheckoutServiceError(Exception):
    """Base exception for checkout service errors."""

    def __init__(self, message: str, code: str = "internal_error"):
        self.message = message
        self.code = code
        super().__init__(message)


class SessionNotFoundError(CheckoutServiceError):
    """Raised when a checkout session is not found."""

    def __init__(self, session_id: str):
        super().__init__(
            message=f"Checkout session '{session_id}' not found",
            code="session_not_found",
        )


class ProductNotFoundError(CheckoutServiceError):
    """Raised when a product is not found."""

    def __init__(self, product_id: str):
        super().__init__(
            message=f"Product '{product_id}' not found",
            code="product_not_found",
        )


class InvalidStateTransitionError(CheckoutServiceError):
    """Raised when an invalid state transition is attempted."""

    def __init__(self, current_status: str, action: str):
        super().__init__(
            message=f"Cannot {action} session with status '{current_status}'",
            code="invalid_status_transition",
        )


async def create_checkout_session(
    db: Session, request: CreateCheckoutRequest
) -> CheckoutSessionResponse:
    """Create a new checkout session.

    Calls the Promotion Agent to get dynamic pricing for each item.
    Uses fail-open behavior: if agent is unavailable, continues without discounts.

    Args:
        db: Database session.
        request: CreateCheckoutRequest with items and optional buyer/address.

    Returns:
        CheckoutSessionResponse with the new session.

    Raises:
        ProductNotFoundError: If a product in items is not found.
    """
    session_id = _generate_session_id()

    # Build line items from products with promotion discounts
    line_items: list[dict[str, Any]] = []
    for item in request.items:
        product = db.exec(select(Product).where(Product.id == item.id)).first()
        if product is None:
            raise ProductNotFoundError(item.id)

        # Get line item with promotion discount (async call to agent)
        line_item = await _calculate_line_item_with_promotion(
            db, product, item.quantity
        )
        line_items.append(line_item)

    # Process optional buyer
    buyer_json = None
    if request.buyer:
        buyer_json = json.dumps(_buyer_input_to_dict(request.buyer))

    # Process optional fulfillment address
    fulfillment_address_json = None
    has_address = request.fulfillment_address is not None
    if request.fulfillment_address:
        fulfillment_address_json = json.dumps(
            _address_input_to_dict(request.fulfillment_address)
        )

    # Generate fulfillment options
    fulfillment_options: list[dict[str, Any]] = _generate_fulfillment_options(
        has_address
    )

    # Calculate totals
    totals: list[dict[str, Any]] = _calculate_totals(
        line_items, fulfillment_options, None
    )

    # Generate default links
    links: list[dict[str, Any]] = _generate_default_links()

    # Generate welcome message
    messages: list[dict[str, Any]] = [
        {
            "type": "info",
            "param": "$",
            "content_type": "plain",
            "content": "Welcome to checkout! Please complete all required fields.",
        }
    ]

    # Create database record
    checkout_session = CheckoutSession(
        id=session_id,
        status=CheckoutStatus.NOT_READY_FOR_PAYMENT,
        currency=DEFAULT_CURRENCY.upper(),
        line_items_json=json.dumps(line_items),
        buyer_json=buyer_json,
        fulfillment_address_json=fulfillment_address_json,
        fulfillment_options_json=json.dumps(fulfillment_options),
        totals_json=json.dumps(totals),
        messages_json=json.dumps(messages),
        links_json=json.dumps(links),
    )

    db.add(checkout_session)
    db.commit()
    db.refresh(checkout_session)

    return _session_to_response(checkout_session)


def get_checkout_session(db: Session, session_id: str) -> CheckoutSessionResponse:
    """Get a checkout session by ID.

    Args:
        db: Database session.
        session_id: Checkout session ID.

    Returns:
        CheckoutSessionResponse with the session.

    Raises:
        SessionNotFoundError: If session is not found.
    """
    session = db.exec(
        select(CheckoutSession).where(CheckoutSession.id == session_id)
    ).first()

    if session is None:
        raise SessionNotFoundError(session_id)

    return _session_to_response(session)


async def update_checkout_session(
    db: Session, session_id: str, request: UpdateCheckoutRequest
) -> CheckoutSessionResponse:
    """Update a checkout session.

    Reuses existing promotion data when items are updated to avoid
    re-calling the promotion agent. Only session creation triggers
    the promotion agent.

    Args:
        db: Database session.
        session_id: Checkout session ID.
        request: UpdateCheckoutRequest with fields to update.

    Returns:
        CheckoutSessionResponse with the updated session.

    Raises:
        SessionNotFoundError: If session is not found.
        ProductNotFoundError: If a product in items is not found.
        InvalidStateTransitionError: If session is completed or canceled.
    """
    session = db.exec(
        select(CheckoutSession).where(CheckoutSession.id == session_id)
    ).first()

    if session is None:
        raise SessionNotFoundError(session_id)

    # Check if session can be updated
    if session.status in (CheckoutStatus.COMPLETED, CheckoutStatus.CANCELED):
        raise InvalidStateTransitionError(session.status.value, "update")

    # Update items if provided (reuse existing promotion data, no agent call)
    if request.items is not None:
        # Build lookup of existing line items by product ID
        existing_line_items: list[dict[str, Any]] = json.loads(session.line_items_json)
        existing_by_product_id: dict[str, dict[str, Any]] = {
            li["item"]["id"]: li for li in existing_line_items
        }

        new_line_items: list[dict[str, Any]] = []
        for item in request.items:
            product = db.exec(select(Product).where(Product.id == item.id)).first()
            if product is None:
                raise ProductNotFoundError(item.id)

            # Check if this product has existing promotion data
            existing_li = existing_by_product_id.get(item.id)
            if existing_li is not None:
                # Reuse existing promotion, just recalculate totals for new quantity
                line_item = _recalculate_line_item_from_existing(
                    product, item.quantity, existing_li
                )
            else:
                # New product added to cart - call promotion agent
                line_item = await _calculate_line_item_with_promotion(
                    db, product, item.quantity
                )
            new_line_items.append(line_item)
        session.line_items_json = json.dumps(new_line_items)

    # Update buyer if provided
    if request.buyer is not None:
        session.buyer_json = json.dumps(_buyer_input_to_dict(request.buyer))

    # Update fulfillment address if provided
    if request.fulfillment_address is not None:
        session.fulfillment_address_json = json.dumps(
            _address_input_to_dict(request.fulfillment_address)
        )
        # Regenerate fulfillment options when address changes
        new_options: list[dict[str, Any]] = _generate_fulfillment_options(
            has_address=True
        )
        session.fulfillment_options_json = json.dumps(new_options)

    # Update fulfillment option selection if provided
    if request.fulfillment_option_id is not None:
        # Validate the option exists
        current_options: list[dict[str, Any]] = json.loads(
            session.fulfillment_options_json
        )
        valid_ids = [opt["id"] for opt in current_options]
        if request.fulfillment_option_id in valid_ids:
            session.selected_fulfillment_option_id = request.fulfillment_option_id

    # Recalculate totals
    current_line_items: list[dict[str, Any]] = json.loads(session.line_items_json)
    current_fulfillment_options: list[dict[str, Any]] = json.loads(
        session.fulfillment_options_json
    )
    updated_totals: list[dict[str, Any]] = _calculate_totals(
        current_line_items,
        current_fulfillment_options,
        session.selected_fulfillment_option_id,
    )
    session.totals_json = json.dumps(updated_totals)

    # Check if ready for payment and update status
    if _check_ready_for_payment(session):
        session.status = CheckoutStatus.READY_FOR_PAYMENT
        # Update message
        ready_messages: list[dict[str, Any]] = [
            {
                "type": "info",
                "param": "$",
                "content_type": "plain",
                "content": "Ready for payment! Review your order and proceed.",
            }
        ]
        session.messages_json = json.dumps(ready_messages)

    session.updated_at = datetime.now(UTC)
    db.add(session)
    db.commit()
    db.refresh(session)

    return _session_to_response(session)


def complete_checkout_session(
    db: Session,
    session_id: str,
    payment_data: PaymentDataInput,  # noqa: ARG001  # Reserved for payment validation
    buyer: BuyerInput | None = None,
) -> CheckoutSessionResponse:
    """Complete a checkout session with payment.

    Args:
        db: Database session.
        session_id: Checkout session ID.
        payment_data: Payment data with token and provider.
        buyer: Optional buyer info update.

    Returns:
        CheckoutSessionResponse with the completed session.

    Raises:
        SessionNotFoundError: If session is not found.
        InvalidStateTransitionError: If session cannot be completed.
    """
    session = db.exec(
        select(CheckoutSession).where(CheckoutSession.id == session_id)
    ).first()

    if session is None:
        raise SessionNotFoundError(session_id)

    # Check if session can be completed
    if session.status == CheckoutStatus.COMPLETED:
        raise InvalidStateTransitionError(session.status.value, "complete")

    if session.status == CheckoutStatus.CANCELED:
        raise InvalidStateTransitionError(session.status.value, "complete")

    # Update buyer if provided
    if buyer is not None:
        session.buyer_json = json.dumps(_buyer_input_to_dict(buyer))

    # Verify session is ready for payment (has all required fields)
    if not _check_ready_for_payment(session):
        raise InvalidStateTransitionError(session.status.value, "complete")

    # Create order
    order_id = _generate_order_id()
    order_data = {
        "id": order_id,
        "checkout_session_id": session_id,
        "permalink_url": f"{DEFAULT_SHOP_URL}/orders/{order_id}",
    }
    session.order_json = json.dumps(order_data)

    # Update status
    session.status = CheckoutStatus.COMPLETED

    # Update message
    complete_messages: list[dict[str, Any]] = [
        {
            "type": "info",
            "param": "$",
            "content_type": "plain",
            "content": f"Order {order_id} confirmed! Thank you for your purchase.",
        }
    ]
    session.messages_json = json.dumps(complete_messages)

    session.updated_at = datetime.now(UTC)
    db.add(session)
    db.commit()
    db.refresh(session)

    return _session_to_response(session)


def cancel_checkout_session(db: Session, session_id: str) -> CheckoutSessionResponse:
    """Cancel a checkout session.

    Args:
        db: Database session.
        session_id: Checkout session ID.

    Returns:
        CheckoutSessionResponse with the canceled session.

    Raises:
        SessionNotFoundError: If session is not found.
        InvalidStateTransitionError: If session is already completed or canceled.
    """
    session = db.exec(
        select(CheckoutSession).where(CheckoutSession.id == session_id)
    ).first()

    if session is None:
        raise SessionNotFoundError(session_id)

    # Check if session can be canceled
    if session.status == CheckoutStatus.COMPLETED:
        raise InvalidStateTransitionError(session.status.value, "cancel")

    if session.status == CheckoutStatus.CANCELED:
        raise InvalidStateTransitionError(session.status.value, "cancel")

    # Update status
    session.status = CheckoutStatus.CANCELED

    # Update message
    cancel_messages: list[dict[str, Any]] = [
        {
            "type": "info",
            "param": "$",
            "content_type": "plain",
            "content": "Checkout session has been canceled.",
        }
    ]
    session.messages_json = json.dumps(cancel_messages)

    session.updated_at = datetime.now(UTC)
    db.add(session)
    db.commit()
    db.refresh(session)

    return _session_to_response(session)
