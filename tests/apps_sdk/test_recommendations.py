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

"""Tests for the get-recommendations MCP tool.

Tests cover:
- Happy path: ARAG agent returns valid recommendations
- Error handling: ARAG agent unavailable
- Timeout handling: ARAG agent times out
"""

from __future__ import annotations

import json
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest


class TestCallRecommendationAgent:
    """Tests for the call_recommendation_agent function."""

    @pytest.mark.asyncio
    async def test_happy_path_returns_recommendations(self) -> None:
        """Agent returns valid recommendations with all expected fields."""
        from src.apps_sdk.main import call_recommendation_agent

        mock_response = {
            "recommendations": [
                {
                    "product_id": "prod_5",
                    "product_name": "Classic Denim Jeans",
                    "rank": 1,
                    "reasoning": "Pairs well with the tee",
                },
                {
                    "product_id": "prod_6",
                    "product_name": "Canvas Sneakers",
                    "rank": 2,
                    "reasoning": "Casual footwear match",
                },
                {
                    "product_id": "prod_7",
                    "product_name": "Baseball Cap",
                    "rank": 3,
                    "reasoning": "Completes the casual look",
                },
            ],
            "user_intent": "casual summer outfit",
            "pipeline_trace": {
                "candidates_found": 20,
                "after_nli_filter": 8,
                "final_ranked": 3,
            },
        }

        # httpx.Response methods are sync, so use MagicMock
        mock_http_response = MagicMock()
        mock_http_response.status_code = 200
        mock_http_response.json.return_value = mock_response
        mock_http_response.raise_for_status = MagicMock()

        with patch("httpx.AsyncClient") as mock_client:
            mock_instance = AsyncMock()
            # post() is async, so it should return an awaitable that resolves to the response
            mock_instance.post.return_value = mock_http_response
            mock_instance.__aenter__.return_value = mock_instance
            mock_instance.__aexit__.return_value = None
            mock_client.return_value = mock_instance

            result = await call_recommendation_agent(
                product_id="prod_001",
                product_name="Classic Tee",
                cart_items=[],
            )

        assert "recommendations" in result
        assert len(result["recommendations"]) == 3
        assert result["recommendations"][0]["product_id"] == "prod_5"
        assert result["userIntent"] == "casual summer outfit"
        # pipelineTrace contains the raw snake_case keys from the agent
        assert result["pipelineTrace"]["candidates_found"] == 20

    @pytest.mark.asyncio
    async def test_with_cart_items_context(self) -> None:
        """Agent receives cart items as context for better recommendations."""
        from src.apps_sdk.main import CartItemInput, call_recommendation_agent

        mock_response = {
            "recommendations": [
                {
                    "product_id": "prod_8",
                    "product_name": "Matching Belt",
                    "rank": 1,
                    "reasoning": "Goes with existing jeans in cart",
                },
            ],
            "user_intent": "accessories for existing items",
        }

        # httpx.Response methods are sync, so use MagicMock
        mock_http_response = MagicMock()
        mock_http_response.status_code = 200
        mock_http_response.json.return_value = mock_response
        mock_http_response.raise_for_status = MagicMock()

        with patch("httpx.AsyncClient") as mock_client:
            mock_instance = AsyncMock()
            mock_instance.post.return_value = mock_http_response
            mock_instance.__aenter__.return_value = mock_instance
            mock_instance.__aexit__.return_value = None
            mock_client.return_value = mock_instance

            cart_items = [
                CartItemInput(product_id="prod_5", name="Jeans", price=4500),
            ]

            result = await call_recommendation_agent(
                product_id="prod_001",
                product_name="Classic Tee",
                cart_items=cart_items,
            )

        assert "recommendations" in result
        assert len(result["recommendations"]) == 1

    @pytest.mark.asyncio
    async def test_agent_timeout_returns_empty_recommendations(self) -> None:
        """Timeout returns empty recommendations with error message."""
        from src.apps_sdk.main import call_recommendation_agent

        with patch("httpx.AsyncClient") as mock_client:
            mock_instance = AsyncMock()
            mock_instance.post.side_effect = httpx.TimeoutException("Timeout")
            mock_instance.__aenter__.return_value = mock_instance
            mock_instance.__aexit__.return_value = None
            mock_client.return_value = mock_instance

            result = await call_recommendation_agent(
                product_id="prod_001",
                product_name="Classic Tee",
                cart_items=[],
            )

        assert result["recommendations"] == []
        assert "error" in result
        assert "timeout" in result["error"].lower()

    @pytest.mark.asyncio
    async def test_agent_http_error_returns_error_message(self) -> None:
        """HTTP error from agent returns error in result."""
        from src.apps_sdk.main import call_recommendation_agent

        # httpx.Response methods are sync, so use MagicMock
        mock_request = MagicMock()
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
            "Server Error",
            request=mock_request,
            response=mock_response,
        )

        with patch("httpx.AsyncClient") as mock_client:
            mock_instance = AsyncMock()
            mock_instance.post.return_value = mock_response
            mock_instance.__aenter__.return_value = mock_instance
            mock_instance.__aexit__.return_value = None
            mock_client.return_value = mock_instance

            result = await call_recommendation_agent(
                product_id="prod_001",
                product_name="Classic Tee",
                cart_items=[],
            )

        assert result["recommendations"] == []
        assert "error" in result

    @pytest.mark.asyncio
    async def test_empty_response_from_agent(self) -> None:
        """Empty response from agent returns empty recommendations."""
        from src.apps_sdk.main import call_recommendation_agent

        mock_response = {
            "recommendations": [],
            "user_intent": "could not determine intent",
            "message": "No suitable recommendations found",
        }

        # httpx.Response methods are sync, so use MagicMock
        mock_http_response = MagicMock()
        mock_http_response.status_code = 200
        mock_http_response.json.return_value = mock_response
        mock_http_response.raise_for_status = MagicMock()

        with patch("httpx.AsyncClient") as mock_client:
            mock_instance = AsyncMock()
            mock_instance.post.return_value = mock_http_response
            mock_instance.__aenter__.return_value = mock_instance
            mock_instance.__aexit__.return_value = None
            mock_client.return_value = mock_instance

            result = await call_recommendation_agent(
                product_id="prod_001",
                product_name="Classic Tee",
                cart_items=[],
            )

        assert result["recommendations"] == []
        assert result["userIntent"] == "could not determine intent"


class TestGetRecommendationsInput:
    """Tests for the GetRecommendationsInput schema."""

    def test_valid_input_with_cart_items(self) -> None:
        """Valid input with cart items is accepted."""
        from src.apps_sdk.main import GetRecommendationsInput

        input_data = {
            "productId": "prod_001",
            "productName": "Classic Tee",
            "cartItems": [
                {"productId": "prod_002", "name": "Jeans", "price": 4500},
            ],
        }

        model = GetRecommendationsInput.model_validate(input_data)

        assert model.product_id == "prod_001"
        assert model.product_name == "Classic Tee"
        assert len(model.cart_items) == 1
        assert model.cart_items[0].product_id == "prod_002"

    def test_valid_input_without_cart_items(self) -> None:
        """Valid input without cart items uses empty list."""
        from src.apps_sdk.main import GetRecommendationsInput

        input_data = {
            "productId": "prod_001",
            "productName": "Classic Tee",
        }

        model = GetRecommendationsInput.model_validate(input_data)

        assert model.product_id == "prod_001"
        assert model.cart_items == []

    def test_missing_required_field_raises_error(self) -> None:
        """Missing required field raises validation error."""
        from pydantic import ValidationError

        from src.apps_sdk.main import GetRecommendationsInput

        input_data = {
            "productName": "Classic Tee",
            # Missing productId
        }

        with pytest.raises(ValidationError):
            GetRecommendationsInput.model_validate(input_data)


class TestGetRecommendationsOutput:
    """Tests for the GetRecommendationsOutput schema."""

    def test_valid_output_with_all_fields(self) -> None:
        """Valid output with all fields is serialized correctly."""
        from src.apps_sdk.main import (
            GetRecommendationsOutput,
            PipelineTraceOutput,
            RecommendationItemOutput,
        )

        output = GetRecommendationsOutput(
            recommendations=[
                RecommendationItemOutput(
                    productId="prod_5",
                    productName="Jeans",
                    rank=1,
                    reasoning="Good match",
                ),
            ],
            userIntent="casual wear",
            pipelineTrace=PipelineTraceOutput(
                candidatesFound=20,
                afterNliFilter=8,
                finalRanked=3,
            ),
        )

        data = output.model_dump(by_alias=True)

        assert data["recommendations"][0]["productId"] == "prod_5"
        assert data["userIntent"] == "casual wear"
        assert data["pipelineTrace"]["candidatesFound"] == 20

    def test_output_with_error(self) -> None:
        """Output with error field is serialized correctly."""
        from src.apps_sdk.main import GetRecommendationsOutput

        output = GetRecommendationsOutput(
            recommendations=[],
            error="Agent unavailable",
        )

        data = output.model_dump(by_alias=True)

        assert data["recommendations"] == []
        assert data["error"] == "Agent unavailable"


class TestCallSearchAgent:
    """Tests for the call_search_agent function."""

    @pytest.mark.asyncio
    async def test_returns_search_results(self) -> None:
        """Agent returns parsed search results."""
        from src.apps_sdk.tools.recommendations import call_search_agent

        mock_response = {
            "value": json.dumps(
                {
                    "query": "summer tee",
                    "results": [
                        {
                            "product_id": "prod_1",
                            "product_name": "Classic Tee",
                            "snippet": "Lightweight summer essential",
                        }
                    ],
                }
            )
        }

        mock_http_response = MagicMock()
        mock_http_response.status_code = 200
        mock_http_response.json.return_value = mock_response
        mock_http_response.raise_for_status = MagicMock()

        with patch("httpx.AsyncClient") as mock_client:
            mock_instance = AsyncMock()
            mock_instance.post.return_value = mock_http_response
            mock_instance.__aenter__.return_value = mock_instance
            mock_instance.__aexit__.return_value = None
            mock_client.return_value = mock_instance

            result = await call_search_agent(query="summer tee", category=None, limit=3)

        assert result["query"] == "summer tee"
        assert len(result["results"]) == 1
        assert result["results"][0]["product_id"] == "prod_1"

    @pytest.mark.asyncio
    async def test_search_agent_timeout_returns_error(self) -> None:
        """Timeout returns empty results with error message."""
        from src.apps_sdk.tools.recommendations import call_search_agent

        with patch("httpx.AsyncClient") as mock_client:
            mock_instance = AsyncMock()
            mock_instance.post.side_effect = httpx.TimeoutException("Timeout")
            mock_instance.__aenter__.return_value = mock_instance
            mock_instance.__aexit__.return_value = None
            mock_client.return_value = mock_instance

            result = await call_search_agent(query="summer tee", category=None, limit=3)

        assert result["results"] == []
        assert "timeout" in result["error"].lower()
