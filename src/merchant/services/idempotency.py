"""Idempotency service for handling duplicate requests.

Implements idempotency key semantics per ACP specification:
- Same key + same request hash: return cached response
- Same key + different request hash: return 409 Conflict
"""

import hashlib
import time
from dataclasses import dataclass
from typing import Any


@dataclass
class IdempotencyEntry:
    """Stored idempotency entry."""

    request_hash: str
    response_status: int
    response_body: dict[str, Any]
    created_at: float


class IdempotencyStore:
    """In-memory idempotency store.

    Thread-safe for single-process deployments.
    For production, consider Redis or database-backed implementation.
    """

    def __init__(self, ttl_seconds: int = 86400) -> None:
        """Initialize the idempotency store.

        Args:
            ttl_seconds: Time-to-live for entries (default: 24 hours).
        """
        self._store: dict[str, IdempotencyEntry] = {}
        self._ttl_seconds = ttl_seconds

    def _compute_request_hash(self, body: bytes, path: str, method: str) -> str:
        """Compute a hash of the request for comparison.

        Args:
            body: Request body bytes.
            path: Request path.
            method: HTTP method.

        Returns:
            SHA-256 hash of the request.
        """
        content = f"{method}:{path}:{body.decode('utf-8', errors='replace')}"
        return hashlib.sha256(content.encode()).hexdigest()

    def _cleanup_expired(self) -> None:
        """Remove expired entries from the store."""
        current_time = time.time()
        expired_keys = [
            key
            for key, entry in self._store.items()
            if current_time - entry.created_at > self._ttl_seconds
        ]
        for key in expired_keys:
            del self._store[key]

    def get(
        self, idempotency_key: str, body: bytes, path: str, method: str
    ) -> tuple[IdempotencyEntry | None, bool]:
        """Check if an idempotency key exists and matches the request.

        Args:
            idempotency_key: The idempotency key from the request header.
            body: Request body bytes.
            path: Request path.
            method: HTTP method.

        Returns:
            Tuple of (entry, is_conflict):
            - (entry, False) if key exists and request matches (return cached response)
            - (None, True) if key exists but request differs (conflict)
            - (None, False) if key doesn't exist (proceed normally)
        """
        self._cleanup_expired()

        if idempotency_key not in self._store:
            return None, False

        entry = self._store[idempotency_key]
        request_hash = self._compute_request_hash(body, path, method)

        if entry.request_hash == request_hash:
            return entry, False
        else:
            return None, True

    def store(
        self,
        idempotency_key: str,
        body: bytes,
        path: str,
        method: str,
        response_status: int,
        response_body: dict[str, Any],
    ) -> None:
        """Store a response for an idempotency key.

        Args:
            idempotency_key: The idempotency key from the request header.
            body: Request body bytes.
            path: Request path.
            method: HTTP method.
            response_status: HTTP status code of the response.
            response_body: Response body as a dictionary.
        """
        request_hash = self._compute_request_hash(body, path, method)
        self._store[idempotency_key] = IdempotencyEntry(
            request_hash=request_hash,
            response_status=response_status,
            response_body=response_body,
            created_at=time.time(),
        )

    def clear(self) -> None:
        """Clear all entries from the store (useful for testing)."""
        self._store.clear()


# Global singleton instance
_idempotency_store: IdempotencyStore | None = None


def get_idempotency_store() -> IdempotencyStore:
    """Get the global idempotency store instance.

    Returns:
        The singleton IdempotencyStore instance.
    """
    global _idempotency_store
    if _idempotency_store is None:
        _idempotency_store = IdempotencyStore()
    return _idempotency_store


def reset_idempotency_store() -> None:
    """Reset the idempotency store (for testing)."""
    global _idempotency_store
    if _idempotency_store is not None:
        _idempotency_store.clear()
