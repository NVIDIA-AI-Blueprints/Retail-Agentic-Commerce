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

"""Tests for the health check endpoint."""

import pytest
from fastapi.testclient import TestClient


class TestHealthEndpoint:
    """Test suite for the /health endpoint."""

    def test_health_returns_200(self, client: TestClient) -> None:
        """Happy path: Health endpoint returns 200 OK."""
        response = client.get("/health")

        assert response.status_code == 200

    def test_health_returns_healthy_status(self, client: TestClient) -> None:
        """Happy path: Health endpoint returns healthy status."""
        response = client.get("/health")
        data = response.json()

        assert data["status"] == "healthy"

    def test_health_returns_version(self, client: TestClient) -> None:
        """Happy path: Health endpoint returns version string."""
        response = client.get("/health")
        data = response.json()

        assert "version" in data
        assert isinstance(data["version"], str)
        assert len(data["version"]) > 0

    def test_health_response_has_required_fields(self, client: TestClient) -> None:
        """Edge case: Response contains all required fields."""
        response = client.get("/health")
        data = response.json()

        required_fields = {"status", "version"}
        assert required_fields <= set(data.keys())

    def test_health_response_json_content_type(self, client: TestClient) -> None:
        """Edge case: Response has correct content type."""
        response = client.get("/health")

        assert "application/json" in response.headers["content-type"]

    @pytest.mark.parametrize("method", ["POST", "PUT", "DELETE", "PATCH"])
    def test_health_rejects_non_get_methods(
        self, client: TestClient, method: str
    ) -> None:
        """Failure case: Health endpoint rejects non-GET methods."""
        response = client.request(method, "/health")

        assert response.status_code == 405
