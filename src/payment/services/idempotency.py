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

"""Database-backed idempotency service for PSP endpoints."""

import hashlib
import json
from dataclasses import dataclass
from typing import Any

from sqlmodel import Session, select

from src.payment.db.models import IdempotencyRecord


@dataclass
class IdempotencyResult:
    """Result of an idempotency check."""

    is_cached: bool
    is_conflict: bool
    cached_status: int | None = None
    cached_body: dict[str, Any] | None = None


def compute_request_hash(method: str, path: str, body: dict[str, Any]) -> str:
    """Compute SHA-256 hash of the request.

    Args:
        method: HTTP method (e.g., "POST")
        path: Request path (e.g., "/agentic_commerce/delegate_payment")
        body: Request body as a dictionary

    Returns:
        SHA-256 hash of the request signature
    """
    # Sort keys for consistent hashing
    body_json = json.dumps(body, sort_keys=True, default=str)
    signature = f"{method}:{path}:{body_json}"
    return hashlib.sha256(signature.encode()).hexdigest()


def check_idempotency(
    db: Session, idempotency_key: str, request_hash: str
) -> IdempotencyResult:
    """Check if a request with the given idempotency key exists.

    Args:
        db: Database session
        idempotency_key: The idempotency key from the request header
        request_hash: Hash of the current request

    Returns:
        IdempotencyResult indicating whether the response is cached or conflicting
    """
    statement = select(IdempotencyRecord).where(
        IdempotencyRecord.idempotency_key == idempotency_key
    )
    record = db.exec(statement).first()

    if record is None:
        return IdempotencyResult(is_cached=False, is_conflict=False)

    # Same key but different request = conflict
    if record.request_hash != request_hash:
        return IdempotencyResult(is_cached=False, is_conflict=True)

    # Same key and same request = return cached response
    return IdempotencyResult(
        is_cached=True,
        is_conflict=False,
        cached_status=record.response_status,
        cached_body=json.loads(record.response_body_json),
    )


def store_idempotency_response(
    db: Session,
    idempotency_key: str,
    request_hash: str,
    response_status: int,
    response_body: dict[str, Any],
) -> None:
    """Store a response for idempotency replay.

    Args:
        db: Database session
        idempotency_key: The idempotency key from the request header
        request_hash: Hash of the request
        response_status: HTTP status code of the response
        response_body: Response body as a dictionary
    """
    record = IdempotencyRecord(
        idempotency_key=idempotency_key,
        request_hash=request_hash,
        response_status=response_status,
        response_body_json=json.dumps(response_body, default=str),
    )
    db.add(record)
    db.commit()


def clear_idempotency_store(db: Session) -> None:
    """Clear all idempotency records. Useful for testing.

    Args:
        db: Database session
    """
    statement = select(IdempotencyRecord)
    records = db.exec(statement).all()
    for record in records:
        db.delete(record)
    db.commit()
