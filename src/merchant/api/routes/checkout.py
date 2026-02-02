"""Checkout session API routes implementing the Agentic Checkout Protocol."""

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlmodel import Session

from src.merchant.api.dependencies import verify_api_key
from src.merchant.api.schemas import (
    CheckoutSessionResponse,
    CompleteCheckoutRequest,
    CreateCheckoutRequest,
    ErrorResponse,
    ErrorResponseCodeEnum,
    ErrorTypeEnum,
    UpdateCheckoutRequest,
)
from src.merchant.db.database import get_session
from src.merchant.services.checkout import (
    InvalidStateTransitionError,
    ProductNotFoundError,
    SessionNotFoundError,
    cancel_checkout_session,
    complete_checkout_session,
    create_checkout_session,
    get_checkout_session,
    update_checkout_session,
)
from src.merchant.services.post_purchase import OrderItem
from src.merchant.services.post_purchase_webhook import trigger_post_purchase_flow

router = APIRouter(
    prefix="/checkout_sessions",
    tags=["checkout"],
    dependencies=[Depends(verify_api_key)],
)


def _handle_service_error(error: Exception) -> HTTPException:
    """Convert service layer errors to HTTP exceptions.

    Args:
        error: Service layer exception.

    Returns:
        HTTPException with appropriate status code and error response.
    """
    if isinstance(error, SessionNotFoundError):
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorResponse(
                type=ErrorTypeEnum.NOT_FOUND,
                code=ErrorResponseCodeEnum.SESSION_NOT_FOUND,
                message=error.message,
            ).model_dump(),
        )

    if isinstance(error, ProductNotFoundError):
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorResponse(
                type=ErrorTypeEnum.INVALID_REQUEST,
                code=ErrorResponseCodeEnum.PRODUCT_NOT_FOUND,
                message=error.message,
            ).model_dump(),
        )

    if isinstance(error, InvalidStateTransitionError):
        return HTTPException(
            status_code=status.HTTP_405_METHOD_NOT_ALLOWED,
            detail=ErrorResponse(
                type=ErrorTypeEnum.METHOD_NOT_ALLOWED,
                code=ErrorResponseCodeEnum.INVALID_STATUS_TRANSITION,
                message=error.message,
            ).model_dump(),
        )

    # Generic internal error
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=ErrorResponse(
            type=ErrorTypeEnum.INTERNAL_ERROR,
            code=ErrorResponseCodeEnum.VALIDATION_ERROR,
            message=str(error),
        ).model_dump(),
    )


@router.post(
    "",
    response_model=CheckoutSessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Checkout Session",
    description="Create a new checkout session with items and optional buyer/address.",
    responses={
        201: {"description": "Checkout session created"},
        400: {"description": "Invalid request (e.g., product not found)"},
    },
)
async def create_checkout(
    request: CreateCheckoutRequest,
    db: Session = Depends(get_session),
) -> CheckoutSessionResponse:
    """Create a new checkout session.

    Calls the Promotion Agent to get dynamic pricing for each item.

    Args:
        request: CreateCheckoutRequest with items and optional buyer/address.
        db: Database session from dependency injection.

    Returns:
        CheckoutSessionResponse with the new session.

    Raises:
        HTTPException: 400 if product not found.
    """
    try:
        return await create_checkout_session(db, request)
    except (
        ProductNotFoundError,
        SessionNotFoundError,
        InvalidStateTransitionError,
    ) as e:
        raise _handle_service_error(e) from e


@router.get(
    "/{session_id}",
    response_model=CheckoutSessionResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Checkout Session",
    description="Retrieve a checkout session by ID.",
    responses={
        200: {"description": "Checkout session found"},
        404: {"description": "Checkout session not found"},
    },
)
def get_checkout(
    session_id: str,
    db: Session = Depends(get_session),
) -> CheckoutSessionResponse:
    """Get a checkout session by ID.

    Args:
        session_id: Checkout session ID.
        db: Database session from dependency injection.

    Returns:
        CheckoutSessionResponse with the session.

    Raises:
        HTTPException: 404 if session not found.
    """
    try:
        return get_checkout_session(db, session_id)
    except SessionNotFoundError as e:
        raise _handle_service_error(e) from e


@router.post(
    "/{session_id}",
    response_model=CheckoutSessionResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Checkout Session",
    description="Update a checkout session with new items, buyer info, or address.",
    responses={
        200: {"description": "Checkout session updated"},
        400: {"description": "Invalid request"},
        404: {"description": "Checkout session not found"},
        405: {"description": "Cannot update session in current state"},
    },
)
async def update_checkout(
    session_id: str,
    request: UpdateCheckoutRequest,
    db: Session = Depends(get_session),
) -> CheckoutSessionResponse:
    """Update a checkout session.

    Recalculates promotions when items are updated.

    Args:
        session_id: Checkout session ID.
        request: UpdateCheckoutRequest with fields to update.
        db: Database session from dependency injection.

    Returns:
        CheckoutSessionResponse with the updated session.

    Raises:
        HTTPException: 404 if session not found, 405 if invalid state.
    """
    try:
        return await update_checkout_session(db, session_id, request)
    except (
        ProductNotFoundError,
        SessionNotFoundError,
        InvalidStateTransitionError,
    ) as e:
        raise _handle_service_error(e) from e


@router.post(
    "/{session_id}/complete",
    response_model=CheckoutSessionResponse,
    status_code=status.HTTP_200_OK,
    summary="Complete Checkout",
    description="Complete a checkout session with payment data.",
    responses={
        200: {"description": "Checkout completed, order created"},
        404: {"description": "Checkout session not found"},
        405: {"description": "Cannot complete session in current state"},
    },
)
def complete_checkout(
    session_id: str,
    request: CompleteCheckoutRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_session),
) -> CheckoutSessionResponse:
    """Complete a checkout session with payment.

    After successful completion, triggers the post-purchase agent flow
    as a background task (per ACP spec - Merchant sends webhook to Client).

    Args:
        session_id: Checkout session ID.
        request: CompleteCheckoutRequest with payment data.
        background_tasks: FastAPI background tasks for post-purchase flow.
        db: Database session from dependency injection.

    Returns:
        CheckoutSessionResponse with the completed session and order.

    Raises:
        HTTPException: 404 if session not found, 405 if invalid state.
    """
    try:
        response = complete_checkout_session(
            db, session_id, request.payment_data, request.buyer
        )

        # Trigger post-purchase agent and webhook delivery (ACP architecture)
        # This runs as a background task so it doesn't block the checkout response
        if response.order is not None:
            # Extract customer name from multiple sources (in priority order):
            # 1. billing_address.name from payment_data (user's actual input)
            # 2. buyer.first_name from request
            # 3. buyer.first_name from session response
            customer_name = "Customer"
            billing_name = None
            if (
                request.payment_data
                and request.payment_data.billing_address
                and request.payment_data.billing_address.name
            ):
                # Extract first name from billing address (e.g., "John Doe" -> "John")
                billing_name = request.payment_data.billing_address.name.strip()
                name_parts = billing_name.split()
                if name_parts:
                    customer_name = name_parts[0]
            elif request.buyer and request.buyer.first_name:
                customer_name = request.buyer.first_name
            elif response.buyer and response.buyer.first_name:
                customer_name = response.buyer.first_name

            items: list[OrderItem] = []
            for line_item in response.line_items or []:
                item_name = line_item.name or line_item.item.id
                items.append({"name": item_name, "quantity": line_item.item.quantity})

            if not items:
                items = [{"name": "your order", "quantity": 1}]

            # Queue the post-purchase flow as a background task
            background_tasks.add_task(
                trigger_post_purchase_flow,
                checkout_session_id=session_id,
                order_id=response.order.id,
                customer_name=customer_name,
                items=items,
                language="en",  # Could be extracted from buyer preferences
            )

        return response
    except (SessionNotFoundError, InvalidStateTransitionError) as e:
        raise _handle_service_error(e) from e


@router.post(
    "/{session_id}/cancel",
    response_model=CheckoutSessionResponse,
    status_code=status.HTTP_200_OK,
    summary="Cancel Checkout",
    description="Cancel a checkout session.",
    responses={
        200: {"description": "Checkout session canceled"},
        404: {"description": "Checkout session not found"},
        405: {"description": "Cannot cancel session in current state"},
    },
)
def cancel_checkout(
    session_id: str,
    db: Session = Depends(get_session),
) -> CheckoutSessionResponse:
    """Cancel a checkout session.

    Args:
        session_id: Checkout session ID.
        db: Database session from dependency injection.

    Returns:
        CheckoutSessionResponse with the canceled session.

    Raises:
        HTTPException: 404 if session not found, 405 if invalid state.
    """
    try:
        return cancel_checkout_session(db, session_id)
    except (SessionNotFoundError, InvalidStateTransitionError) as e:
        raise _handle_service_error(e) from e
