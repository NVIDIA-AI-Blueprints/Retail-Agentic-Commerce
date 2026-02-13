"""Checkout session service layer for ACP endpoints.

Handles business logic for creating, updating, completing, and canceling
checkout sessions according to the Agentic Checkout Protocol specification.

Integrates with the Promotion Agent for dynamic pricing via the 3-layer
hybrid architecture (see services/promotion.py).
"""

import json
import logging
from datetime import UTC, datetime
from typing import Any, cast

from sqlmodel import Session, select

from src.merchant.api.schemas import (
    BuyerInput,
    CheckoutSessionResponse,
    CreateCheckoutRequest,
    PaymentDataInput,
    UpdateCheckoutRequest,
)
from src.merchant.db.models import CheckoutSession, CheckoutStatus, Product
from src.merchant.services.helpers import (
    DEFAULT_CURRENCY,
    DEFAULT_SHOP_URL,
    address_input_to_dict,
    apply_discount_codes,
    buyer_input_to_dict,
    calculate_line_item_with_promotion,
    calculate_totals,
    check_ready_for_payment,
    generate_default_links,
    generate_fulfillment_options,
    generate_order_id,
    generate_session_id,
    recalculate_line_item_from_existing,
    session_to_response,
)

logger = logging.getLogger(__name__)


# =============================================================================
# Service Exceptions
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


# =============================================================================
# Service Functions
# =============================================================================


def _extract_discount_codes_from_request(
    discounts: dict[str, list[str]] | None,
    coupons: list[str] | None,
) -> list[str] | None:
    """Extract submitted discount codes from request fields."""
    if discounts is not None:
        return discounts.get("codes", [])
    if coupons is not None:
        return coupons
    return None


def _get_existing_discount_codes(session: CheckoutSession) -> list[str]:
    """Read previously submitted discount codes from session metadata."""
    if not session.metadata_json:
        return []
    try:
        metadata_obj = json.loads(session.metadata_json)
    except json.JSONDecodeError:
        return []
    if not isinstance(metadata_obj, dict):
        return []
    metadata = cast(dict[str, Any], metadata_obj)
    raw_discounts_obj = metadata.get("discounts", {})
    if not isinstance(raw_discounts_obj, dict):
        return []
    raw_discounts = cast(dict[str, Any], raw_discounts_obj)
    raw_codes_obj = raw_discounts.get("codes", [])
    if not isinstance(raw_codes_obj, list):
        return []
    raw_codes = cast(list[Any], raw_codes_obj)
    return [str(code) for code in raw_codes]


async def create_checkout_session(
    db: Session, request: CreateCheckoutRequest, protocol: str = "acp"
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
    session_id = generate_session_id()
    item_count = len(request.items)
    total_quantity = sum(item.quantity for item in request.items)

    logger.info(
        f"Creating checkout session {session_id} with {item_count} item(s), "
        f"total qty={total_quantity}"
    )

    # Build line items from products with promotion discounts
    line_items: list[dict[str, Any]] = []
    products_by_id: dict[str, Product] = {}
    for item in request.items:
        product = db.exec(select(Product).where(Product.id == item.id)).first()
        if product is None:
            logger.warning(f"Product not found: {item.id}")
            raise ProductNotFoundError(item.id)
        products_by_id[item.id] = product

        # Get line item with promotion discount (async call to agent)
        line_item = await calculate_line_item_with_promotion(db, product, item.quantity)
        line_items.append(line_item)

    submitted_codes = _extract_discount_codes_from_request(
        request.discounts, request.coupons
    )
    (
        line_items,
        discounts_payload,
        discount_warning_messages,
    ) = apply_discount_codes(line_items, products_by_id, submitted_codes)

    # Process optional buyer
    buyer_json = None
    if request.buyer:
        buyer_json = json.dumps(buyer_input_to_dict(request.buyer))

    # Process optional fulfillment address
    fulfillment_address_json = None
    has_address = request.fulfillment_address is not None
    if request.fulfillment_address:
        fulfillment_address_json = json.dumps(
            address_input_to_dict(request.fulfillment_address)
        )

    # Generate fulfillment options
    fulfillment_options: list[dict[str, Any]] = generate_fulfillment_options(
        has_address
    )

    # Calculate totals
    totals: list[dict[str, Any]] = calculate_totals(
        line_items, fulfillment_options, None
    )

    # Generate default links
    links: list[dict[str, Any]] = generate_default_links()

    # Generate welcome message
    messages: list[dict[str, Any]] = [
        {
            "type": "info",
            "param": "$",
            "content_type": "plain",
            "content": "Welcome to checkout! Please complete all required fields.",
        }
    ]
    messages.extend(discount_warning_messages)
    metadata = {"discounts": discounts_payload}

    # Create database record
    checkout_session = CheckoutSession(
        id=session_id,
        protocol=protocol,
        status=CheckoutStatus.NOT_READY_FOR_PAYMENT,
        currency=DEFAULT_CURRENCY.upper(),
        line_items_json=json.dumps(line_items),
        buyer_json=buyer_json,
        fulfillment_address_json=fulfillment_address_json,
        fulfillment_options_json=json.dumps(fulfillment_options),
        totals_json=json.dumps(totals),
        messages_json=json.dumps(messages),
        links_json=json.dumps(links),
        metadata_json=json.dumps(metadata),
    )

    db.add(checkout_session)
    db.commit()
    db.refresh(checkout_session)

    # Calculate total for logging
    total_amount = next((t["amount"] for t in totals if t["type"] == "total"), 0)
    logger.info(
        f"Checkout session {session_id} created | "
        f"status={checkout_session.status.value} | "
        f"total=${total_amount / 100:.2f}"
    )

    return session_to_response(checkout_session)


async def create_checkout_session_from_data(
    db: Session,
    *,
    items: list[dict[str, Any]],
    buyer: dict[str, Any] | None = None,
    fulfillment_address: dict[str, Any] | None = None,
    discounts: dict[str, list[str]] | None = None,
    coupons: list[str] | None = None,
    protocol: str = "acp",
) -> CheckoutSessionResponse:
    """Protocol-agnostic create entry point used by protocol adapters."""
    request = CreateCheckoutRequest.model_validate(
        {
            "items": items,
            "buyer": buyer,
            "fulfillment_address": fulfillment_address,
            "discounts": discounts,
            "coupons": coupons,
        }
    )
    return await create_checkout_session(db, request, protocol=protocol)


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

    return session_to_response(session)


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
        logger.warning(f"Session not found for update: {session_id}")
        raise SessionNotFoundError(session_id)

    # Check if session can be updated
    if session.status in (CheckoutStatus.COMPLETED, CheckoutStatus.CANCELED):
        logger.warning(
            f"Invalid update attempt on session {session_id} | "
            f"status={session.status.value}"
        )
        raise InvalidStateTransitionError(session.status.value, "update")

    # Track what's being updated for logging
    update_fields: list[str] = []
    if request.items is not None:
        update_fields.append("items")
    if request.buyer is not None:
        update_fields.append("buyer")
    if request.fulfillment_address is not None:
        update_fields.append("address")
    if request.fulfillment_option_id is not None:
        update_fields.append("shipping")
    if request.discounts is not None or request.coupons is not None:
        update_fields.append("discounts")

    logger.debug(f"Updating session {session_id} | fields={update_fields}")

    # Update items if provided (reuse existing promotion data, no agent call)
    products_by_id: dict[str, Product] = {}
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
            products_by_id[item.id] = product

            # Check if this product has existing promotion data
            existing_li = existing_by_product_id.get(item.id)
            if existing_li is not None:
                # Reuse existing promotion, just recalculate totals for new quantity
                line_item = recalculate_line_item_from_existing(
                    product, item.quantity, existing_li
                )
            else:
                # New product added to cart - call promotion agent
                line_item = await calculate_line_item_with_promotion(
                    db, product, item.quantity
                )
            new_line_items.append(line_item)
        session.line_items_json = json.dumps(new_line_items)
    else:
        current_line_items: list[dict[str, Any]] = json.loads(session.line_items_json)
        for line_item in current_line_items:
            product_id = str(line_item["item"]["id"])
            product = db.exec(select(Product).where(Product.id == product_id)).first()
            if product is not None:
                products_by_id[product_id] = product

    # Update buyer if provided
    if request.buyer is not None:
        session.buyer_json = json.dumps(buyer_input_to_dict(request.buyer))

    # Update fulfillment address if provided
    if request.fulfillment_address is not None:
        session.fulfillment_address_json = json.dumps(
            address_input_to_dict(request.fulfillment_address)
        )
        # Regenerate fulfillment options when address changes
        new_options: list[dict[str, Any]] = generate_fulfillment_options(
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
    submitted_codes = _extract_discount_codes_from_request(
        request.discounts, request.coupons
    )
    if submitted_codes is None:
        submitted_codes = _get_existing_discount_codes(session)

    (
        current_line_items,
        discounts_payload,
        discount_warning_messages,
    ) = apply_discount_codes(current_line_items, products_by_id, submitted_codes)
    session.line_items_json = json.dumps(current_line_items)

    current_fulfillment_options: list[dict[str, Any]] = json.loads(
        session.fulfillment_options_json
    )
    updated_totals: list[dict[str, Any]] = calculate_totals(
        current_line_items,
        current_fulfillment_options,
        session.selected_fulfillment_option_id,
    )
    session.totals_json = json.dumps(updated_totals)

    # Check if ready for payment and update status
    base_message = "Welcome to checkout! Please complete all required fields."
    if check_ready_for_payment(session):
        session.status = CheckoutStatus.READY_FOR_PAYMENT
        base_message = "Ready for payment! Review your order and proceed."

    session.messages_json = json.dumps(
        [
            {
                "type": "info",
                "param": "$",
                "content_type": "plain",
                "content": base_message,
            },
            *discount_warning_messages,
        ]
    )
    metadata: dict[str, Any] = {}
    if session.metadata_json:
        try:
            metadata_obj = json.loads(session.metadata_json)
        except json.JSONDecodeError:
            metadata_obj = {}
        if isinstance(metadata_obj, dict):
            metadata = cast(dict[str, Any], metadata_obj)
    metadata["discounts"] = discounts_payload
    session.metadata_json = json.dumps(metadata)

    session.updated_at = datetime.now(UTC)
    db.add(session)
    db.commit()
    db.refresh(session)

    # Log status transition if it happened
    logger.info(
        f"Session {session_id} updated | "
        f"status={session.status.value} | "
        f"fields={update_fields}"
    )

    return session_to_response(session)


async def update_checkout_session_from_data(
    db: Session,
    session_id: str,
    *,
    items: list[dict[str, Any]] | None = None,
    buyer: dict[str, Any] | None = None,
    fulfillment_address: dict[str, Any] | None = None,
    fulfillment_option_id: str | None = None,
    discounts: dict[str, list[str]] | None = None,
    coupons: list[str] | None = None,
) -> CheckoutSessionResponse:
    """Protocol-agnostic update entry point used by protocol adapters."""
    request = UpdateCheckoutRequest.model_validate(
        {
            "items": items,
            "buyer": buyer,
            "fulfillment_address": fulfillment_address,
            "fulfillment_option_id": fulfillment_option_id,
            "discounts": discounts,
            "coupons": coupons,
        }
    )
    return await update_checkout_session(db, session_id, request)


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
    logger.info(f"Completing checkout session {session_id}")

    session = db.exec(
        select(CheckoutSession).where(CheckoutSession.id == session_id)
    ).first()

    if session is None:
        logger.warning(f"Session not found for completion: {session_id}")
        raise SessionNotFoundError(session_id)

    # Check if session can be completed
    if session.status == CheckoutStatus.COMPLETED:
        logger.warning(f"Session {session_id} already completed")
        raise InvalidStateTransitionError(session.status.value, "complete")

    if session.status == CheckoutStatus.CANCELED:
        logger.warning(f"Cannot complete canceled session {session_id}")
        raise InvalidStateTransitionError(session.status.value, "complete")

    # Update buyer if provided
    if buyer is not None:
        session.buyer_json = json.dumps(buyer_input_to_dict(buyer))

    # Verify session is ready for payment (has all required fields)
    if not check_ready_for_payment(session):
        logger.warning(f"Session {session_id} not ready for payment")
        raise InvalidStateTransitionError(session.status.value, "complete")

    # Create order
    order_id = generate_order_id()
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

    # Get total from stored JSON for logging
    totals_data = json.loads(session.totals_json)
    total_amount = next((t["amount"] for t in totals_data if t["type"] == "total"), 0)
    logger.info(
        f"Order {order_id} completed | "
        f"session={session_id} | "
        f"total=${total_amount / 100:.2f}"
    )

    return session_to_response(session)


def complete_checkout_session_from_data(
    db: Session,
    session_id: str,
    *,
    payment_data: dict[str, Any],
    buyer: dict[str, Any] | None = None,
) -> CheckoutSessionResponse:
    """Protocol-agnostic complete entry point used by protocol adapters."""
    typed_payment = PaymentDataInput.model_validate(payment_data)
    typed_buyer = BuyerInput.model_validate(buyer) if buyer is not None else None
    return complete_checkout_session(
        db,
        session_id,
        typed_payment,
        buyer=typed_buyer,
    )


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
    logger.info(f"Canceling checkout session {session_id}")

    session = db.exec(
        select(CheckoutSession).where(CheckoutSession.id == session_id)
    ).first()

    if session is None:
        logger.warning(f"Session not found for cancellation: {session_id}")
        raise SessionNotFoundError(session_id)

    # Check if session can be canceled
    if session.status == CheckoutStatus.COMPLETED:
        logger.warning(f"Cannot cancel completed session {session_id}")
        raise InvalidStateTransitionError(session.status.value, "cancel")

    if session.status == CheckoutStatus.CANCELED:
        logger.warning(f"Session {session_id} already canceled")
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

    logger.info(f"Session {session_id} canceled")

    return session_to_response(session)
