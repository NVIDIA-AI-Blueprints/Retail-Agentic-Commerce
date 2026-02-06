"""Metrics dashboard API routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from src.merchant.api.dependencies import verify_api_key
from src.merchant.api.metrics_schemas import (
    DashboardMetricsResponse,
    DashboardTimeRange,
    RecordAgentOutcomeRequest,
    RecordAgentOutcomeResponse,
    RecordRecommendationAttributionRequest,
    RecordRecommendationAttributionResponse,
)
from src.merchant.db.database import get_session
from src.merchant.services.agent_outcomes import record_agent_outcome
from src.merchant.services.metrics import get_dashboard_metrics
from src.merchant.services.recommendation_attribution import (
    record_recommendation_attribution_event,
)

router = APIRouter(
    prefix="/metrics",
    tags=["metrics"],
    dependencies=[Depends(verify_api_key)],
)


@router.get(
    "/dashboard",
    response_model=DashboardMetricsResponse,
    summary="Get Metrics Dashboard Data",
    description="Return aggregated commerce metrics for the dashboard.",
)
def get_metrics_dashboard(
    time_range: DashboardTimeRange = DashboardTimeRange.TWENTY_FOUR_HOURS,
    db: Session = Depends(get_session),
) -> DashboardMetricsResponse:
    """Get dashboard metrics for the requested time range."""
    data = get_dashboard_metrics(db, time_range)
    return DashboardMetricsResponse.model_validate(data)


@router.post(
    "/agent-outcomes",
    response_model=RecordAgentOutcomeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record Agent Invocation Outcome",
    description="Record application-layer success/error outcomes for agent calls.",
)
def post_agent_outcome(
    payload: RecordAgentOutcomeRequest,
    db: Session = Depends(get_session),
) -> RecordAgentOutcomeResponse:
    """Persist one agent invocation outcome."""
    persisted = record_agent_outcome(
        db=db,
        auto_commit=True,
        agent_type=payload.agent_type.value,
        channel=payload.channel.value,
        status=payload.status.value,
        latency_ms=payload.latency_ms,
        request_id=payload.request_id,
        session_id=payload.session_id,
        error_code=payload.error_code,
    )
    if not persisted:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record agent outcome",
        )
    return RecordAgentOutcomeResponse(recorded=True)


@router.post(
    "/recommendation-attribution",
    response_model=RecordRecommendationAttributionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record Recommendation Attribution Event",
    description="Record impression/click/purchase events for recommendation conversion analytics.",
)
def post_recommendation_attribution(
    payload: RecordRecommendationAttributionRequest,
    db: Session = Depends(get_session),
) -> RecordRecommendationAttributionResponse:
    """Persist one recommendation attribution event."""
    persisted = record_recommendation_attribution_event(
        db=db,
        auto_commit=True,
        event_type=payload.event_type.value,
        product_id=payload.product_id,
        session_id=payload.session_id,
        recommendation_request_id=payload.recommendation_request_id,
        position=payload.position,
        order_id=payload.order_id,
        quantity=payload.quantity,
        revenue_cents=payload.revenue_cents,
        source=payload.source,
    )
    if not persisted:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record recommendation attribution event",
        )
    return RecordRecommendationAttributionResponse(recorded=True)
