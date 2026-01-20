"""Request/response logging middleware."""

import logging
import time
from collections.abc import Awaitable, Callable
from typing import Any

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("agentic_commerce.api")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging HTTP requests and responses.

    Logs request details on entry and response details with duration on exit.
    Sensitive headers (Authorization, X-API-Key) are redacted in logs.
    """

    SENSITIVE_HEADERS = {"authorization", "x-api-key"}

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        """Process and log the request/response cycle.

        Args:
            request: The incoming HTTP request.
            call_next: The next middleware or route handler.

        Returns:
            The HTTP response.
        """
        start_time = time.perf_counter()
        request_id = request.headers.get("Request-Id", "unknown")

        # Log request (with sensitive headers redacted)
        safe_headers = self._redact_headers(dict(request.headers))
        logger.info(
            "Request started",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "query": str(request.query_params),
                "headers": safe_headers,
            },
        )

        # Process request
        response = await call_next(request)

        # Calculate duration
        duration_ms = (time.perf_counter() - start_time) * 1000

        # Log response
        logger.info(
            "Request completed",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": round(duration_ms, 2),
            },
        )

        return response

    def _redact_headers(self, headers: dict[str, Any]) -> dict[str, str]:
        """Redact sensitive headers for logging.

        Args:
            headers: Dictionary of header names to values.

        Returns:
            Headers with sensitive values redacted.
        """
        redacted: dict[str, str] = {}
        for key, value in headers.items():
            if key.lower() in self.SENSITIVE_HEADERS:
                redacted[key] = "[REDACTED]"
            else:
                redacted[key] = str(value)
        return redacted
