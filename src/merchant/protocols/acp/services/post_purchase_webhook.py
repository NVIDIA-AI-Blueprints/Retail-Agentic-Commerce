"""ACP post-purchase orchestration service."""

import logging

from src.merchant.protocols.acp.services.webhook_delivery import (
    send_shipping_update_webhook,
)
from src.merchant.services.post_purchase import (
    OrderItem,
    ShippingMessageRequest,
    ShippingStatus,
    SupportedLanguage,
    generate_shipping_message,
)

logger = logging.getLogger(__name__)


async def trigger_post_purchase_flow(
    checkout_session_id: str,
    order_id: str,
    customer_name: str,
    items: list[OrderItem],
    language: str = "en",
) -> None:
    """Trigger ACP post-purchase message generation and webhook delivery."""
    logger.info(
        "Triggering post-purchase flow for order %s (session: %s)",
        order_id,
        checkout_session_id,
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
        logger.info("Calling Post-Purchase Agent for order %s", order_id)
        response = await generate_shipping_message(request)
    except Exception as exc:  # pragma: no cover - defensive
        logger.error(
            "Failed to generate post-purchase message for order %s: %s",
            order_id,
            str(exc),
        )
        return

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
            logger.info("Webhook delivered successfully for order %s", order_id)
        else:
            logger.warning(
                "Webhook delivery failed for order %s (non-blocking)", order_id
            )
    except Exception as exc:  # pragma: no cover - defensive
        logger.error(
            "Exception sending webhook for order %s: %s",
            order_id,
            str(exc),
        )
