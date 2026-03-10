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

    # UCP Discovery Configuration
    ucp_version: str = "2026-01-23"
    ucp_base_url: str | None = (
        None  # Fully qualified base URL; None derives from request
    )
    ucp_business_name: str | None = None
    ucp_continue_url: str | None = None  # Fallback URL for negotiation failures
    ucp_order_webhook_url: str = "http://localhost:3000/api/webhooks/ucp"

    # UCP Signing Key (public key for webhook verification)
    ucp_signing_key_id: str = "ucp-key-1"
    ucp_signing_key_kty: str = "EC"  # "EC" or "OKP"
    ucp_signing_key_crv: str = "P-256"  # "P-256" or "Ed25519"
    ucp_signing_key_alg: str = "ES256"  # "ES256" or "EdDSA"
    ucp_signing_key_x: str = ""  # Base64url-encoded public key x
    ucp_signing_key_y: str = ""  # Base64url-encoded public key y (EC only)

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
