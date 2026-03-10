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

"""
MCP Tools for the ACP Merchant App.

This module exports all available tools for the MCP server:
- search_products: Search products (entry point, exposes widget URI)
- add_to_cart: Add a product to the shopping cart
- remove_from_cart: Remove a product from the cart
- get_cart: Get cart contents
- update_cart_quantity: Update item quantity in cart
- checkout: Process checkout via ACP payment flow
- create_acp_session / update_acp_session: ACP session management
"""

from src.apps_sdk.tools.acp_sessions import (
    ACPSessionError,
    create_acp_session,
    update_acp_session,
)
from src.apps_sdk.tools.cart import (
    add_to_cart,
    get_cart,
    remove_from_cart,
    update_cart_quantity,
)
from src.apps_sdk.tools.checkout import checkout
from src.apps_sdk.tools.recommendations import search_products

__all__ = [
    "search_products",
    "add_to_cart",
    "remove_from_cart",
    "get_cart",
    "update_cart_quantity",
    "checkout",
    "ACPSessionError",
    "create_acp_session",
    "update_acp_session",
]
