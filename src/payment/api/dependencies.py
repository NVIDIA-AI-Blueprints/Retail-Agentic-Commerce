"""FastAPI dependency injection utilities for PSP API security."""

from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.payment.config import PaymentSettings, get_payment_settings

# Optional bearer token scheme (auto_error=False allows X-API-Key fallback)
psp_bearer_scheme = HTTPBearer(auto_error=False)


def verify_psp_api_key(
    settings: Annotated[PaymentSettings, Depends(get_payment_settings)],
    bearer_credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(psp_bearer_scheme)
    ] = None,
    x_api_key: Annotated[str | None, Header(alias="X-API-Key")] = None,
) -> str:
    """Verify PSP API key from Authorization header or X-API-Key header.

    Supports two authentication methods:
    1. Authorization: Bearer <PSP_API_KEY>
    2. X-API-Key: <PSP_API_KEY>

    Args:
        settings: Payment settings containing the valid PSP API key.
        bearer_credentials: Optional Bearer token from Authorization header.
        x_api_key: Optional API key from X-API-Key header.

    Returns:
        The validated PSP API key.

    Raises:
        HTTPException: 401 if no API key provided, 403 if invalid.
    """
    # Extract API key from either source
    api_key: str | None = None

    if bearer_credentials is not None:
        api_key = bearer_credentials.credentials
    elif x_api_key is not None:
        api_key = x_api_key

    # No API key provided
    if api_key is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "type": "unauthorized",
                "code": "missing_api_key",
                "message": "PSP API key is required. Provide via 'Authorization: Bearer <key>' or 'X-API-Key' header.",
            },
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Validate API key against configured value
    if not settings.psp_api_key:
        # No API key configured - reject all requests in production
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "type": "internal_error",
                "code": "configuration_error",
                "message": "PSP API key not configured on server.",
            },
        )

    if api_key != settings.psp_api_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "type": "forbidden",
                "code": "invalid_api_key",
                "message": "Invalid PSP API key.",
            },
        )

    return api_key
