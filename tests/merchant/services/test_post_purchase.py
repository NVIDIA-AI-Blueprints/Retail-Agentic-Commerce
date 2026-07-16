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

"""Tests for post-purchase messaging helpers."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from src.merchant.services.post_purchase import (
    MessageTone,
    PostPurchaseAgentClient,
    ShippingStatus,
    SupportedLanguage,
    build_message_request,
    format_order_items,
    get_fallback_message,
)


@pytest.mark.asyncio
async def test_client_sends_nat_input_message() -> None:
    """NAT 1.7 requests wrap the JSON payload in input_message."""
    request = build_message_request(
        order_id="order_123",
        customer_name="Jordan",
        items=[{"name": "Classic Tee", "quantity": 1}],
        status=ShippingStatus.ORDER_CONFIRMED,
        company_name="NVShop",
        tone=MessageTone.FRIENDLY,
        language=SupportedLanguage.ENGLISH,
    )
    response = MagicMock(status_code=200)
    response.json.return_value = {
        "value": json.dumps(
            {
                "order_id": "order_123",
                "status": "order_confirmed",
                "language": "en",
                "subject": "Order Confirmed",
                "message": "Thanks for your order.",
            }
        )
    }
    http_client = AsyncMock()
    http_client.__aenter__.return_value = http_client
    http_client.post.return_value = response

    with patch(
        "src.merchant.services.post_purchase.httpx.AsyncClient",
        return_value=http_client,
    ):
        result = await PostPurchaseAgentClient("http://agent").generate_message(request)

    assert result is not None
    assert http_client.post.await_args.kwargs["json"] == {
        "input_message": json.dumps(request)
    }


def test_format_order_items_includes_name_and_quantity() -> None:
    items = [
        {"name": "Classic Tee", "quantity": 1},
        {"name": "Logo Hoodie", "quantity": 2},
    ]

    result = format_order_items(items)

    assert "Classic Tee (x1)" in result
    assert "Logo Hoodie (x2)" in result


def test_fallback_message_includes_all_items() -> None:
    request = build_message_request(
        order_id="order_123",
        customer_name="Jordan",
        items=[
            {"name": "Classic Tee", "quantity": 1},
            {"name": "Logo Hoodie", "quantity": 2},
        ],
        status=ShippingStatus.ORDER_CONFIRMED,
        company_name="NVShop",
        tone=MessageTone.FRIENDLY,
        language=SupportedLanguage.ENGLISH,
    )

    response = get_fallback_message(request)

    assert response["subject"] == "Order Confirmed"
    assert "Classic Tee (x1)" in response["message"]
    assert "Logo Hoodie (x2)" in response["message"]
