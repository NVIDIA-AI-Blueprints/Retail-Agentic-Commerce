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

"""Pydantic schemas for metrics dashboard endpoints."""

from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class DashboardTimeRange(StrEnum):
    """Supported metrics dashboard time ranges."""

    ONE_HOUR = "1h"
    TWENTY_FOUR_HOURS = "24h"
    SEVEN_DAYS = "7d"
    THIRTY_DAYS = "30d"


class KPIFormat(StrEnum):
    """Supported KPI display formats."""

    CURRENCY = "currency"
    NUMBER = "number"
    PERCENT = "percent"
    DURATION = "duration"


class KPITrend(StrEnum):
    """KPI trend direction."""

    UP = "up"
    DOWN = "down"
    NEUTRAL = "neutral"


class DashboardKPI(BaseModel):
    """Single KPI for the metrics dashboard."""

    model_config = ConfigDict(extra="forbid")

    id: str
    label: str
    value: float
    previous_value: float = Field(default=0)
    format: KPIFormat
    trend: KPITrend = KPITrend.NEUTRAL
    trend_value: float = Field(default=0)


class DashboardRevenuePoint(BaseModel):
    """Revenue timeseries point."""

    model_config = ConfigDict(extra="forbid")

    timestamp: str
    revenue: int
    orders: int


class DashboardPromotionBreakdown(BaseModel):
    """Promotion action breakdown."""

    model_config = ConfigDict(extra="forbid")

    type: str
    label: str
    count: int
    total_savings: int


class DashboardAgentType(StrEnum):
    """Agent identifiers shown in the metrics dashboard."""

    PROMOTION = "promotion"
    RECOMMENDATION = "recommendation"
    POST_PURCHASE = "post_purchase"
    SEARCH = "search"


class AgentOutcomeChannel(StrEnum):
    """Supported invocation channels."""

    ACP = "acp"
    APPS_SDK = "apps_sdk"
    UCP = "ucp"


class AgentOutcomeStatus(StrEnum):
    """Normalized invocation status."""

    SUCCESS = "success"
    FALLBACK_SUCCESS = "fallback_success"
    ERROR_TIMEOUT = "error_timeout"
    ERROR_UPSTREAM = "error_upstream"
    ERROR_VALIDATION = "error_validation"
    ERROR_INTERNAL = "error_internal"


class DashboardAgentOutcome(BaseModel):
    """Application-layer agent outcome summary."""

    model_config = ConfigDict(extra="forbid")

    agent_type: DashboardAgentType
    total_calls: int
    errors: int
    success_rate: float | None = None
    source: str = Field(
        default="application",
        description="application when calculated from merchant outcomes, unavailable otherwise",
    )


class RecordAgentOutcomeRequest(BaseModel):
    """Request payload for recording agent invocation outcomes."""

    model_config = ConfigDict(extra="forbid")

    agent_type: DashboardAgentType
    channel: AgentOutcomeChannel = AgentOutcomeChannel.ACP
    status: AgentOutcomeStatus
    latency_ms: int = Field(default=0, ge=0)
    request_id: str | None = None
    session_id: str | None = None
    error_code: str | None = None


class RecordAgentOutcomeResponse(BaseModel):
    """Response payload for outcome recording."""

    model_config = ConfigDict(extra="forbid")

    recorded: bool


class RecommendationAttributionEventType(StrEnum):
    """Recommendation funnel event type."""

    IMPRESSION = "impression"
    CLICK = "click"
    PURCHASE = "purchase"


class RecordRecommendationAttributionRequest(BaseModel):
    """Request payload for recommendation attribution events."""

    model_config = ConfigDict(extra="forbid")

    event_type: RecommendationAttributionEventType
    product_id: str
    session_id: str | None = None
    recommendation_request_id: str | None = None
    position: int | None = None
    order_id: str | None = None
    quantity: int = Field(default=1, ge=1)
    revenue_cents: int = Field(default=0, ge=0)
    source: str = Field(default="apps_sdk")


class RecordRecommendationAttributionResponse(BaseModel):
    """Response payload for attribution event recording."""

    model_config = ConfigDict(extra="forbid")

    recorded: bool


class DashboardRecommendationTopProduct(BaseModel):
    """Top converting recommended product row."""

    model_config = ConfigDict(extra="forbid")

    product_id: str
    product_name: str
    clicks: int
    purchases: int
    conversion_rate: float | None = None
    attributed_revenue: int


class DashboardRecommendationAttribution(BaseModel):
    """Recommendation attribution funnel metrics."""

    model_config = ConfigDict(extra="forbid")

    impressions: int
    clicks: int
    purchases: int
    click_through_rate: float | None = None
    conversion_rate: float | None = None
    attributed_revenue: int
    top_products: list[DashboardRecommendationTopProduct]


class DashboardProductHealth(BaseModel):
    """Product health row for the metrics table."""

    model_config = ConfigDict(extra="forbid")

    id: str
    name: str
    sku: str
    stock_level: int
    stock_status: str
    base_price: int
    competitor_price: int | None = None
    price_position: str
    lifecycle: str
    demand_velocity: str
    needs_attention: bool
    attention_reason: str | None = None


class DashboardEffectiveWindow(BaseModel):
    """Effective time window used for metrics aggregation."""

    model_config = ConfigDict(extra="forbid")

    requested_time_range: DashboardTimeRange
    start: str
    end: str
    fallback_applied: bool


class DashboardMetricsResponse(BaseModel):
    """Metrics dashboard response."""

    model_config = ConfigDict(extra="forbid")

    effective_window: DashboardEffectiveWindow
    kpis: list[DashboardKPI]
    revenue_data: list[DashboardRevenuePoint]
    agent_outcomes: list[DashboardAgentOutcome]
    recommendation_attribution: DashboardRecommendationAttribution
    promotion_breakdown: list[DashboardPromotionBreakdown]
    product_health: list[DashboardProductHealth]
