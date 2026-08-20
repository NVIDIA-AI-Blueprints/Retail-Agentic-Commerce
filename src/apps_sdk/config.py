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
    recommendation_agent_url: str = "http://localhost:8004"
    search_agent_url: str = "http://localhost:8005"

    # Search tuning — calibrated for embedder nemotron-3-embed-1b.
    # Genuine matches sit at distance ~1.05-1.63, so cutoff = 2.0.
    # Minimum similarity, kept consistent: 1/(1+2.0) ≈ 0.33.
    search_min_similarity: float = 0.33
    # Max distance to keep a result (0 = off).
    search_distance_cutoff: float = 2.0

    # API keys for calling merchant and PSP services
    merchant_api_key: str = "merchant-api-key-12345"
    psp_api_key: str = "psp-api-key-12345"


@lru_cache
def get_apps_sdk_settings() -> AppsSdkSettings:
    """Get cached Apps SDK settings instance.

    Returns:
        AppsSdkSettings: The settings instance.
    """
    return AppsSdkSettings()
