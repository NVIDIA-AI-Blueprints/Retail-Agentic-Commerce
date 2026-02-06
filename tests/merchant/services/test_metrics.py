"""Tests for metrics aggregation service."""

import json
from datetime import UTC, datetime, timedelta

from sqlalchemy.engine import Engine
from sqlmodel import Session, SQLModel, create_engine

from src.merchant.api.metrics_schemas import DashboardTimeRange
from src.merchant.db.models import (
    AgentInvocationChannel,
    AgentInvocationOutcome,
    AgentInvocationStatus,
    CheckoutSession,
    CheckoutStatus,
    CompetitorPrice,
    Product,
    RecommendationAttributionEvent,
    RecommendationAttributionEventType,
)
from src.merchant.services.metrics import get_dashboard_metrics


def _create_engine() -> tuple[Session, Engine]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
    )
    SQLModel.metadata.create_all(engine)
    session = Session(engine)
    return session, engine


def _totals_json(total: int) -> str:
    return (
        '[{"type":"items_base_amount","amount":1000},{"type":"subtotal","amount":1000},'
        f'{{"type":"total","amount":{total}}}]'
    )


def _line_items_json(action: str, discount: int, reasoning: str = "") -> str:
    return json.dumps(
        [
            {
                "id": "li_1",
                "item": {"id": "prod_1", "quantity": 1},
                "discount": discount,
                "promotion": {
                    "action": action,
                    "reasoning": reasoning,
                },
            }
        ]
    )


def _add_checkout(
    session: Session,
    *,
    status: CheckoutStatus,
    updated_at: datetime,
    total: int,
    action: str = "NO_PROMO",
    discount: int = 0,
    reasoning: str = "",
) -> None:
    checkout = CheckoutSession(
        id=f"checkout_{updated_at.timestamp()}_{status.value}",
        status=status,
        protocol="acp",
        currency="USD",
        totals_json=_totals_json(total),
        line_items_json=_line_items_json(action, discount, reasoning),
        updated_at=updated_at,
    )
    session.add(checkout)


def _seed_products(session: Session) -> None:
    session.add(
        Product(
            id="prod_1",
            sku="SKU-1",
            name="Product 1",
            base_price=3000,
            stock_count=5,
            min_margin=0.2,
            image_url="/prod_1.jpg",
        )
    )
    session.add(
        Product(
            id="prod_2",
            sku="SKU-2",
            name="Product 2",
            base_price=2000,
            stock_count=60,
            min_margin=0.2,
            image_url="/prod_2.jpg",
        )
    )
    session.add(
        Product(
            id="prod_3",
            sku="SKU-3",
            name="Product 3",
            base_price=1500,
            stock_count=25,
            min_margin=0.2,
            image_url="/prod_3.jpg",
        )
    )
    session.add_all(
        [
            CompetitorPrice(
                product_id="prod_1",
                retailer_name="Comp A",
                price=2500,
            ),
            CompetitorPrice(
                product_id="prod_2",
                retailer_name="Comp B",
                price=2200,
            ),
            CompetitorPrice(
                product_id="prod_3",
                retailer_name="Comp C",
                price=1500,
            ),
        ]
    )


def test_get_dashboard_metrics_returns_expected_kpis() -> None:
    """Returns KPI and chart data for a window with completed sessions."""
    session, engine = _create_engine()
    now = datetime.now(UTC)
    _seed_products(session)
    _add_checkout(
        session,
        status=CheckoutStatus.COMPLETED,
        updated_at=now - timedelta(hours=2),
        total=3200,
        action="DISCOUNT_10_PCT",
        discount=300,
    )
    _add_checkout(
        session,
        status=CheckoutStatus.NOT_READY_FOR_PAYMENT,
        updated_at=now - timedelta(hours=1),
        total=0,
    )
    session.commit()

    data = get_dashboard_metrics(session, DashboardTimeRange.SEVEN_DAYS)

    assert data["effective_window"]["fallback_applied"] is False
    assert len(data["kpis"]) == 4
    assert {k["id"] for k in data["kpis"]} == {"revenue", "orders", "conversion", "aov"}
    assert len(data["revenue_data"]) == 7
    assert len(data["agent_outcomes"]) == 4
    assert data["recommendation_attribution"]["impressions"] == 0
    assert data["recommendation_attribution"]["clicks"] == 0
    assert data["recommendation_attribution"]["purchases"] == 0
    promotion_outcome = next(
        outcome
        for outcome in data["agent_outcomes"]
        if outcome["agent_type"] == "promotion"
    )
    assert promotion_outcome["total_calls"] == 2
    assert promotion_outcome["errors"] == 0
    assert promotion_outcome["success_rate"] == 100.0
    assert len(data["promotion_breakdown"]) >= 1
    assert len(data["product_health"]) == 3

    session.close()
    engine.dispose()


def test_get_dashboard_metrics_falls_back_when_window_is_empty() -> None:
    """Falls back to the latest prior non-empty window for requested range."""
    session, engine = _create_engine()
    now = datetime.now(UTC)
    _seed_products(session)
    _add_checkout(
        session,
        status=CheckoutStatus.COMPLETED,
        updated_at=now - timedelta(days=2, hours=1),
        total=4500,
        action="DISCOUNT_5_PCT",
        discount=100,
    )
    session.commit()

    data = get_dashboard_metrics(session, DashboardTimeRange.TWENTY_FOUR_HOURS)

    assert data["effective_window"]["fallback_applied"] is True
    revenue_kpi = next(k for k in data["kpis"] if k["id"] == "revenue")
    assert revenue_kpi["value"] == 4500

    session.close()
    engine.dispose()


def test_get_dashboard_metrics_builds_promotion_breakdown_and_product_health() -> None:
    """Aggregates promotion actions and computes product health flags."""
    session, engine = _create_engine()
    now = datetime.now(UTC)
    _seed_products(session)
    _add_checkout(
        session,
        status=CheckoutStatus.COMPLETED,
        updated_at=now - timedelta(hours=3),
        total=5000,
        action="DISCOUNT_10_PCT",
        discount=500,
    )
    _add_checkout(
        session,
        status=CheckoutStatus.COMPLETED,
        updated_at=now - timedelta(hours=2),
        total=5100,
        action="NO_PROMO",
        discount=0,
    )
    session.commit()

    data = get_dashboard_metrics(session, DashboardTimeRange.SEVEN_DAYS)

    breakdown_by_type = {entry["type"]: entry for entry in data["promotion_breakdown"]}
    assert breakdown_by_type["DISCOUNT_10_PCT"]["count"] == 1
    assert breakdown_by_type["DISCOUNT_10_PCT"]["total_savings"] == 500
    assert breakdown_by_type["NO_PROMO"]["count"] == 1

    health_by_id = {entry["id"]: entry for entry in data["product_health"]}
    assert health_by_id["prod_1"]["stock_status"] == "critical"
    assert health_by_id["prod_1"]["price_position"] == "above"
    assert health_by_id["prod_1"]["needs_attention"] is True
    assert health_by_id["prod_2"]["stock_status"] == "healthy"
    assert health_by_id["prod_2"]["price_position"] == "below"
    assert health_by_id["prod_3"]["stock_status"] == "low"
    assert health_by_id["prod_3"]["price_position"] == "at"

    session.close()
    engine.dispose()


def test_get_dashboard_metrics_reports_promotion_application_failures() -> None:
    """Counts promotion fallback/error outcomes from merchant-side metadata."""
    session, engine = _create_engine()
    now = datetime.now(UTC)
    _seed_products(session)
    _add_checkout(
        session,
        status=CheckoutStatus.NOT_READY_FOR_PAYMENT,
        updated_at=now - timedelta(hours=2),
        total=0,
        action="NO_PROMO",
        discount=0,
        reasoning="Agent unavailable, no discount applied",
    )
    _add_checkout(
        session,
        status=CheckoutStatus.NOT_READY_FOR_PAYMENT,
        updated_at=now - timedelta(hours=1),
        total=0,
        action="DISCOUNT_10_PCT",
        discount=300,
        reasoning="High inventory and above market",
    )
    session.commit()

    data = get_dashboard_metrics(session, DashboardTimeRange.SEVEN_DAYS)

    promotion_outcome = next(
        outcome
        for outcome in data["agent_outcomes"]
        if outcome["agent_type"] == "promotion"
    )
    assert promotion_outcome["total_calls"] == 2
    assert promotion_outcome["errors"] == 1
    assert promotion_outcome["success_rate"] == 50.0

    recommendation_outcome = next(
        outcome
        for outcome in data["agent_outcomes"]
        if outcome["agent_type"] == "recommendation"
    )
    assert recommendation_outcome["source"] == "unavailable"
    assert recommendation_outcome["success_rate"] is None

    session.close()
    engine.dispose()


def test_get_dashboard_metrics_uses_recorded_agent_outcomes() -> None:
    """Uses persisted invocation outcomes for non-promotion agent metrics."""
    session, engine = _create_engine()
    now = datetime.now(UTC)
    _seed_products(session)
    _add_checkout(
        session,
        status=CheckoutStatus.COMPLETED,
        updated_at=now - timedelta(hours=1),
        total=3400,
    )
    session.add_all(
        [
            AgentInvocationOutcome(
                timestamp=now - timedelta(minutes=30),
                agent_type="recommendation",
                channel=AgentInvocationChannel.APPS_SDK,
                status=AgentInvocationStatus.SUCCESS,
                latency_ms=120,
            ),
            AgentInvocationOutcome(
                timestamp=now - timedelta(minutes=20),
                agent_type="recommendation",
                channel=AgentInvocationChannel.APPS_SDK,
                status=AgentInvocationStatus.ERROR_UPSTREAM,
                latency_ms=210,
                error_code="upstream_error",
            ),
            AgentInvocationOutcome(
                timestamp=now - timedelta(minutes=10),
                agent_type="search",
                channel=AgentInvocationChannel.APPS_SDK,
                status=AgentInvocationStatus.SUCCESS,
                latency_ms=98,
            ),
        ]
    )
    session.commit()

    data = get_dashboard_metrics(session, DashboardTimeRange.TWENTY_FOUR_HOURS)

    recommendation_outcome = next(
        outcome
        for outcome in data["agent_outcomes"]
        if outcome["agent_type"] == "recommendation"
    )
    assert recommendation_outcome["source"] == "application"
    assert recommendation_outcome["total_calls"] == 2
    assert recommendation_outcome["errors"] == 1
    assert recommendation_outcome["success_rate"] == 50.0

    search_outcome = next(
        outcome
        for outcome in data["agent_outcomes"]
        if outcome["agent_type"] == "search"
    )
    assert search_outcome["source"] == "application"
    assert search_outcome["total_calls"] == 1
    assert search_outcome["errors"] == 0
    assert search_outcome["success_rate"] == 100.0

    session.close()
    engine.dispose()


def test_get_dashboard_metrics_reports_recommendation_attribution_funnel() -> None:
    """Builds recommendation impressions/clicks/purchases attribution summary."""
    session, engine = _create_engine()
    now = datetime.now(UTC)
    _seed_products(session)
    _add_checkout(
        session,
        status=CheckoutStatus.COMPLETED,
        updated_at=now - timedelta(hours=3),
        total=6100,
    )
    session.add_all(
        [
            RecommendationAttributionEvent(
                timestamp=now - timedelta(hours=2),
                event_type=RecommendationAttributionEventType.IMPRESSION,
                session_id="cart_1",
                recommendation_request_id="rec_1",
                product_id="prod_2",
                position=1,
            ),
            RecommendationAttributionEvent(
                timestamp=now - timedelta(hours=2),
                event_type=RecommendationAttributionEventType.IMPRESSION,
                session_id="cart_1",
                recommendation_request_id="rec_1",
                product_id="prod_3",
                position=2,
            ),
            RecommendationAttributionEvent(
                timestamp=now - timedelta(hours=1, minutes=55),
                event_type=RecommendationAttributionEventType.CLICK,
                session_id="cart_1",
                recommendation_request_id="rec_1",
                product_id="prod_2",
                position=1,
            ),
            RecommendationAttributionEvent(
                timestamp=now - timedelta(hours=1, minutes=30),
                event_type=RecommendationAttributionEventType.PURCHASE,
                session_id="cart_1",
                recommendation_request_id="rec_1",
                product_id="prod_2",
                position=1,
                order_id="order_abc123",
                quantity=1,
                revenue_cents=2800,
            ),
        ]
    )
    session.commit()

    data = get_dashboard_metrics(session, DashboardTimeRange.TWENTY_FOUR_HOURS)
    attribution = data["recommendation_attribution"]

    assert attribution["impressions"] == 2
    assert attribution["clicks"] == 1
    assert attribution["purchases"] == 1
    assert attribution["click_through_rate"] == 50.0
    assert attribution["conversion_rate"] == 100.0
    assert attribution["attributed_revenue"] == 2800
    assert attribution["top_products"][0]["product_id"] == "prod_2"
    assert attribution["top_products"][0]["product_name"] == "Product 2"

    session.close()
    engine.dispose()


def test_recommendation_attribution_matches_purchase_by_request_id_without_click_session() -> (
    None
):
    """Attributes purchase when click and purchase share request_id/product but not session_id."""
    session, engine = _create_engine()
    now = datetime.now(UTC)
    _seed_products(session)
    _add_checkout(
        session,
        status=CheckoutStatus.COMPLETED,
        updated_at=now - timedelta(hours=2),
        total=5300,
    )
    session.add_all(
        [
            RecommendationAttributionEvent(
                timestamp=now - timedelta(hours=1, minutes=50),
                event_type=RecommendationAttributionEventType.CLICK,
                session_id=None,
                recommendation_request_id="rec_flow_1",
                product_id="prod_2",
                position=1,
            ),
            RecommendationAttributionEvent(
                timestamp=now - timedelta(hours=1, minutes=40),
                event_type=RecommendationAttributionEventType.PURCHASE,
                session_id="checkout_abc123",
                recommendation_request_id="rec_flow_1",
                product_id="prod_2",
                position=1,
                order_id="order_xyz",
                quantity=1,
                revenue_cents=2800,
            ),
        ]
    )
    session.commit()

    data = get_dashboard_metrics(session, DashboardTimeRange.TWENTY_FOUR_HOURS)
    attribution = data["recommendation_attribution"]

    assert attribution["clicks"] == 1
    assert attribution["purchases"] == 1
    assert attribution["conversion_rate"] == 100.0
    assert attribution["attributed_revenue"] == 2800

    session.close()
    engine.dispose()


def test_recommendation_attribution_uses_event_time_ordering() -> None:
    """Attribution should follow event timestamps, not insertion order."""
    session, engine = _create_engine()
    now = datetime.now(UTC)
    _seed_products(session)
    _add_checkout(
        session,
        status=CheckoutStatus.COMPLETED,
        updated_at=now - timedelta(hours=2),
        total=5300,
    )
    # Insert purchase first (out of logical order) to ensure query ordering
    # still evaluates click -> purchase correctly by timestamp.
    session.add_all(
        [
            RecommendationAttributionEvent(
                timestamp=now - timedelta(hours=1, minutes=40),
                event_type=RecommendationAttributionEventType.PURCHASE,
                session_id="checkout_123",
                recommendation_request_id="rec_time_order_1",
                product_id="prod_2",
                order_id="order_time_1",
                quantity=1,
                revenue_cents=2800,
            ),
            RecommendationAttributionEvent(
                timestamp=now - timedelta(hours=1, minutes=50),
                event_type=RecommendationAttributionEventType.CLICK,
                session_id=None,
                recommendation_request_id="rec_time_order_1",
                product_id="prod_2",
                position=1,
            ),
        ]
    )
    session.commit()

    data = get_dashboard_metrics(session, DashboardTimeRange.TWENTY_FOUR_HOURS)
    attribution = data["recommendation_attribution"]

    assert attribution["clicks"] == 1
    assert attribution["purchases"] == 1
    assert attribution["attributed_revenue"] == 2800

    session.close()
    engine.dispose()


def test_get_dashboard_metrics_uses_requested_window_for_agent_outcomes() -> None:
    """Agent outcomes stay aligned to requested range when KPI fallback is used."""
    session, engine = _create_engine()
    now = datetime.now(UTC)
    _seed_products(session)
    _add_checkout(
        session,
        status=CheckoutStatus.COMPLETED,
        updated_at=now - timedelta(days=2),
        total=4200,
    )
    session.add(
        AgentInvocationOutcome(
            timestamp=now - timedelta(hours=1),
            agent_type="recommendation",
            channel=AgentInvocationChannel.APPS_SDK,
            status=AgentInvocationStatus.SUCCESS,
            latency_ms=140,
        )
    )
    session.commit()

    data = get_dashboard_metrics(session, DashboardTimeRange.TWENTY_FOUR_HOURS)

    assert data["effective_window"]["fallback_applied"] is True
    recommendation_outcome = next(
        outcome
        for outcome in data["agent_outcomes"]
        if outcome["agent_type"] == "recommendation"
    )
    assert recommendation_outcome["source"] == "application"
    assert recommendation_outcome["total_calls"] == 1
    assert recommendation_outcome["errors"] == 0
    assert recommendation_outcome["success_rate"] == 100.0

    session.close()
    engine.dispose()
