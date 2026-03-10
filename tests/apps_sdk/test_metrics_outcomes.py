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

"""Tests for Apps SDK outcome classification and recording helpers."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from src.apps_sdk.main import (
    _classify_outcome_status,
    _record_apps_sdk_outcome,
    _record_recommendation_attribution_event,
)


def test_classify_outcome_status_handles_search_no_results() -> None:
    """No-result search responses should not count as agent failures."""
    status, error_code = _classify_outcome_status(
        agent_type="search",
        error_message="No products found for 'skirts'.",
    )
    assert status == "success"
    assert error_code is None


def test_classify_outcome_status_maps_timeout_and_upstream() -> None:
    """Timeout and upstream issues map to normalized statuses."""
    timeout_status, timeout_code = _classify_outcome_status(
        agent_type="recommendation",
        error_message="Recommendation agent timeout",
    )
    assert timeout_status == "error_timeout"
    assert timeout_code == "timeout"

    upstream_status, upstream_code = _classify_outcome_status(
        agent_type="recommendation",
        error_message="Recommendation agent unavailable",
    )
    assert upstream_status == "error_upstream"
    assert upstream_code == "upstream_error"


@pytest.mark.asyncio
async def test_record_apps_sdk_outcome_posts_to_merchant_metrics() -> None:
    """Outcome recorder sends payload to merchant metrics endpoint."""
    mock_response = MagicMock()
    mock_response.status_code = 201
    mock_response.text = ""

    with patch("httpx.AsyncClient") as mock_client:
        mock_instance = AsyncMock()
        mock_instance.post.return_value = mock_response
        mock_instance.__aenter__.return_value = mock_instance
        mock_instance.__aexit__.return_value = None
        mock_client.return_value = mock_instance

        await _record_apps_sdk_outcome(
            agent_type="recommendation",
            status="success",
            latency_ms=123,
            error_code=None,
        )

        assert mock_instance.post.await_count == 1
        args, kwargs = mock_instance.post.await_args
        assert args[0].endswith("/metrics/agent-outcomes")
        assert kwargs["json"]["agent_type"] == "recommendation"
        assert kwargs["json"]["channel"] == "apps_sdk"
        assert kwargs["json"]["status"] == "success"


@pytest.mark.asyncio
async def test_record_recommendation_attribution_posts_to_merchant_metrics() -> None:
    """Attribution recorder sends payload to merchant metrics endpoint."""
    mock_response = MagicMock()
    mock_response.status_code = 201
    mock_response.text = ""

    with patch("httpx.AsyncClient") as mock_client:
        mock_instance = AsyncMock()
        mock_instance.post.return_value = mock_response
        mock_instance.__aenter__.return_value = mock_instance
        mock_instance.__aexit__.return_value = None
        mock_client.return_value = mock_instance

        await _record_recommendation_attribution_event(
            event_type="click",
            product_id="prod_2",
            session_id="cart_1",
            recommendation_request_id="rec_1",
            position=1,
        )

        assert mock_instance.post.await_count == 1
        args, kwargs = mock_instance.post.await_args
        assert args[0].endswith("/metrics/recommendation-attribution")
        assert kwargs["json"]["event_type"] == "click"
        assert kwargs["json"]["product_id"] == "prod_2"
        assert kwargs["json"]["recommendation_request_id"] == "rec_1"
