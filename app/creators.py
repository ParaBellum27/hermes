from fastapi import APIRouter, HTTPException, Request, status, Query, Depends
from typing import List, Dict, Any
from pyrewrite.services.creator import creator_service
from pyrewrite.models import CreatorProfile, FollowRequestBody, AuthUser
from pyrewrite.dependencies import get_current_user

router = APIRouter()

@router.get("/get-all-creators", response_model=List[CreatorProfile])
async def get_all_creators(
    request: Request,
    current_user: AuthUser = Depends(get_current_user) # Authentication required, but user ID not directly used in this specific endpoint logic.
):
    try:
        creators = await creator_service.get_all_creators()
        return creators
    except Exception as e:
        print(f"Get all creators error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unknown error")

@router.get("/get-followed-creators", response_model=List[CreatorProfile])
async def get_followed_creators(
    request: Request,
    current_user: AuthUser = Depends(get_current_user)
):
    try:
        creators = await creator_service.get_followed_creators_with_profiles(current_user.id)
        return creators
    except Exception as e:
        print(f"Get followed creators error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unknown error")

@router.post("/follow")
async def follow_creator(
    request: Request,
    body: FollowRequestBody,
    current_user: AuthUser = Depends(get_current_user)
):
    try:
        result = await creator_service.follow_creator(current_user.id, body.creatorId)
        return result
    except Exception as e:
        print(f"Follow creator error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unknown error")

@router.delete("/unfollow")
async def unfollow_creator(
    request: Request,
    body: FollowRequestBody,
    current_user: AuthUser = Depends(get_current_user)
):
    try:
        result = await creator_service.unfollow_creator(current_user.id, body.creatorId)
        return result
    except Exception as e:
        print(f"Unfollow creator error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unknown error")

