from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List
from app.models import ContentPost, AuthUser
from app.services.content import content_service
from app.dependencies import get_current_user

router = APIRouter()

@router.get("/fetch", response_model=List[ContentPost])
async def fetch_content(
    current_user: AuthUser = Depends(get_current_user), # Authentication is required
    limit: int = Query(1000, description="Limit the number of content posts to fetch"),
    offset: int = Query(0, description="Offset for pagination")
):
    try:
        content_posts = await content_service.fetch_creator_content(limit=limit, offset=offset)
        return content_posts
    except Exception as e:
        print(f"Fetch content error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch content")
