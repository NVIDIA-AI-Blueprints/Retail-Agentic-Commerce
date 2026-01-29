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
