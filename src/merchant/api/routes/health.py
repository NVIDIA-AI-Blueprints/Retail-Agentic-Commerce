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

"""Health check endpoint for the Agentic Commerce middleware."""

from typing import TypedDict

from fastapi import APIRouter

from src.merchant.config import get_settings

router = APIRouter(tags=["health"])


class HealthResponse(TypedDict):
    """Health check response schema."""

    status: str
    version: str


@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    """Return the health status of the application.

    Returns:
        HealthResponse: A dictionary containing status and version.
    """
    settings = get_settings()
    return HealthResponse(
        status="healthy",
        version=settings.app_version,
    )
