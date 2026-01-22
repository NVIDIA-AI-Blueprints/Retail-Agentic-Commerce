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

    # Database
    database_url: str = "sqlite:///./agentic_commerce.db"

    # NIM Configuration
    nim_endpoint: str = "https://integrate.api.nvidia.com/v1"
    nim_api_key: str = ""

    # Webhook Configuration
    webhook_url: str = ""
    webhook_secret: str = ""

    # API Security
    api_key: str = ""

    # Promotion Agent Configuration
    promotion_agent_url: str = "http://localhost:8002"
    promotion_agent_timeout: float = 10.0  # seconds (NFR-LAT target)


@lru_cache
def get_settings() -> Settings:
    """Get cached application settings."""
    return Settings()
