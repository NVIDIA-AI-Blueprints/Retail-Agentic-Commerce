"""UCP discovery profile helpers."""

from src.merchant.api.ucp_schemas import (
    UCPBusinessProfile,
    UCPCapabilityVersion,
    UCPMetadata,
    UCPPaymentHandler,
    UCPService,
    UCPSigningKey,
)
from src.merchant.config import get_settings


def build_business_profile(request_base_url: str | None = None) -> UCPBusinessProfile:
    """Build static UCP business profile from configuration.

    Returns a minimal discovery profile with:
    - dev.ucp.shopping service (REST transport)
    - dev.ucp.shopping.checkout capability
    - dev.ucp.shopping.fulfillment extension
    - dev.ucp.shopping.discount capability
    - Optional static payment handler block
    - Top-level signing_keys for webhook verification

    Args:
        request_base_url: Fallback base URL from request if ucp_base_url not configured.
    """
    settings = get_settings()

    base_url = settings.ucp_base_url or request_base_url
    if not base_url:
        raise ValueError("ucp_base_url not configured and no request base URL provided")

    service_endpoint = f"{base_url.rstrip('/')}{settings.ucp_service_path}"

    signing_keys: list[UCPSigningKey] | None = None
    if settings.ucp_signing_key_x:
        signing_keys = [
            UCPSigningKey(
                kid=settings.ucp_signing_key_id,
                kty=settings.ucp_signing_key_kty,
                crv=settings.ucp_signing_key_crv,
                x=settings.ucp_signing_key_x,
                y=settings.ucp_signing_key_y or None,
                alg=settings.ucp_signing_key_alg,
            )
        ]

    return UCPBusinessProfile(
        ucp=UCPMetadata(
            version=settings.ucp_version,
            services={
                "dev.ucp.shopping": [
                    UCPService(
                        version=settings.ucp_version,
                        transport="rest",
                        endpoint=service_endpoint,
                    )
                ]
            },
            capabilities={
                "dev.ucp.shopping.checkout": [
                    UCPCapabilityVersion(version=settings.ucp_version)
                ],
                "dev.ucp.shopping.fulfillment": [
                    UCPCapabilityVersion(
                        version=settings.ucp_version,
                        extends="dev.ucp.shopping.checkout",
                    )
                ],
                "dev.ucp.shopping.discount": [
                    UCPCapabilityVersion(version=settings.ucp_version)
                ],
            },
            payment_handlers={
                "com.example.processor_tokenizer": [
                    UCPPaymentHandler(
                        id="processor_tokenizer",
                        version=settings.ucp_version,
                        config=None,
                    )
                ]
            },
        ),
        signing_keys=signing_keys,
    )
