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

"""UCP discovery endpoint."""

from fastapi import APIRouter, Request

from src.merchant.protocols.ucp.api.schemas.checkout import UCPBusinessProfile
from src.merchant.protocols.ucp.services.negotiation import build_business_profile

router = APIRouter(tags=["ucp"])


@router.get(
    "/.well-known/ucp",
    response_model=UCPBusinessProfile,
    summary="UCP Business Profile Discovery",
    description="Returns the merchant's UCP profile with capabilities. Public endpoint.",
)
async def get_ucp_profile(request: Request) -> UCPBusinessProfile:
    """Return static UCP business profile for discovery."""
    request_base_url = str(request.base_url).rstrip("/")
    return build_business_profile(request_base_url=request_base_url)
