"""Configuration settings for the Apps SDK MCP Server."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class AppsSdkSettings(BaseSettings):
    """Settings for the Apps SDK MCP Server.

    All settings can be overridden via environment variables with the same name.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # App metadata
    app_name: str = "ACP Merchant Widget"
    app_version: str = "0.1.0"
    debug: bool = True

    # Server config
    mcp_server_port: int = 2091

    # Backend URLs
    merchant_api_url: str = "http://localhost:8000"
    psp_api_url: str = "http://localhost:8001"
    arag_agent_url: str = "http://localhost:8004"

    # API keys
    api_key: str = "your-api-key"
    psp_api_key: str = "psp-api-key-12345"


@lru_cache
def get_apps_sdk_settings() -> AppsSdkSettings:
    """Get cached Apps SDK settings instance.

    Returns:
        AppsSdkSettings: The settings instance.
    """
    return AppsSdkSettings()
