from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from pyrewrite.models import AuthUser, UserPost, CreateUserPostRequest, UpdateUserPostRequest
from pyrewrite.services.user_post import user_post_service
from pyrewrite.dependencies import get_current_user

router = APIRouter()

@router.get("/", response_model=List[UserPost])
async def get_user_posts(
    user_id: str = Query(..., description="The ID of the user whose posts are to be retrieved"),
    current_user: AuthUser = Depends(get_current_user) # Authentication is required
):
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot access posts for another user."
        )

    try:
        posts = await user_post_service.fetch_user_posts(user_id)
        return posts
    except Exception as e:
        print(f"Fetch user posts error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch user posts")

@router.post("/", response_model=UserPost, status_code=status.HTTP_201_CREATED)
async def create_user_post(
    body: CreateUserPostRequest,
    current_user: AuthUser = Depends(get_current_user) # Authentication is required
):
    if body.userId != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot create posts for another user."
        )
    
    # RawText and Status are optional
    if not body.rawText and not body.title:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Either rawText or title must be provided to create a post.")

    try:
        new_post = await user_post_service.create_post(
            user_id=body.userId,
            raw_text=body.rawText,
            status=body.status,
        )
        return new_post
    except Exception as e:
        print(f"Create user post error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create user post")

@router.get("/{post_id}", response_model=UserPost)
async def get_single_user_post(
    post_id: str,
    current_user: AuthUser = Depends(get_current_user) # Authentication is required
):
    try:
        post = await user_post_service.fetch_post_by_id(post_id)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        
        # Ensure the authenticated user owns the post
        if post.user_id != current_user.id:
             raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Cannot access another user's post."
            )
        
        return post
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Fetch single post error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch post")

@router.patch("/{post_id}", response_model=UserPost)
async def update_user_post(
    post_id: str,
    body: UpdateUserPostRequest,
    current_user: AuthUser = Depends(get_current_user) # Authentication is required
):
    try:
        existing_post = await user_post_service.fetch_post_by_id(post_id)
        if not existing_post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        
        if existing_post.user_id != current_user.id:
             raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Cannot update another user's post."
            )

        updated_post = await user_post_service.update_post(
            post_id=post_id,
            title=body.title,
            raw_text=body.rawText,
            status=body.status
        )
        return updated_post
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Update post error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update post")

@router.delete("/{post_id}", status_code=status.HTTP_200_OK)
async def delete_user_post(
    post_id: str,
    current_user: AuthUser = Depends(get_current_user) # Authentication is required
):
    try:
        existing_post = await user_post_service.fetch_post_by_id(post_id)
        if not existing_post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        
        if existing_post.user_id != current_user.id:
             raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Cannot delete another user's post."
            )

        await user_post_service.delete_post(post_id)
        return {"success": True}
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Delete post error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete post")
