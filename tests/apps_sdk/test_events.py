"""Tests for Apps SDK SSE event emitters."""

from src.apps_sdk.events import checkout_events, emit_agent_activity_event


def test_emit_agent_activity_event_includes_signals() -> None:
    """Promotion activity payload includes signals when provided."""
    checkout_events.clear()

    emit_agent_activity_event(
        agent_type="promotion",
        product_id="prod_16",
        product_name="Leather Loafers",
        action="DISCOUNT_10_PCT",
        discount_amount=850,
        reason_codes=["CLEARANCE"],
        reasoning="Test reasoning",
        stock_count=25,
        base_price=8500,
        signals={"competition_position": "above_market"},
    )

    assert len(checkout_events) == 1
    latest_event = checkout_events[-1]
    assert latest_event["agentType"] == "promotion"
    assert latest_event["signals"] == {"competition_position": "above_market"}
