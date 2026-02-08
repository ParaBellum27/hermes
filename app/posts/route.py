from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Dict, Any
from app.models import AuthUser
from app.services.content import content_service
from app.dependencies import get_current_user

router = APIRouter()

@router.get("/get-all-posts", response_model=List[Dict[str, Any]])
async def get_all_posts(
    current_user: AuthUser = Depends(get_current_user) # Authentication is required
):
    try:
        data = await content_service.get_all_creator_content()
        return data
    except Exception as e:
        print(f"Get all posts error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get all posts")
