"""PSP delegated payment endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlmodel import Session

from src.payment.api.dependencies import verify_psp_api_key
from src.payment.api.schemas import (
    CreatePaymentIntentRequest,
    DelegatePaymentRequest,
    DelegatePaymentResponse,
    PaymentIntentResponse,
)
from src.payment.db.database import get_session
from src.payment.services.idempotency import (
    check_idempotency,
    compute_request_hash,
    store_idempotency_response,
)
from src.payment.services.payment_intent import (
    AmountExceedsAllowanceError,
    CurrencyMismatchError,
    VaultTokenConsumedError,
    VaultTokenExpiredError,
    VaultTokenNotFoundError,
    create_and_process_payment_intent,
)
from src.payment.services.vault_token import (
    CheckoutSessionNotFoundError,
    create_vault_token,
)

router = APIRouter(
    prefix="/agentic_commerce",
    tags=["agentic_commerce"],
)


@router.post(
    "/delegate_payment",
    response_model=DelegatePaymentResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "Vault token created successfully"},
        401: {"description": "Missing API key"},
        403: {"description": "Invalid API key"},
        404: {"description": "Checkout session not found"},
        409: {"description": "Idempotency conflict"},
        422: {"description": "Validation error"},
    },
)
def delegate_payment(
    request_data: DelegatePaymentRequest,
    db: Annotated[Session, Depends(get_session)],
    _api_key: Annotated[str, Depends(verify_psp_api_key)],
    idempotency_key: Annotated[str, Header(alias="Idempotency-Key")],
) -> DelegatePaymentResponse:
    """Delegate a payment method to the PSP.

    Creates a vault token that can be used to process payments.

    Args:
        request_data: The delegate payment request body.
        db: Database session.
        _api_key: Validated PSP API key (unused but required for auth).
        idempotency_key: Idempotency key for request deduplication.

    Returns:
        DelegatePaymentResponse with the created vault token.

    Raises:
        HTTPException: Various status codes for different error conditions.
    """
    # Compute request hash for idempotency check
    request_body = request_data.model_dump()
    request_hash = compute_request_hash(
        "POST", "/agentic_commerce/delegate_payment", request_body
    )

    # Check idempotency
    idempotency_result = check_idempotency(db, idempotency_key, request_hash)

    if idempotency_result.is_conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "type": "conflict",
                "code": "request_not_idempotent",
                "message": "Request body differs from previous request with same Idempotency-Key.",
            },
        )

    if idempotency_result.is_cached:
        # Return cached response
        return DelegatePaymentResponse.model_validate(idempotency_result.cached_body)

    # Process the request
    try:
        response = create_vault_token(db, request_data, idempotency_key)
    except CheckoutSessionNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "type": "not_found",
                "code": "checkout_session_not_found",
                "message": str(e),
                "param": "allowance.checkout_session_id",
            },
        ) from e

    # Store response for idempotency
    response_body = response.model_dump()
    store_idempotency_response(db, idempotency_key, request_hash, 201, response_body)

    return response


@router.post(
    "/create_and_process_payment_intent",
    response_model=PaymentIntentResponse,
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "Payment processed successfully"},
        401: {"description": "Missing API key"},
        403: {"description": "Invalid API key"},
        404: {"description": "Vault token not found"},
        409: {"description": "Vault token already consumed"},
        410: {"description": "Vault token expired"},
        422: {"description": "Validation error (amount/currency)"},
    },
)
def process_payment_intent(
    request_data: CreatePaymentIntentRequest,
    db: Annotated[Session, Depends(get_session)],
    _api_key: Annotated[str, Depends(verify_psp_api_key)],
) -> PaymentIntentResponse:
    """Create and process a payment intent.

    Uses a vault token to process a payment. The vault token is consumed
    after successful processing (single-use).

    Args:
        request_data: The payment intent request body.
        db: Database session.
        _api_key: Validated PSP API key (unused but required for auth).

    Returns:
        PaymentIntentResponse with the processed payment details.

    Raises:
        HTTPException: Various status codes for different error conditions.
    """
    try:
        response = create_and_process_payment_intent(db, request_data)
    except VaultTokenNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "type": "not_found",
                "code": "vault_token_not_found",
                "message": str(e),
                "param": "vault_token",
            },
        ) from e
    except VaultTokenConsumedError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "type": "conflict",
                "code": "vault_token_consumed",
                "message": str(e),
                "param": "vault_token",
            },
        ) from e
    except VaultTokenExpiredError as e:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail={
                "type": "gone",
                "code": "vault_token_expired",
                "message": str(e),
                "param": "vault_token",
            },
        ) from e
    except AmountExceedsAllowanceError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "type": "invalid_request",
                "code": "amount_exceeds_allowance",
                "message": str(e),
                "param": "amount",
            },
        ) from e
    except CurrencyMismatchError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "type": "invalid_request",
                "code": "currency_mismatch",
                "message": str(e),
                "param": "currency",
            },
        ) from e

    return response
