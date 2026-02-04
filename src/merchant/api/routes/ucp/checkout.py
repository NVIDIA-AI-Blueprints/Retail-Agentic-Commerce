"""UCP checkout REST endpoints (Phase 2)."""

from __future__ import annotations

from datetime import datetime
from typing import Annotated, Any

import httpx
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlmodel import Session

from src.merchant.api.dependencies import verify_api_key
from src.merchant.api.ucp_schemas import (
    UCPCheckoutResponse,
    UCPCompleteCheckoutRequest,
    UCPCreateCheckoutRequest,
    UCPUpdateCheckoutRequest,
)
from src.merchant.config import get_settings
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
from src.merchant.services.ucp import (
    build_business_profile,
    compute_capability_intersection,
    convert_ucp_buyer,
    fetch_platform_profile,
    normalize_ucp_create_request,
    normalize_ucp_update_request,
    parse_ucp_agent_header,
    transform_to_ucp_response,
)

router = APIRouter(
    prefix="/checkout-sessions",
    tags=["ucp"],
    dependencies=[Depends(verify_api_key)],
)


def _validate_platform_version(platform_profile: dict[str, Any]) -> None:
    ucp_block = platform_profile.get("ucp", {})
    platform_version = ucp_block.get("version")
    if not isinstance(platform_version, str):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Platform profile malformed",
        )

    try:
        parsed_platform_version = datetime.strptime(platform_version, "%Y-%m-%d").date()
        parsed_business_version = datetime.strptime(
            get_settings().ucp_version, "%Y-%m-%d"
        ).date()
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Platform profile malformed",
        ) from exc

    if parsed_platform_version > parsed_business_version:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Platform profile version unsupported",
        )


async def _negotiate_capabilities(
    request: Request, ucp_agent: str | None
) -> dict[str, Any]:
    if not ucp_agent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing UCP-Agent header",
        )

    try:
        profile_url = parse_ucp_agent_header(ucp_agent)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    try:
        platform_profile = await fetch_platform_profile(profile_url)
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_424_FAILED_DEPENDENCY,
            detail="Platform profile unreachable",
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Platform profile malformed",
        ) from exc

    _validate_platform_version(platform_profile)

    business_profile = build_business_profile(
        request_base_url=str(request.base_url).rstrip("/")
    )
    negotiated = compute_capability_intersection(business_profile, platform_profile)

    if not negotiated:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Platform does not support checkout capability",
        )

    return negotiated


def _handle_service_error(error: Exception) -> HTTPException:
    if isinstance(error, SessionNotFoundError):
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Checkout session not found",
        )

    if isinstance(error, ProductNotFoundError):
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error.message,
        )

    if isinstance(error, InvalidStateTransitionError):
        return HTTPException(
            status_code=status.HTTP_405_METHOD_NOT_ALLOWED,
            detail=error.message,
        )

    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=str(error),
    )


@router.post(
    "",
    response_model=UCPCheckoutResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create UCP Checkout Session",
)
async def create_ucp_checkout(
    request_body: UCPCreateCheckoutRequest,
    request: Request,
    ucp_agent: Annotated[str | None, Header(alias="UCP-Agent")] = None,
    idempotency_key: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
    db: Session = Depends(get_session),
) -> UCPCheckoutResponse:
    """Create a UCP checkout session."""
    _ = idempotency_key
    negotiated = await _negotiate_capabilities(request, ucp_agent)

    internal_request = normalize_ucp_create_request(request_body)
    try:
        acp_response = await create_checkout_session(
            db, internal_request, protocol="ucp"
        )
    except (
        ProductNotFoundError,
        SessionNotFoundError,
        InvalidStateTransitionError,
    ) as e:
        raise _handle_service_error(e) from e

    return transform_to_ucp_response(acp_response, negotiated)


@router.get(
    "/{session_id}",
    response_model=UCPCheckoutResponse,
    status_code=status.HTTP_200_OK,
    summary="Get UCP Checkout Session",
)
async def get_ucp_checkout(
    session_id: str,
    request: Request,
    ucp_agent: Annotated[str | None, Header(alias="UCP-Agent")] = None,
    db: Session = Depends(get_session),
) -> UCPCheckoutResponse:
    """Get a UCP checkout session by ID."""
    negotiated = await _negotiate_capabilities(request, ucp_agent)

    try:
        acp_response = get_checkout_session(db, session_id)
    except SessionNotFoundError as e:
        raise _handle_service_error(e) from e

    return transform_to_ucp_response(acp_response, negotiated)


@router.put(
    "/{session_id}",
    response_model=UCPCheckoutResponse,
    status_code=status.HTTP_200_OK,
    summary="Update UCP Checkout Session",
)
async def update_ucp_checkout(
    session_id: str,
    request_body: UCPUpdateCheckoutRequest,
    request: Request,
    ucp_agent: Annotated[str | None, Header(alias="UCP-Agent")] = None,
    idempotency_key: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
    db: Session = Depends(get_session),
) -> UCPCheckoutResponse:
    """Update a UCP checkout session."""
    _ = idempotency_key
    negotiated = await _negotiate_capabilities(request, ucp_agent)

    internal_request = normalize_ucp_update_request(request_body)
    try:
        acp_response = await update_checkout_session(db, session_id, internal_request)
    except (
        ProductNotFoundError,
        SessionNotFoundError,
        InvalidStateTransitionError,
    ) as e:
        raise _handle_service_error(e) from e

    return transform_to_ucp_response(acp_response, negotiated)


@router.post(
    "/{session_id}/complete",
    response_model=UCPCheckoutResponse,
    status_code=status.HTTP_200_OK,
    summary="Complete UCP Checkout Session",
)
async def complete_ucp_checkout(
    session_id: str,
    request_body: UCPCompleteCheckoutRequest,
    request: Request,
    ucp_agent: Annotated[str | None, Header(alias="UCP-Agent")] = None,
    idempotency_key: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
    db: Session = Depends(get_session),
) -> UCPCheckoutResponse:
    """Complete a UCP checkout session."""
    _ = idempotency_key
    negotiated = await _negotiate_capabilities(request, ucp_agent)

    buyer = convert_ucp_buyer(request_body.buyer)

    try:
        acp_response = complete_checkout_session(
            db, session_id, request_body.payment_data, buyer
        )
    except (SessionNotFoundError, InvalidStateTransitionError) as e:
        raise _handle_service_error(e) from e

    return transform_to_ucp_response(acp_response, negotiated)


@router.post(
    "/{session_id}/cancel",
    response_model=UCPCheckoutResponse,
    status_code=status.HTTP_200_OK,
    summary="Cancel UCP Checkout Session",
)
async def cancel_ucp_checkout(
    session_id: str,
    request: Request,
    ucp_agent: Annotated[str | None, Header(alias="UCP-Agent")] = None,
    idempotency_key: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
    db: Session = Depends(get_session),
) -> UCPCheckoutResponse:
    """Cancel a UCP checkout session."""
    _ = idempotency_key
    negotiated = await _negotiate_capabilities(request, ucp_agent)

    try:
        acp_response = cancel_checkout_session(db, session_id)
    except (SessionNotFoundError, InvalidStateTransitionError) as e:
        raise _handle_service_error(e) from e

    return transform_to_ucp_response(acp_response, negotiated)
