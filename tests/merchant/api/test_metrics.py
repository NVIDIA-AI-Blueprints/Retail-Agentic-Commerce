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

"""Tests for metrics dashboard API endpoint."""

from fastapi.testclient import TestClient


class TestMetricsDashboardEndpoint:
    """Test suite for GET /metrics/dashboard."""

    def test_metrics_dashboard_requires_auth(self, client: TestClient) -> None:
        """Request without API key returns 401."""
        response = client.get("/metrics/dashboard")

        assert response.status_code == 401

    def test_metrics_dashboard_returns_200_with_auth(
        self, auth_client: TestClient
    ) -> None:
        """Authenticated request returns metrics payload."""
        response = auth_client.get("/metrics/dashboard?time_range=24h")

        assert response.status_code == 200
        data = response.json()
        assert "effective_window" in data
        assert "kpis" in data
        assert "revenue_data" in data
        assert "agent_outcomes" in data
        assert "recommendation_attribution" in data
        assert "promotion_breakdown" in data
        assert "product_health" in data

    def test_metrics_dashboard_rejects_invalid_time_range(
        self, auth_client: TestClient
    ) -> None:
        """Invalid time_range query value returns validation error."""
        response = auth_client.get("/metrics/dashboard?time_range=365d")

        assert response.status_code == 422

    def test_metrics_agent_outcomes_records_and_surfaces_in_dashboard(
        self, auth_client: TestClient
    ) -> None:
        """Recorded outcome is returned in the dashboard aggregate."""
        record_response = auth_client.post(
            "/metrics/agent-outcomes",
            json={
                "agent_type": "recommendation",
                "channel": "apps_sdk",
                "status": "error_upstream",
                "latency_ms": 153,
                "error_code": "upstream_error",
            },
        )

        assert record_response.status_code == 201
        assert record_response.json() == {"recorded": True}

        dashboard_response = auth_client.get("/metrics/dashboard?time_range=24h")
        assert dashboard_response.status_code == 200
        outcomes = dashboard_response.json()["agent_outcomes"]
        recommendation = next(
            entry for entry in outcomes if entry["agent_type"] == "recommendation"
        )
        assert recommendation["source"] == "application"
        assert recommendation["total_calls"] >= 1
        assert recommendation["errors"] >= 1

    def test_metrics_recommendation_attribution_records_event(
        self, auth_client: TestClient
    ) -> None:
        """Recommendation attribution event can be recorded via metrics endpoint."""
        response = auth_client.post(
            "/metrics/recommendation-attribution",
            json={
                "event_type": "click",
                "product_id": "prod_2",
                "session_id": "cart_demo_1",
                "recommendation_request_id": "rec_demo_1",
                "position": 1,
            },
        )
        assert response.status_code == 201
        assert response.json() == {"recorded": True}
