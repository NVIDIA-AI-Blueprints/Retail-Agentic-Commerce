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

"""FastAPI dependency injection utilities for API security."""

from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.merchant.config import Settings, get_settings

# Optional bearer token scheme (auto_error=False allows X-API-Key fallback)
bearer_scheme = HTTPBearer(auto_error=False)


def verify_api_key(
    settings: Annotated[Settings, Depends(get_settings)],
    bearer_credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(bearer_scheme)
    ] = None,
    x_api_key: Annotated[str | None, Header(alias="X-API-Key")] = None,
) -> str:
    """Verify API key from Authorization header or X-API-Key header.

    Supports two authentication methods:
    1. Authorization: Bearer <API_KEY>
    2. X-API-Key: <API_KEY>

    Args:
        settings: Application settings containing the valid API key.
        bearer_credentials: Optional Bearer token from Authorization header.
        x_api_key: Optional API key from X-API-Key header.

    Returns:
        The validated API key.

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
                "message": "API key is required. Provide via 'Authorization: Bearer <key>' or 'X-API-Key' header.",
            },
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Validate API key against configured value
    if not settings.merchant_api_key:
        # No API key configured - reject all requests in production
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "type": "internal_error",
                "code": "configuration_error",
                "message": "API key not configured on server.",
            },
        )

    if api_key != settings.merchant_api_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "type": "forbidden",
                "code": "invalid_api_key",
                "message": "Invalid API key.",
            },
        )

    return api_key
