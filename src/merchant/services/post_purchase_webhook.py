"""Post-purchase webhook integration service.

This service implements the correct ACP flow for post-purchase notifications:
1. Merchant completes checkout → order created
2. Merchant calls Post-Purchase Agent → generates message
3. Merchant sends webhook to Client Agent → delivers message

Architecture (protocol-specific webhook target):
┌─────────────────────────────────────────────────────────────────────────┐
│  Merchant Backend                    Client Agent (UI)                  │
│        │                                   │                            │
│        │  1. Order created                 │                            │
│        │  2. Call Post-Purchase Agent      │                            │
│        │     (generate message)            │                            │
│        │                                   │                            │
│        │  ACP: POST /api/webhooks/acp      │                            │
│        │  UCP: POST /api/webhooks/ucp      │                            │
│        │  {type: "shipping_update", ...}   │                            │
│        │ ─────────────────────────────────▶│                            │
│        │                                   │                            │
│        │       200 OK {received: true}     │                            │
│        │ ◀─────────────────────────────────│                            │
│        │                            3. UI displays notification         │
└─────────────────────────────────────────────────────────────────────────┘

This module is designed to be called as a FastAPI BackgroundTask after
checkout completion, so it doesn't block the checkout response.
"""

import logging
import uuid
from datetime import UTC, datetime
from typing import Any

from ucp_sdk.models.schemas.shopping.order import Order as SDKOrder

from src.merchant.api.schemas import CheckoutSessionResponse, Total, TotalTypeEnum
from src.merchant.api.ucp_schemas import UCPCapabilityVersion
from src.merchant.config import get_settings
from src.merchant.services.post_purchase import (
    OrderItem,
    ShippingMessageRequest,
    ShippingStatus,
    SupportedLanguage,
    generate_shipping_message,
)
from src.merchant.services.webhook import (
    UCPOrderWebhookEvent,
    send_shipping_update_webhook,
    send_ucp_order_webhook,
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


async def trigger_post_purchase_flow(
    checkout_session_id: str,
    order_id: str,
    customer_name: str,
    items: list[OrderItem],
    language: str = "en",
) -> None:
    """Trigger the post-purchase agent and webhook delivery flow.

    This function should be called as a background task after checkout completion.
    It follows the ACP architecture where the MERCHANT is responsible for:
    1. Calling the Post-Purchase Agent to generate the message
    2. Sending the webhook to the Client Agent with the generated message

    Args:
        checkout_session_id: The checkout session ID
        order_id: The order ID
        customer_name: Customer's first name for personalization
        items: Items included in the order
        language: Preferred language (en, es, fr)
    """
    logger.info(
        "Triggering post-purchase flow for order %s (session: %s)",
        order_id,
        checkout_session_id,
    )

    # Validate language
    try:
        lang = SupportedLanguage(language)
    except ValueError:
        lang = SupportedLanguage.ENGLISH
        logger.warning("Invalid language '%s', defaulting to English", language)

    # Step 1: Build the request for Post-Purchase Agent
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
            "estimated_delivery": None,  # Could be calculated based on shipping option
        },
        "status": ShippingStatus.ORDER_CONFIRMED.value,
    }

    # Step 2: Call Post-Purchase Agent (LLM) to generate the message
    try:
        logger.info("Calling Post-Purchase Agent for order %s", order_id)
        response = await generate_shipping_message(request)
        logger.info(
            "Post-Purchase Agent generated message for order %s (language: %s)",
            order_id,
            response["language"],
        )
    except Exception as e:
        logger.error(
            "Failed to generate post-purchase message for order %s: %s",
            order_id,
            str(e),
        )
        return

    # Step 3: Send webhook to Client Agent (per ACP spec)
    try:
        logger.info("Sending shipping_update webhook for order %s", order_id)
        success = await send_shipping_update_webhook(
            checkout_session_id=checkout_session_id,
            order_id=order_id,
            status=response["status"],
            language=response["language"],
            subject=response["subject"],
            message=response["message"],
            tracking_url=f"https://track.nvshop.demo/orders/{order_id}",
        )

        if success:
            logger.info(
                "Webhook delivered successfully for order %s",
                order_id,
            )
        else:
            logger.warning(
                "Webhook delivery failed for order %s (non-blocking)",
                order_id,
            )
    except Exception as e:
        logger.error(
            "Exception sending webhook for order %s: %s",
            order_id,
            str(e),
        )


async def trigger_post_purchase_flow_ucp(
    checkout_session: CheckoutSessionResponse,
    customer_name: str,
    items: list[OrderItem],
    language: str,
    webhook_url: str,
    negotiated: dict[str, list[UCPCapabilityVersion]],
) -> None:
    """Trigger post-purchase flow and deliver a UCP order webhook event."""
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
