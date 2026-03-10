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
