"""UCP discovery endpoint."""

from fastapi import APIRouter, Request

from src.merchant.api.ucp_schemas import UCPBusinessProfile
from src.merchant.services.ucp import build_business_profile

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
