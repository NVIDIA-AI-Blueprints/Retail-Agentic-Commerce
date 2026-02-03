"""Application configuration using pydantic-settings."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = "Agentic Commerce Middleware"
    app_version: str = "0.1.0"
    debug: bool = False
    log_level: str = "INFO"  # DEBUG, INFO, WARNING, ERROR
    log_sql: bool = False  # Enable verbose SQL logging (very noisy)

    # Database
    database_url: str = "sqlite:///./agentic_commerce.db"

    # Webhook Configuration (Merchant → Client Agent)
    # Default to localhost for local development; Docker overrides via environment
    webhook_url: str = "http://localhost:3000/api/webhooks/acp"
    webhook_secret: str = "whsec_demo_secret"

    # Merchant API Security (for client authentication)
    merchant_api_key: str = ""

    # Promotion Agent Configuration
    promotion_agent_url: str = "http://localhost:8002"
    promotion_agent_timeout: float = 10.0  # seconds (NFR-LAT target)

    # Post-Purchase Agent Configuration
    post_purchase_agent_url: str = "http://localhost:8003"
    post_purchase_agent_timeout: float = 15.0  # seconds


@lru_cache
def get_settings() -> Settings:
    """Get cached application settings."""
    return Settings()
