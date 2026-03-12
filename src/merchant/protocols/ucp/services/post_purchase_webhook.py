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

"""UCP post-purchase orchestration and order webhook shaping."""

import logging
import uuid
from datetime import UTC, datetime
from typing import Any

from src.merchant.config import get_settings
from src.merchant.domain.checkout.models import (
    CheckoutSessionResponse,
    Total,
    TotalTypeEnum,
)
from src.merchant.protocols.ucp.api.schemas.checkout import UCPCapabilityVersion
from src.merchant.protocols.ucp.sdk_models import Order as SDKOrder
from src.merchant.protocols.ucp.services.webhook_delivery import (
    UCPOrderWebhookEvent,
    send_ucp_order_webhook,
)
from src.merchant.services.post_purchase import (
    OrderItem,
    ShippingMessageRequest,
    ShippingStatus,
    SupportedLanguage,
    generate_shipping_message,
)

logger = logging.getLogger(__name__)


def _map_order_line_item_status(shipping_status: str) -> str:
    if shipping_status == ShippingStatus.DELIVERED.value:
        return "fulfilled"
    return "processing"


def _to_ucp_total_lines(totals: list[Total]) -> list[dict[str, Any]]:
    allowed_types = {
        TotalTypeEnum.ITEMS_DISCOUNT.value,
        TotalTypeEnum.SUBTOTAL.value,
        TotalTypeEnum.DISCOUNT.value,
        TotalTypeEnum.FULFILLMENT.value,
        TotalTypeEnum.TAX.value,
        TotalTypeEnum.FEE.value,
        TotalTypeEnum.TOTAL.value,
    }
    converted: list[dict[str, Any]] = []
    for total in totals:
        if total.type.value not in allowed_types:
            continue
        converted.append(
            {
                "type": total.type.value,
                "display_text": total.display_text,
                "amount": total.amount,
            }
        )
    return converted


def _build_ucp_capabilities(
    negotiated: dict[str, list[UCPCapabilityVersion]],
) -> list[dict[str, str]]:
    flattened: list[dict[str, str]] = []
    for name, versions in negotiated.items():
        for version in versions:
            flattened.append({"name": name, "version": version.version})
    return flattened


def _build_ucp_order_event(
    checkout_session: CheckoutSessionResponse,
    message_subject: str,
    message_body: str,
    status: str,
    tracking_url: str,
    negotiated: dict[str, list[UCPCapabilityVersion]],
) -> UCPOrderWebhookEvent:
    if checkout_session.order is None:
        raise ValueError("Missing order in completed checkout session")

    now_iso = datetime.now(UTC).isoformat()
    line_items: list[dict[str, Any]] = []
    line_item_refs: list[dict[str, Any]] = []
    for line_item in checkout_session.line_items:
        quantity_total = line_item.item.quantity
        fulfilled_quantity = (
            quantity_total if status == ShippingStatus.DELIVERED.value else 0
        )
        line_items.append(
            {
                "id": line_item.id,
                "item": {
                    "id": line_item.item.id,
                    "title": line_item.name or line_item.item.id,
                    "price": line_item.base_amount // max(quantity_total, 1),
                },
                "quantity": {"total": quantity_total, "fulfilled": fulfilled_quantity},
                "totals": [
                    {
                        "type": "subtotal",
                        "display_text": "Subtotal",
                        "amount": line_item.subtotal,
                    },
                    {"type": "tax", "display_text": "Tax", "amount": line_item.tax},
                    {
                        "type": "total",
                        "display_text": "Total",
                        "amount": line_item.total,
                    },
                ],
                "status": _map_order_line_item_status(status),
            }
        )
        line_item_refs.append({"id": line_item.item.id, "quantity": quantity_total})

    description = f"{message_subject}\n\n{message_body}".strip()
    order_payload: dict[str, Any] = {
        "ucp": {
            "version": get_settings().ucp_version,
            "capabilities": _build_ucp_capabilities(negotiated),
        },
        "id": checkout_session.order.id,
        "checkout_id": checkout_session.id,
        "permalink_url": checkout_session.order.permalink_url,
        "line_items": line_items,
        "fulfillment": {
            "events": [
                {
                    "id": f"ful_{uuid.uuid4().hex[:12]}",
                    "occurred_at": now_iso,
                    "type": status,
                    "line_items": line_item_refs,
                    "tracking_url": tracking_url,
                    "description": description,
                }
            ]
        },
        "totals": _to_ucp_total_lines(checkout_session.totals),
    }

    validated_order = SDKOrder.model_validate(order_payload).model_dump(mode="json")
    return {
        "event_id": f"evt_{uuid.uuid4().hex}",
        "created_time": now_iso,
        "order": validated_order,
    }


async def trigger_post_purchase_flow_ucp(
    checkout_session: CheckoutSessionResponse,
    customer_name: str,
    items: list[OrderItem],
    language: str,
    webhook_url: str,
    negotiated: dict[str, list[UCPCapabilityVersion]],
) -> None:
    """Trigger UCP post-purchase flow and deliver a UCP order webhook event."""
    if checkout_session.order is None:
        logger.warning(
            "Skipping UCP post-purchase flow: order missing for session %s",
            checkout_session.id,
        )
        return

    order_id = checkout_session.order.id
    logger.info(
        "Triggering UCP post-purchase flow for order %s (session: %s)",
        order_id,
        checkout_session.id,
    )

    try:
        lang = SupportedLanguage(language)
    except ValueError:
        lang = SupportedLanguage.ENGLISH
        logger.warning("Invalid language '%s', defaulting to English", language)

    request: ShippingMessageRequest = {
        "brand_persona": {
            "company_name": "NVShop",
            "tone": "friendly",
            "preferred_language": lang.value,
        },
        "order": {
            "order_id": order_id,
            "customer_name": customer_name,
            "items": items,
            "tracking_url": f"https://track.nvshop.demo/orders/{order_id}",
            "estimated_delivery": None,
        },
        "status": ShippingStatus.ORDER_CONFIRMED.value,
    }

    try:
        response = await generate_shipping_message(request)
    except Exception as exc:  # pragma: no cover - defensive
        logger.error(
            "Failed to generate UCP post-purchase message for order %s: %s",
            order_id,
            str(exc),
        )
        return

    event = _build_ucp_order_event(
        checkout_session=checkout_session,
        message_subject=response["subject"],
        message_body=response["message"],
        status=response["status"],
        tracking_url=f"https://track.nvshop.demo/orders/{order_id}",
        negotiated=negotiated,
    )
    success = await send_ucp_order_webhook(event=event, webhook_url=webhook_url)
    if success:
        logger.info("UCP order webhook delivered for order %s", order_id)
    else:
        logger.warning("UCP order webhook delivery failed for order %s", order_id)
