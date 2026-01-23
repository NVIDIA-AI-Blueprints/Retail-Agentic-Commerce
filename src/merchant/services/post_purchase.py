"""Post-purchase service for generating multilingual shipping updates.

This service integrates with the Post-Purchase Agent (NAT) to generate
human-like shipping messages based on brand persona and order context.

Architecture:
- Layer 1: Build message request with brand persona and order context
- Layer 2: LLM generation (call Post-Purchase Agent REST API)
- Layer 3: Validate and format response for delivery

This module includes:
- Enums for shipping status, tone, and language
- TypedDicts for input/output formats
- Async client for calling the Post-Purchase Agent REST API
- Service functions for generating shipping messages

Designed for integration with Feature 11 (Webhook Integration).
"""

import asyncio
import json
import logging
from enum import Enum
from typing import TypedDict

import httpx

from src.merchant.config import get_settings

logger = logging.getLogger(__name__)


# =============================================================================
# Shipping Status Enum - Lifecycle stages for orders
# =============================================================================


class ShippingStatus(str, Enum):
    """Shipping status values for post-purchase communications."""

    ORDER_CONFIRMED = "order_confirmed"
    ORDER_SHIPPED = "order_shipped"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"


# =============================================================================
# Message Tone Enum - Brand voice options
# =============================================================================


class MessageTone(str, Enum):
    """Available tone options for brand persona."""

    FRIENDLY = "friendly"  # Warm, enthusiastic, uses emojis sparingly
    PROFESSIONAL = "professional"  # Formal, courteous, no emojis
    CASUAL = "casual"  # Relaxed, informal, may use emojis
    URGENT = "urgent"  # Direct, action-oriented, time-sensitive


# =============================================================================
# Supported Language Enum - Multilingual support
# =============================================================================


class SupportedLanguage(str, Enum):
    """Supported languages for message generation."""

    ENGLISH = "en"
    SPANISH = "es"
    FRENCH = "fr"


# =============================================================================
# Input/Output TypedDicts - Contract between ACP endpoint and agent
# =============================================================================


class BrandPersona(TypedDict):
    """Brand persona configuration for message generation."""

    company_name: str  # Retailer's name (e.g., "Acme T-Shirts")
    tone: str  # MessageTone value
    preferred_language: str  # SupportedLanguage value


class OrderContext(TypedDict):
    """Order information for message personalization."""

    order_id: str  # Order identifier
    customer_name: str  # Customer's first name
    product_name: str  # Name of the purchased product
    tracking_url: str | None  # Package tracking URL (may be null)
    estimated_delivery: str | None  # Estimated delivery date (ISO format)


class ShippingMessageRequest(TypedDict):
    """Input format sent from ACP endpoint to Post-Purchase Agent."""

    brand_persona: BrandPersona
    order: OrderContext
    status: str  # ShippingStatus value


class ShippingMessageResponse(TypedDict):
    """Output format returned by Post-Purchase Agent to ACP endpoint."""

    order_id: str
    status: str  # ShippingStatus value
    language: str  # SupportedLanguage value
    subject: str  # Email subject line
    message: str  # Full message body


# =============================================================================
# Post-Purchase Agent Client - Async REST client for agent communication
# =============================================================================


class PostPurchaseAgentClient:
    """Async HTTP client for calling the Post-Purchase Agent REST API.

    Designed for fail-open behavior: if the agent is unavailable,
    returns None and the caller should use fallback templates.
    """

    def __init__(self, base_url: str, timeout: float = 15.0):
        """Initialize the post-purchase agent client.

        Args:
            base_url: Base URL of the Post-Purchase Agent (e.g., http://localhost:8003)
            timeout: Request timeout in seconds (default: 15.0 for message generation)
        """
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    async def generate_message(
        self, request: ShippingMessageRequest
    ) -> ShippingMessageResponse | None:
        """Call the Post-Purchase Agent to generate a shipping message.

        Args:
            request: Shipping message request with brand persona and order context.

        Returns:
            ShippingMessageResponse if successful, None if agent unavailable.
            Fails open - logs warnings but does not raise exceptions.
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # NAT /generate endpoint expects {"query": "<JSON string>"}
                response = await client.post(
                    f"{self.base_url}/generate",
                    json={"query": json.dumps(request)},
                    headers={"Content-Type": "application/json"},
                )

                if response.status_code != 200:
                    logger.warning(
                        "Post-purchase agent returned status %d: %s",
                        response.status_code,
                        response.text,
                    )
                    return None

                # Parse the agent response
                result = response.json()

                # NAT returns response in {"value": "<JSON string>"} format
                if "value" in result:
                    try:
                        message_data = json.loads(result["value"])
                        return ShippingMessageResponse(
                            order_id=message_data.get(
                                "order_id", request["order"]["order_id"]
                            ),
                            status=message_data.get("status", request["status"]),
                            language=message_data.get(
                                "language",
                                request["brand_persona"]["preferred_language"],
                            ),
                            subject=message_data.get("subject", ""),
                            message=message_data.get("message", ""),
                        )
                    except json.JSONDecodeError as e:
                        logger.warning(
                            "Failed to parse post-purchase agent response as JSON: %s",
                            e,
                        )
                        return None

                logger.warning(
                    "Unexpected response format from post-purchase agent: %s", result
                )
                return None

        except httpx.TimeoutException:
            logger.warning(
                "Post-purchase agent request timed out after %.1f seconds", self.timeout
            )
            return None
        except httpx.ConnectError as e:
            logger.warning(
                "Failed to connect to post-purchase agent at %s: %s", self.base_url, e
            )
            return None
        except asyncio.CancelledError:
            logger.warning("Post-purchase agent request was cancelled")
            raise
        except Exception as e:
            logger.warning("Unexpected error calling post-purchase agent: %s", e)
            return None


# =============================================================================
# Default client instance (configured via settings)
# =============================================================================

_default_client: PostPurchaseAgentClient | None = None


def get_post_purchase_client(
    base_url: str, timeout: float = 15.0
) -> PostPurchaseAgentClient:
    """Get or create the default post-purchase agent client.

    Args:
        base_url: Base URL of the Post-Purchase Agent.
        timeout: Request timeout in seconds.

    Returns:
        PostPurchaseAgentClient instance.
    """
    global _default_client
    if _default_client is None or _default_client.base_url != base_url:
        _default_client = PostPurchaseAgentClient(base_url, timeout)
    return _default_client


# =============================================================================
# Fallback Templates - Used when agent is unavailable
# =============================================================================

# Default templates for fail-open behavior
FALLBACK_TEMPLATES: dict[str, dict[str, dict[str, str]]] = {
    "en": {
        ShippingStatus.ORDER_CONFIRMED.value: {
            "subject": "Order Confirmed",
            "message": "Thank you for your order, {customer_name}! Your {product_name} order has been confirmed.\n\n- {company_name}",
        },
        ShippingStatus.ORDER_SHIPPED.value: {
            "subject": "Your Order Has Shipped",
            "message": "Hi {customer_name}, your {product_name} is on its way!\n\nTrack your package: {tracking_url}\n\n- {company_name}",
        },
        ShippingStatus.OUT_FOR_DELIVERY.value: {
            "subject": "Out for Delivery",
            "message": "Hi {customer_name}, your {product_name} will arrive today!\n\nTrack your package: {tracking_url}\n\n- {company_name}",
        },
        ShippingStatus.DELIVERED.value: {
            "subject": "Your Order Has Been Delivered",
            "message": "Hi {customer_name}, your {product_name} has been delivered! We hope you enjoy it.\n\n- {company_name}",
        },
    },
    "es": {
        ShippingStatus.ORDER_CONFIRMED.value: {
            "subject": "Pedido Confirmado",
            "message": "¡Gracias por tu pedido, {customer_name}! Tu pedido de {product_name} ha sido confirmado.\n\n- {company_name}",
        },
        ShippingStatus.ORDER_SHIPPED.value: {
            "subject": "Tu Pedido Ha Sido Enviado",
            "message": "Hola {customer_name}, tu {product_name} está en camino.\n\nRastrear paquete: {tracking_url}\n\n- {company_name}",
        },
        ShippingStatus.OUT_FOR_DELIVERY.value: {
            "subject": "En Reparto",
            "message": "Hola {customer_name}, tu {product_name} llegará hoy.\n\nRastrear paquete: {tracking_url}\n\n- {company_name}",
        },
        ShippingStatus.DELIVERED.value: {
            "subject": "Tu Pedido Ha Sido Entregado",
            "message": "Hola {customer_name}, tu {product_name} ha sido entregado. ¡Esperamos que lo disfrutes!\n\n- {company_name}",
        },
    },
    "fr": {
        ShippingStatus.ORDER_CONFIRMED.value: {
            "subject": "Commande Confirmée",
            "message": "Merci pour votre commande, {customer_name} ! Votre commande de {product_name} a été confirmée.\n\n- {company_name}",
        },
        ShippingStatus.ORDER_SHIPPED.value: {
            "subject": "Votre Commande a été Expédiée",
            "message": "Bonjour {customer_name}, votre {product_name} est en route !\n\nSuivre le colis : {tracking_url}\n\n- {company_name}",
        },
        ShippingStatus.OUT_FOR_DELIVERY.value: {
            "subject": "En Cours de Livraison",
            "message": "Bonjour {customer_name}, votre {product_name} arrivera aujourd'hui !\n\nSuivre le colis : {tracking_url}\n\n- {company_name}",
        },
        ShippingStatus.DELIVERED.value: {
            "subject": "Votre Commande a été Livrée",
            "message": "Bonjour {customer_name}, votre {product_name} a été livré ! Nous espérons qu'il vous plaira.\n\n- {company_name}",
        },
    },
}


def get_fallback_message(
    request: ShippingMessageRequest,
) -> ShippingMessageResponse:
    """Generate a fallback message when agent is unavailable.

    Args:
        request: The original shipping message request.

    Returns:
        ShippingMessageResponse with template-based message.
    """
    language = request["brand_persona"]["preferred_language"]
    status = request["status"]
    order = request["order"]
    persona = request["brand_persona"]

    # Get template for language, fallback to English
    lang_templates = FALLBACK_TEMPLATES.get(language, FALLBACK_TEMPLATES["en"])
    template = lang_templates.get(
        status, lang_templates[ShippingStatus.ORDER_CONFIRMED.value]
    )

    # Format template with order data
    format_data = {
        "customer_name": order["customer_name"],
        "product_name": order["product_name"],
        "tracking_url": order.get("tracking_url") or "",
        "company_name": persona["company_name"],
    }

    return ShippingMessageResponse(
        order_id=order["order_id"],
        status=status,
        language=language,
        subject=template["subject"],
        message=template["message"].format(**format_data),
    )


# =============================================================================
# Service Functions
# =============================================================================


def build_message_request(
    order_id: str,
    customer_name: str,
    product_name: str,
    status: ShippingStatus,
    company_name: str = "Acme T-Shirts",
    tone: MessageTone = MessageTone.FRIENDLY,
    language: SupportedLanguage = SupportedLanguage.ENGLISH,
    tracking_url: str | None = None,
    estimated_delivery: str | None = None,
) -> ShippingMessageRequest:
    """Build a shipping message request.

    Convenience function to construct a properly formatted request.

    Args:
        order_id: Order identifier.
        customer_name: Customer's first name.
        product_name: Name of the purchased product.
        status: Current shipping status.
        company_name: Retailer's name.
        tone: Message tone.
        language: Preferred language.
        tracking_url: Package tracking URL (optional).
        estimated_delivery: Estimated delivery date in ISO format (optional).

    Returns:
        ShippingMessageRequest ready to send to the agent.
    """
    return ShippingMessageRequest(
        brand_persona=BrandPersona(
            company_name=company_name,
            tone=tone.value,
            preferred_language=language.value,
        ),
        order=OrderContext(
            order_id=order_id,
            customer_name=customer_name,
            product_name=product_name,
            tracking_url=tracking_url,
            estimated_delivery=estimated_delivery,
        ),
        status=status.value,
    )


async def generate_shipping_message(
    request: ShippingMessageRequest,
    client: PostPurchaseAgentClient | None = None,
) -> ShippingMessageResponse:
    """Generate a shipping message using the Post-Purchase Agent.

    Handles fail-open behavior: returns fallback template if agent is unavailable.

    Args:
        request: Shipping message request with brand persona and order context.
        client: Optional custom client (uses default if not provided).

    Returns:
        ShippingMessageResponse with generated or fallback message.
    """
    if client is None:
        settings = get_settings()
        # Use post_purchase_agent_url if configured, otherwise fallback
        agent_url = getattr(settings, "post_purchase_agent_url", None)
        if agent_url:
            client = get_post_purchase_client(
                agent_url,
                getattr(settings, "post_purchase_agent_timeout", 15.0),
            )
        else:
            logger.info(
                "Post-purchase agent URL not configured, using fallback template"
            )
            return get_fallback_message(request)

    response = await client.generate_message(request)

    if response is None:
        logger.info(
            "Post-purchase agent unavailable for order %s, using fallback template",
            request["order"]["order_id"],
        )
        return get_fallback_message(request)

    return response


async def generate_shipping_messages_batch(
    requests: list[ShippingMessageRequest],
    client: PostPurchaseAgentClient | None = None,
) -> list[ShippingMessageResponse]:
    """Generate shipping messages for multiple orders in parallel.

    Designed for batch processing (e.g., webhook delivery).

    Args:
        requests: List of shipping message requests.
        client: Optional custom client for testing.

    Returns:
        List of ShippingMessageResponse in same order as input requests.
    """
    tasks = [generate_shipping_message(req, client) for req in requests]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Handle any exceptions by using fallback templates
    processed_results: list[ShippingMessageResponse] = []
    for i, result in enumerate(results):
        if isinstance(result, BaseException):
            logger.warning(
                "Exception generating message for order %s: %s",
                requests[i]["order"]["order_id"],
                result,
            )
            processed_results.append(get_fallback_message(requests[i]))
        else:
            processed_results.append(result)

    return processed_results
