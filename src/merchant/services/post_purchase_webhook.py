"""Post-purchase webhook integration service.

This service implements the correct ACP flow for post-purchase notifications:
1. Merchant completes checkout → order created
2. Merchant calls Post-Purchase Agent → generates message
3. Merchant sends webhook to Client Agent → delivers message

Architecture (per ACP spec and Feature 11):
┌─────────────────────────────────────────────────────────────────────────┐
│  Merchant Backend                    Client Agent (UI)                  │
│        │                                   │                            │
│        │  1. Order created                 │                            │
│        │  2. Call Post-Purchase Agent      │                            │
│        │     (generate message)            │                            │
│        │                                   │                            │
│        │  POST /api/webhooks/acp           │                            │
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

from src.merchant.services.post_purchase import (
    ShippingMessageRequest,
    ShippingStatus,
    SupportedLanguage,
    generate_shipping_message,
)
from src.merchant.services.webhook import send_shipping_update_webhook

logger = logging.getLogger(__name__)


async def trigger_post_purchase_flow(
    checkout_session_id: str,
    order_id: str,
    customer_name: str,
    product_name: str,
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
        product_name: Product name for the message
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
            "product_name": product_name,
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
