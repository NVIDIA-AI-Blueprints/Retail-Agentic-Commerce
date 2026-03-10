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

"""Service helpers for recording and aggregating agent invocation outcomes."""

from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import Any

from sqlmodel import Session, select

from src.merchant.db.database import get_engine
from src.merchant.db.models import (
    AgentInvocationChannel,
    AgentInvocationOutcome,
    AgentInvocationStatus,
)
from src.merchant.middleware.logging import get_request_id

logger = logging.getLogger(__name__)

AGENT_TYPES: tuple[str, ...] = (
    "promotion",
    "recommendation",
    "post_purchase",
    "search",
)


def _to_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=UTC)
    return dt.astimezone(UTC)


def _normalize_status(status: str) -> AgentInvocationStatus:
    try:
        return AgentInvocationStatus(status)
    except ValueError:
        return AgentInvocationStatus.ERROR_INTERNAL


def _normalize_channel(channel: str) -> AgentInvocationChannel:
    try:
        return AgentInvocationChannel(channel)
    except ValueError:
        return AgentInvocationChannel.ACP


def _insert_outcome(
    db: Session,
    *,
    agent_type: str,
    channel: str,
    status: str,
    latency_ms: int,
    request_id: str | None,
    session_id: str | None,
    error_code: str | None,
    auto_commit: bool,
) -> None:
    outcome = AgentInvocationOutcome(
        agent_type=agent_type,
        channel=_normalize_channel(channel),
        status=_normalize_status(status),
        latency_ms=max(latency_ms, 0),
        request_id=request_id,
        session_id=session_id,
        error_code=error_code,
    )
    db.add(outcome)
    if auto_commit:
        db.commit()
    else:
        db.flush()


def record_agent_outcome(
    *,
    agent_type: str,
    channel: str,
    status: str,
    latency_ms: int,
    request_id: str | None = None,
    session_id: str | None = None,
    error_code: str | None = None,
    db: Session | None = None,
    auto_commit: bool = True,
) -> bool:
    """Record a single agent invocation outcome.

    Returns True if the outcome was persisted, False when best-effort recording fails.
    """
    effective_request_id = (
        request_id if request_id is not None else get_request_id() or None
    )

    try:
        if db is None:
            with Session(get_engine()) as local_db:
                _insert_outcome(
                    local_db,
                    agent_type=agent_type,
                    channel=channel,
                    status=status,
                    latency_ms=latency_ms,
                    request_id=effective_request_id,
                    session_id=session_id,
                    error_code=error_code,
                    auto_commit=True,
                )
        else:
            _insert_outcome(
                db,
                agent_type=agent_type,
                channel=channel,
                status=status,
                latency_ms=latency_ms,
                request_id=effective_request_id,
                session_id=session_id,
                error_code=error_code,
                auto_commit=auto_commit,
            )
    except Exception as exc:
        if db is not None:
            db.rollback()
        logger.warning("Failed to persist agent outcome (%s): %s", agent_type, exc)
        return False

    return True


def summarize_agent_outcomes(
    db: Session, *, start: datetime, end: datetime
) -> list[dict[str, Any]]:
    """Summarize invocation outcomes for dashboard consumption."""
    rows = db.exec(
        select(AgentInvocationOutcome).where(
            AgentInvocationOutcome.timestamp >= _to_utc(start),
            AgentInvocationOutcome.timestamp < _to_utc(end),
        )
    ).all()

    aggregates: dict[str, dict[str, Any]] = {
        agent_type: {
            "agent_type": agent_type,
            "total_calls": 0,
            "errors": 0,
            "success_rate": None,
            "source": "unavailable",
        }
        for agent_type in AGENT_TYPES
    }

    for row in rows:
        agent_type = str(row.agent_type)
        if agent_type not in aggregates:
            continue
        aggregate = aggregates[agent_type]
        aggregate["total_calls"] += 1
        status_value = str(
            row.status.value if hasattr(row.status, "value") else row.status
        )
        if status_value.startswith("error"):
            aggregate["errors"] += 1

    ordered: list[dict[str, Any]] = []
    for agent_type in AGENT_TYPES:
        aggregate = aggregates[agent_type]
        total_calls = int(aggregate["total_calls"])
        errors = int(aggregate["errors"])
        if total_calls > 0:
            aggregate["success_rate"] = round(
                ((total_calls - errors) / total_calls) * 100, 1
            )
            aggregate["source"] = "application"
        ordered.append(aggregate)

    return ordered
