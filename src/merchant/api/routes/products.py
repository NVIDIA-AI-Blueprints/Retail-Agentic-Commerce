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

"""Product lookup endpoint for the Agentic Commerce middleware."""

from typing import TypedDict

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from src.merchant.db.database import get_session
from src.merchant.db.models import Product

router = APIRouter(tags=["products"])


class ProductResponse(TypedDict):
    """Product response schema."""

    id: str
    sku: str
    name: str
    base_price: int
    stock_count: int
    min_margin: float
    image_url: str


@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: str,
    db: Session = Depends(get_session),
) -> ProductResponse:
    """Retrieve a product by its ID.

    Args:
        product_id: The unique product identifier (e.g., "prod_1").
        db: Database session (injected).

    Returns:
        ProductResponse: Product details including price, stock, and image.

    Raises:
        HTTPException: 404 if product not found.
    """
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product {product_id} not found")
    return ProductResponse(
        id=product.id,
        sku=product.sku,
        name=product.name,
        base_price=product.base_price,
        stock_count=product.stock_count,
        min_margin=product.min_margin,
        image_url=product.image_url,
    )
