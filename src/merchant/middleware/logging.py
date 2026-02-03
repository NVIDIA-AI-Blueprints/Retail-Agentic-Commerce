"""Request/response logging middleware with structured traceability."""

import logging
import time
import uuid
from collections.abc import Awaitable, Callable
from contextvars import ContextVar

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

# Context variable for request correlation across async calls
request_id_ctx: ContextVar[str] = ContextVar("request_id", default="")

logger = logging.getLogger("agentic_commerce.api")


def get_request_id() -> str:
    """Get the current request ID from context.

    Returns:
        The current request ID or empty string if not in request context.
    """
    return request_id_ctx.get()


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for structured HTTP request/response logging.

    Provides:
    - Request correlation via Request-Id header or auto-generated UUID
    - Duration tracking for performance monitoring
    - Clean, structured log output for traceability
    - Sensitive header redaction
    """

    SENSITIVE_HEADERS = {"authorization", "x-api-key", "cookie"}

    # Endpoints to skip logging (health checks, static files)
    SKIP_ENDPOINTS = {"/health", "/healthz", "/ready", "/favicon.ico"}

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
        # Skip logging for health checks and other noisy endpoints
        if request.url.path in self.SKIP_ENDPOINTS:
            return await call_next(request)

        start_time = time.perf_counter()

        # Get or generate request ID for correlation
        request_id = request.headers.get("Request-Id") or f"req_{uuid.uuid4().hex[:12]}"
        request_id_ctx.set(request_id)

        # Extract useful context
        method = request.method
        path = request.url.path
        client_ip = self._get_client_ip(request)
        idempotency_key = request.headers.get("Idempotency-Key", "")

        # Log request start with key context
        log_context = f"[{request_id}] {method} {path}"
        if idempotency_key:
            log_context += f" idem={idempotency_key[:16]}..."

        logger.info(f"{log_context} <- {client_ip}")

        # Process request
        try:
            response = await call_next(request)
        except Exception as e:
            # Log unhandled exceptions
            duration_ms = (time.perf_counter() - start_time) * 1000
            logger.error(
                f"{log_context} -> 500 ERROR ({duration_ms:.0f}ms) {type(e).__name__}: {e}"
            )
            raise

        # Calculate duration
        duration_ms = (time.perf_counter() - start_time) * 1000

        # Log response with status and duration
        status = response.status_code
        status_category = self._get_status_category(status)

        log_method = logger.info if status < 400 else logger.warning
        if status >= 500:
            log_method = logger.error

        log_method(f"{log_context} -> {status} {status_category} ({duration_ms:.0f}ms)")

        # Add request ID to response headers for client correlation
        response.headers["X-Request-Id"] = request_id

        return response

    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request, handling proxies.

        Args:
            request: The HTTP request.

        Returns:
            Client IP address string.
        """
        # Check X-Forwarded-For for proxy setups
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()

        # Check X-Real-IP
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip

        # Fall back to direct client
        if request.client:
            return request.client.host

        return "unknown"

    def _get_status_category(self, status: int) -> str:
        """Get a human-readable status category.

        Args:
            status: HTTP status code.

        Returns:
            Status category string.
        """
        if status < 300:
            return "OK"
        elif status < 400:
            return "REDIRECT"
        elif status == 401:
            return "UNAUTHORIZED"
        elif status == 403:
            return "FORBIDDEN"
        elif status == 404:
            return "NOT_FOUND"
        elif status == 409:
            return "CONFLICT"
        elif status == 422:
            return "VALIDATION_ERROR"
        elif status < 500:
            return "CLIENT_ERROR"
        else:
            return "SERVER_ERROR"
