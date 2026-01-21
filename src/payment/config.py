"""Payment service configuration using pydantic-settings."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class PaymentSettings(BaseSettings):
    """Payment service settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = "PSP Delegated Payments"
    app_version: str = "0.1.0"
    debug: bool = False

    # Database (shared with merchant service)
    database_url: str = "sqlite:///./agentic_commerce.db"

    # PSP API Security
    psp_api_key: str = ""


@lru_cache
def get_payment_settings() -> PaymentSettings:
    """Get cached payment service settings."""
    return PaymentSettings()
