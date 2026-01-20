"""ACP headers handling middleware."""

import json
import uuid
from collections.abc import Awaitable, Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from src.merchant.services.idempotency import get_idempotency_store


class ACPHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware for handling ACP-specific headers.

    Handles:
    - Request-Id: Generate if not provided, echo in response
    - Idempotency-Key: Echo in response, handle idempotency logic for POST requests
    - Accept-Language: Store in request state for downstream use
    - API-Version: Store in request state for potential version gating
    """

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        """Process ACP headers and handle idempotency.

        Args:
            request: The incoming HTTP request.
            call_next: The next middleware or route handler.

        Returns:
            The HTTP response with ACP headers.
        """
        # Extract or generate Request-Id
        request_id = request.headers.get("Request-Id")
        if not request_id:
            request_id = str(uuid.uuid4())

        # Store headers in request state for downstream use
        request.state.request_id = request_id
        request.state.accept_language = request.headers.get("Accept-Language", "en-US")
        request.state.api_version = request.headers.get("API-Version")

        # Handle idempotency for POST requests
        idempotency_key = request.headers.get("Idempotency-Key")

        if request.method == "POST" and idempotency_key:
            # Read body for idempotency check
            body = await request.body()

            # Check idempotency store
            store = get_idempotency_store()
            entry, is_conflict = store.get(
                idempotency_key, body, request.url.path, request.method
            )

            if is_conflict:
                # Same key but different request - return 409
                conflict_response = Response(
                    content=json.dumps(
                        {
                            "type": "invalid_request",
                            "code": "request_not_idempotent",
                            "message": "A different request was already made with this idempotency key.",
                        }
                    ),
                    status_code=409,
                    media_type="application/json",
                )
                conflict_response.headers["Request-Id"] = request_id
                conflict_response.headers["Idempotency-Key"] = idempotency_key
                return conflict_response

            if entry is not None:
                # Same key and same request - return cached response
                cached_response = Response(
                    content=json.dumps(entry.response_body),
                    status_code=entry.response_status,
                    media_type="application/json",
                )
                cached_response.headers["Request-Id"] = request_id
                cached_response.headers["Idempotency-Key"] = idempotency_key
                cached_response.headers["X-Idempotency-Cached"] = "true"
                return cached_response

            # New idempotency key - process normally and cache
            response = await call_next(request)

            # Cache successful responses (2xx status codes)
            if 200 <= response.status_code < 300:
                # Read response body for caching using body_iterator
                chunks: list[bytes] = []
                body_iterator = getattr(response, "body_iterator", None)
                if body_iterator is not None:
                    async for chunk in body_iterator:
                        if isinstance(chunk, bytes):
                            chunks.append(chunk)
                        elif isinstance(chunk, str):
                            chunks.append(chunk.encode())
                response_body_bytes: bytes = b"".join(chunks)

                try:
                    response_dict = json.loads(response_body_bytes.decode())
                    store.store(
                        idempotency_key,
                        body,
                        request.url.path,
                        request.method,
                        response.status_code,
                        response_dict,
                    )
                except (json.JSONDecodeError, UnicodeDecodeError):
                    pass  # Don't cache non-JSON responses

                # Rebuild response with body
                new_response = Response(
                    content=response_body_bytes,
                    status_code=response.status_code,
                    media_type=response.media_type,
                    headers=dict(response.headers),
                )
                new_response.headers["Request-Id"] = request_id
                new_response.headers["Idempotency-Key"] = idempotency_key
                return new_response

            # Non-2xx response - don't cache but still add headers
            response.headers["Request-Id"] = request_id
            response.headers["Idempotency-Key"] = idempotency_key
            return response

        # Non-POST or no idempotency key - process normally
        response = await call_next(request)

        # Add standard headers
        response.headers["Request-Id"] = request_id
        if idempotency_key:
            response.headers["Idempotency-Key"] = idempotency_key

        return response
