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

"""Service helpers for recommendation attribution events and aggregates."""

from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import Any

from sqlmodel import Session, select

from src.merchant.db.database import get_engine
from src.merchant.db.models import (
    Product,
    RecommendationAttributionEvent,
    RecommendationAttributionEventType,
)

logger = logging.getLogger(__name__)


def _to_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=UTC)
    return dt.astimezone(UTC)


def _normalize_event_type(event_type: str) -> RecommendationAttributionEventType:
    try:
        return RecommendationAttributionEventType(event_type)
    except ValueError:
        return RecommendationAttributionEventType.IMPRESSION


def _insert_event(
    db: Session,
    *,
    event_type: str,
    session_id: str | None,
    recommendation_request_id: str | None,
    product_id: str,
    position: int | None,
    order_id: str | None,
    quantity: int,
    revenue_cents: int,
    source: str,
    auto_commit: bool,
) -> None:
    event = RecommendationAttributionEvent(
        event_type=_normalize_event_type(event_type),
        session_id=session_id,
        recommendation_request_id=recommendation_request_id,
        product_id=product_id,
        position=position,
        order_id=order_id,
        quantity=max(quantity, 1),
        revenue_cents=max(revenue_cents, 0),
        source=source,
    )
    db.add(event)
    if auto_commit:
        db.commit()
    else:
        db.flush()


def record_recommendation_attribution_event(
    *,
    event_type: str,
    product_id: str,
    session_id: str | None = None,
    recommendation_request_id: str | None = None,
    position: int | None = None,
    order_id: str | None = None,
    quantity: int = 1,
    revenue_cents: int = 0,
    source: str = "apps_sdk",
    db: Session | None = None,
    auto_commit: bool = True,
) -> bool:
    """Persist one recommendation attribution event.

    Returns True if persisted successfully, False otherwise.
    """
    try:
        if db is None:
            with Session(get_engine()) as local_db:
                _insert_event(
                    local_db,
                    event_type=event_type,
                    session_id=session_id,
                    recommendation_request_id=recommendation_request_id,
                    product_id=product_id,
                    position=position,
                    order_id=order_id,
                    quantity=quantity,
                    revenue_cents=revenue_cents,
                    source=source,
                    auto_commit=True,
                )
        else:
            _insert_event(
                db,
                event_type=event_type,
                session_id=session_id,
                recommendation_request_id=recommendation_request_id,
                product_id=product_id,
                position=position,
                order_id=order_id,
                quantity=quantity,
                revenue_cents=revenue_cents,
                source=source,
                auto_commit=auto_commit,
            )
    except Exception as exc:
        if db is not None:
            db.rollback()
        logger.warning("Failed to persist recommendation attribution event: %s", exc)
        return False

    return True


def summarize_recommendation_attribution(
    db: Session,
    *,
    start: datetime,
    end: datetime,
    top_limit: int = 5,
) -> dict[str, Any]:
    """Build recommendation attribution funnel + top converting products."""
    rows = db.exec(
        select(RecommendationAttributionEvent).where(
            RecommendationAttributionEvent.timestamp >= _to_utc(start),
            RecommendationAttributionEvent.timestamp < _to_utc(end),
        )
    ).all()
    rows = sorted(rows, key=lambda row: (row.timestamp, row.id or 0))

    impressions = 0
    clicks = 0
    attributed_purchases = 0
    attributed_revenue = 0

    click_keys_by_session_and_request: set[tuple[str | None, str, str | None]] = set()
    click_keys_by_request: set[tuple[str, str]] = set()
    click_keys_by_session: set[tuple[str | None, str]] = set()
    product_clicks: dict[str, int] = {}
    product_purchases: dict[str, int] = {}
    product_revenue: dict[str, int] = {}

    for row in rows:
        event_type = row.event_type
        product_id = row.product_id
        key_session_request = (
            row.session_id,
            product_id,
            row.recommendation_request_id,
        )
        key_request = (
            (row.recommendation_request_id, product_id)
            if row.recommendation_request_id
            else None
        )
        key_session = (row.session_id, product_id)

        if event_type == RecommendationAttributionEventType.IMPRESSION:
            impressions += 1
            continue

        if event_type == RecommendationAttributionEventType.CLICK:
            clicks += 1
            click_keys_by_session_and_request.add(key_session_request)
            click_keys_by_session.add(key_session)
            if key_request is not None:
                click_keys_by_request.add(key_request)
            product_clicks[product_id] = product_clicks.get(product_id, 0) + 1
            continue

        if event_type != RecommendationAttributionEventType.PURCHASE:
            continue

        # Purchase attribution requires a prior click signal for the same
        # recommendation request + product pair (primary), then falls back to
        # session + product matching when request id is unavailable.
        has_click = key_session_request in click_keys_by_session_and_request
        if not has_click and key_request is not None:
            has_click = key_request in click_keys_by_request
        if not has_click:
            has_click = key_session in click_keys_by_session
        if not has_click:
            continue

        attributed_purchases += 1
        attributed_revenue += max(row.revenue_cents, 0)
        product_purchases[product_id] = product_purchases.get(product_id, 0) + 1
        product_revenue[product_id] = product_revenue.get(product_id, 0) + max(
            row.revenue_cents, 0
        )

    ctr = round((clicks / impressions) * 100, 1) if impressions > 0 else None
    conversion_rate = (
        round((attributed_purchases / clicks) * 100, 1) if clicks > 0 else None
    )

    products = db.exec(select(Product)).all()
    names_by_id = {product.id: product.name for product in products}

    top_products: list[dict[str, Any]] = []
    for product_id, click_count in product_clicks.items():
        purchase_count = product_purchases.get(product_id, 0)
        revenue_cents = product_revenue.get(product_id, 0)
        product_conversion = (
            round((purchase_count / click_count) * 100, 1) if click_count > 0 else None
        )
        top_products.append(
            {
                "product_id": product_id,
                "product_name": names_by_id.get(product_id, product_id),
                "clicks": click_count,
                "purchases": purchase_count,
                "conversion_rate": product_conversion,
                "attributed_revenue": revenue_cents,
            }
        )

    top_products.sort(
        key=lambda item: (
            int(item["purchases"]),
            int(item["attributed_revenue"]),
            int(item["clicks"]),
        ),
        reverse=True,
    )

    return {
        "impressions": impressions,
        "clicks": clicks,
        "purchases": attributed_purchases,
        "click_through_rate": ctr,
        "conversion_rate": conversion_rate,
        "attributed_revenue": attributed_revenue,
        "top_products": top_products[:top_limit],
    }
