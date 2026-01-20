"""Checkout session API routes implementing the Agentic Checkout Protocol."""

from fastapi import APIRouter, Depends, HTTPException, status
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
def create_checkout(
    request: CreateCheckoutRequest,
    db: Session = Depends(get_session),
) -> CheckoutSessionResponse:
    """Create a new checkout session.

    Args:
        request: CreateCheckoutRequest with items and optional buyer/address.
        db: Database session from dependency injection.

    Returns:
        CheckoutSessionResponse with the new session.

    Raises:
        HTTPException: 400 if product not found.
    """
    try:
        return create_checkout_session(db, request)
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
def update_checkout(
    session_id: str,
    request: UpdateCheckoutRequest,
    db: Session = Depends(get_session),
) -> CheckoutSessionResponse:
    """Update a checkout session.

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
        return update_checkout_session(db, session_id, request)
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
    db: Session = Depends(get_session),
) -> CheckoutSessionResponse:
    """Complete a checkout session with payment.

    Args:
        session_id: Checkout session ID.
        request: CompleteCheckoutRequest with payment data.
        db: Database session from dependency injection.

    Returns:
        CheckoutSessionResponse with the completed session and order.

    Raises:
        HTTPException: 404 if session not found, 405 if invalid state.
    """
    try:
        return complete_checkout_session(
            db, session_id, request.payment_data, request.buyer
        )
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
