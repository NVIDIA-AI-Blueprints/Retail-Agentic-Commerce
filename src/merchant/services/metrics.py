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

"""Service layer for dashboard metrics aggregation."""

from __future__ import annotations

import json
from collections import defaultdict
from datetime import UTC, datetime, timedelta
from typing import Any, cast

from sqlmodel import Session, select

from src.merchant.api.metrics_schemas import DashboardTimeRange
from src.merchant.db.models import CheckoutSession, CompetitorPrice, Product
from src.merchant.services.agent_outcomes import summarize_agent_outcomes
from src.merchant.services.recommendation_attribution import (
    summarize_recommendation_attribution,
)

_TIME_RANGE_TO_DURATION: dict[DashboardTimeRange, timedelta] = {
    DashboardTimeRange.ONE_HOUR: timedelta(hours=1),
    DashboardTimeRange.TWENTY_FOUR_HOURS: timedelta(hours=24),
    DashboardTimeRange.SEVEN_DAYS: timedelta(days=7),
    DashboardTimeRange.THIRTY_DAYS: timedelta(days=30),
}

_TIME_RANGE_TO_INTERVAL: dict[DashboardTimeRange, timedelta] = {
    DashboardTimeRange.ONE_HOUR: timedelta(minutes=5),
    DashboardTimeRange.TWENTY_FOUR_HOURS: timedelta(hours=1),
    DashboardTimeRange.SEVEN_DAYS: timedelta(days=1),
    DashboardTimeRange.THIRTY_DAYS: timedelta(days=1),
}

_PROMO_LABELS: dict[str, str] = {
    "DISCOUNT_5_PCT": "5% Discount",
    "DISCOUNT_10_PCT": "10% Discount",
    "DISCOUNT_15_PCT": "15% Discount",
    "DISCOUNT_20_PCT": "20% Discount",
    "NO_PROMO": "No Promotion",
}

_PROMOTION_FAILURE_MARKERS = (
    "agent unavailable",
    "failed to connect",
    "timed out",
    "timeout",
    "unexpected error",
    "error:",
)


def get_dashboard_metrics(
    db: Session, time_range: DashboardTimeRange
) -> dict[str, Any]:
    """Build metrics dashboard aggregates for the requested time range."""
    now = datetime.now(UTC)
    duration = _TIME_RANGE_TO_DURATION[time_range]
    interval = _TIME_RANGE_TO_INTERVAL[time_range]
    requested_start = now - duration
    requested_end = now

    sessions = list(db.exec(select(CheckoutSession)).all())
    products = list(db.exec(select(Product)).all())
    competitor_prices = list(db.exec(select(CompetitorPrice)).all())

    window_start, window_end, fallback_applied = _resolve_effective_window(
        sessions=sessions,
        now=now,
        duration=duration,
    )

    previous_start = window_start - duration
    previous_end = window_start

    current_sessions = _sessions_in_window(sessions, window_start, window_end)
    previous_sessions = _sessions_in_window(sessions, previous_start, previous_end)

    current_completed = [s for s in current_sessions if _is_completed_status(s.status)]
    previous_completed = [
        s for s in previous_sessions if _is_completed_status(s.status)
    ]

    revenue = _sum_revenue(current_completed)
    previous_revenue = _sum_revenue(previous_completed)
    orders = len(current_completed)
    previous_orders = len(previous_completed)
    conversion = _calculate_conversion_rate(current_sessions, current_completed)
    previous_conversion = _calculate_conversion_rate(
        previous_sessions, previous_completed
    )
    aov = (revenue / orders) if orders > 0 else 0.0
    previous_aov = (previous_revenue / previous_orders) if previous_orders > 0 else 0.0

    # Agent outcomes should reflect the user-selected window even when KPI
    # revenue falls back to the latest completed-checkout window.
    outcome_window_start = requested_start
    outcome_window_end = requested_end
    outcome_sessions = _sessions_in_window(
        sessions, outcome_window_start, outcome_window_end
    )

    aggregated_outcomes = summarize_agent_outcomes(
        db,
        start=outcome_window_start,
        end=outcome_window_end,
    )
    aggregated_outcomes = _merge_with_legacy_promotion_outcomes(
        aggregated_outcomes=aggregated_outcomes,
        sessions=outcome_sessions,
    )
    recommendation_attribution = summarize_recommendation_attribution(
        db,
        start=requested_start,
        end=requested_end,
    )

    return {
        "effective_window": {
            "requested_time_range": time_range.value,
            "start": window_start.isoformat(),
            "end": window_end.isoformat(),
            "fallback_applied": fallback_applied,
        },
        "kpis": [
            _build_kpi(
                kpi_id="revenue",
                label="Revenue",
                value=float(revenue),
                previous_value=float(previous_revenue),
                value_format="currency",
            ),
            _build_kpi(
                kpi_id="orders",
                label="Orders",
                value=float(orders),
                previous_value=float(previous_orders),
                value_format="number",
            ),
            _build_kpi(
                kpi_id="conversion",
                label="Conv. Rate",
                value=float(conversion),
                previous_value=float(previous_conversion),
                value_format="percent",
            ),
            _build_kpi(
                kpi_id="aov",
                label="Avg Order",
                value=float(round(aov)),
                previous_value=float(round(previous_aov)),
                value_format="currency",
            ),
        ],
        "revenue_data": _build_revenue_series(
            sessions=current_completed,
            start=window_start,
            end=window_end,
            interval=interval,
        ),
        "agent_outcomes": aggregated_outcomes,
        "recommendation_attribution": recommendation_attribution,
        "promotion_breakdown": _build_promotion_breakdown(current_completed),
        "product_health": _build_product_health(products, competitor_prices),
    }


def _to_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=UTC)
    return dt.astimezone(UTC)


def _is_completed_status(status: Any) -> bool:
    status_value = str(status.value) if hasattr(status, "value") else str(status)
    return status_value.lower() == "completed"


def _sessions_in_window(
    sessions: list[CheckoutSession], start: datetime, end: datetime
) -> list[CheckoutSession]:
    result: list[CheckoutSession] = []
    for session in sessions:
        updated_at = _to_utc(session.updated_at)
        if start <= updated_at < end:
            result.append(session)
    return result


def _resolve_effective_window(
    sessions: list[CheckoutSession], now: datetime, duration: timedelta
) -> tuple[datetime, datetime, bool]:
    requested_end = now
    requested_start = requested_end - duration
    requested_sessions = _sessions_in_window(sessions, requested_start, requested_end)

    if any(_is_completed_status(s.status) for s in requested_sessions):
        return requested_start, requested_end, False

    max_lookback = timedelta(days=90)
    max_steps = max(1, int(max_lookback / duration))

    for step in range(1, max_steps + 1):
        candidate_end = requested_start - (duration * (step - 1))
        candidate_start = candidate_end - duration
        candidate_sessions = _sessions_in_window(
            sessions, candidate_start, candidate_end
        )
        if any(_is_completed_status(s.status) for s in candidate_sessions):
            return candidate_start, candidate_end, True

    return requested_start, requested_end, False


def _extract_total_amount(totals_json: str) -> int:
    try:
        parsed = json.loads(totals_json)
    except json.JSONDecodeError:
        return 0

    if isinstance(parsed, list):
        parsed_list = cast(list[Any], parsed)
        for raw_total_line in parsed_list:
            if not isinstance(raw_total_line, dict):
                continue
            total_line = cast(dict[str, Any], raw_total_line)
            total_type = total_line.get("type")
            amount = total_line.get("amount")
            if str(total_type).lower() == "total" and isinstance(amount, (int, float)):
                return int(amount)
        return 0

    if isinstance(parsed, dict):
        parsed_dict = cast(dict[str, Any], parsed)
        amount = parsed_dict.get("total")
        if isinstance(amount, (int, float)):
            return int(amount)

    return 0


def _sum_revenue(sessions: list[CheckoutSession]) -> int:
    return sum(_extract_total_amount(session.totals_json) for session in sessions)


def _calculate_conversion_rate(
    all_sessions: list[CheckoutSession], completed_sessions: list[CheckoutSession]
) -> float:
    if not all_sessions:
        return 0.0
    return round((len(completed_sessions) / len(all_sessions)) * 100, 2)


def _trend(current: float, previous: float) -> tuple[str, float]:
    if previous <= 0:
        return "neutral", 0.0
    delta_percent = ((current - previous) / previous) * 100
    rounded = round(delta_percent, 1)
    if abs(rounded) < 0.1:
        return "neutral", 0.0
    return ("up" if rounded > 0 else "down"), rounded


def _build_kpi(
    kpi_id: str,
    label: str,
    value: float,
    previous_value: float,
    value_format: str,
) -> dict[str, Any]:
    trend_direction, trend_value = _trend(value, previous_value)
    return {
        "id": kpi_id,
        "label": label,
        "value": value,
        "previous_value": previous_value,
        "format": value_format,
        "trend": trend_direction,
        "trend_value": trend_value,
    }


def _build_revenue_series(
    sessions: list[CheckoutSession],
    start: datetime,
    end: datetime,
    interval: timedelta,
) -> list[dict[str, Any]]:
    bucket_count = int((end - start) / interval)
    if bucket_count <= 0:
        return []

    buckets: list[dict[str, Any]] = []
    for i in range(bucket_count):
        bucket_start = start + (interval * i)
        buckets.append(
            {
                "timestamp": bucket_start.isoformat(),
                "revenue": 0,
                "orders": 0,
            }
        )

    for session in sessions:
        session_time = _to_utc(session.updated_at)
        if session_time < start or session_time >= end:
            continue

        bucket_index = int((session_time - start) / interval)
        if 0 <= bucket_index < bucket_count:
            buckets[bucket_index]["orders"] += 1
            buckets[bucket_index]["revenue"] += _extract_total_amount(
                session.totals_json
            )

    return buckets


def _extract_line_items(line_items_json: str) -> list[dict[str, Any]]:
    try:
        parsed = json.loads(line_items_json)
    except json.JSONDecodeError:
        return []
    if isinstance(parsed, list):
        items: list[dict[str, Any]] = []
        parsed_list = cast(list[Any], parsed)
        for raw_item in parsed_list:
            if isinstance(raw_item, dict):
                items.append(cast(dict[str, Any], raw_item))
        return items
    return []


def _build_promotion_breakdown(sessions: list[CheckoutSession]) -> list[dict[str, Any]]:
    counts: defaultdict[str, int] = defaultdict(int)
    savings: defaultdict[str, int] = defaultdict(int)

    for session in sessions:
        for item in _extract_line_items(session.line_items_json):
            promotion = item.get("promotion")
            action = "NO_PROMO"
            if isinstance(promotion, dict):
                promotion_dict = cast(dict[str, Any], promotion)
                action = str(promotion_dict.get("action", "NO_PROMO"))
            counts[action] += 1
            if isinstance(item.get("discount"), (int, float)):
                savings[action] += int(item["discount"])

    if not counts:
        counts["NO_PROMO"] = 0
        savings["NO_PROMO"] = 0

    ordered_actions = sorted(
        counts.keys(), key=lambda action: (action == "NO_PROMO", action)
    )
    return [
        {
            "type": action,
            "label": _PROMO_LABELS.get(action, action.replace("_", " ").title()),
            "count": counts[action],
            "total_savings": savings[action],
        }
        for action in ordered_actions
    ]


def _success_rate(total_calls: int, errors: int) -> float | None:
    if total_calls <= 0:
        return None
    successes = total_calls - errors
    return round((successes / total_calls) * 100, 1)


def _is_promotion_failure(promotion: dict[str, Any]) -> bool:
    reasoning = str(promotion.get("reasoning", "")).lower()
    if any(marker in reasoning for marker in _PROMOTION_FAILURE_MARKERS):
        return True

    reason_codes = promotion.get("reason_codes")
    if isinstance(reason_codes, list):
        reason_codes_list = cast(list[Any], reason_codes)
        for code in reason_codes_list:
            text = str(code).upper()
            if "ERROR" in text or "TIMEOUT" in text:
                return True

    return False


def _build_agent_outcomes(sessions: list[CheckoutSession]) -> list[dict[str, Any]]:
    promotion_calls = 0
    promotion_errors = 0

    for session in sessions:
        for item in _extract_line_items(session.line_items_json):
            promotion = item.get("promotion")
            if not isinstance(promotion, dict):
                continue
            promotion_dict = cast(dict[str, Any], promotion)
            promotion_calls += 1
            if _is_promotion_failure(promotion_dict):
                promotion_errors += 1

    outcomes: list[dict[str, Any]] = [
        {
            "agent_type": "promotion",
            "total_calls": promotion_calls,
            "errors": promotion_errors,
            "success_rate": _success_rate(promotion_calls, promotion_errors),
            "source": "application",
        },
        {
            "agent_type": "recommendation",
            "total_calls": 0,
            "errors": 0,
            "success_rate": None,
            "source": "unavailable",
        },
        {
            "agent_type": "post_purchase",
            "total_calls": 0,
            "errors": 0,
            "success_rate": None,
            "source": "unavailable",
        },
        {
            "agent_type": "search",
            "total_calls": 0,
            "errors": 0,
            "success_rate": None,
            "source": "unavailable",
        },
    ]

    return outcomes


def _merge_with_legacy_promotion_outcomes(
    aggregated_outcomes: list[dict[str, Any]],
    sessions: list[CheckoutSession],
) -> list[dict[str, Any]]:
    """Backfill promotion outcome from checkout line-item metadata when needed."""
    promotion_index = next(
        (
            idx
            for idx, item in enumerate(aggregated_outcomes)
            if item.get("agent_type") == "promotion"
        ),
        None,
    )
    if promotion_index is None:
        return aggregated_outcomes

    promotion_outcome = aggregated_outcomes[promotion_index]
    if int(promotion_outcome.get("total_calls", 0)) > 0:
        return aggregated_outcomes

    legacy = _build_agent_outcomes(sessions)[0]
    if int(legacy.get("total_calls", 0)) <= 0:
        return aggregated_outcomes

    merged = list(aggregated_outcomes)
    merged[promotion_index] = legacy
    return merged


def _stock_status(stock_count: int) -> str:
    if stock_count <= 10:
        return "critical"
    if stock_count <= 30:
        return "low"
    return "healthy"


def _price_position(base_price: int, competitor_price: int | None) -> str:
    if competitor_price is None:
        return "unknown"
    if base_price > competitor_price:
        return "above"
    if base_price < competitor_price:
        return "below"
    return "at"


def _attention_reason(stock_status: str, price_position: str) -> str | None:
    if stock_status == "critical":
        return "Critical stock"
    if stock_status == "low":
        return "Low stock"
    if price_position == "above":
        return "Above market price"
    return None


def _build_product_health(
    products: list[Product], competitor_prices: list[CompetitorPrice]
) -> list[dict[str, Any]]:
    lowest_competitor: dict[str, int] = {}
    for competitor in competitor_prices:
        existing = lowest_competitor.get(competitor.product_id)
        if existing is None or competitor.price < existing:
            lowest_competitor[competitor.product_id] = competitor.price

    data: list[dict[str, Any]] = []
    for product in sorted(products, key=lambda p: p.id):
        competitor_price = lowest_competitor.get(product.id)
        stock_status = _stock_status(product.stock_count)
        price_position = _price_position(product.base_price, competitor_price)
        reason = _attention_reason(stock_status, price_position)
        data.append(
            {
                "id": product.id,
                "name": product.name,
                "sku": product.sku,
                "stock_level": product.stock_count,
                "stock_status": stock_status,
                "base_price": product.base_price,
                "competitor_price": competitor_price,
                "price_position": price_position,
                "lifecycle": product.lifecycle,
                "demand_velocity": product.demand_velocity,
                "needs_attention": reason is not None,
                "attention_reason": reason,
            }
        )

    return data
