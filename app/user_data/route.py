from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Dict, Any
from pyrewrite.models import AuthUser, UserDataPutRequest
from pyrewrite.services.user_data import user_data_service
from pyrewrite.dependencies import get_current_user

router = APIRouter()

@router.get("/{key}")
async def get_user_data(
    key: str,
    user_id: str = Query(..., description="The ID of the user whose data is to be retrieved"),
    current_user: AuthUser = Depends(get_current_user) # Authentication is required
):
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot access data for another user."
        )

    try:
        data = await user_data_service.load_data(user_id, key)
        if data is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User data not found for this key")
        return {"data": data}
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Fetch user data error for key {key}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch user data")

@router.put("/{key}")
async def put_user_data(
    key: str,
    body: UserDataPutRequest,
    current_user: AuthUser = Depends(get_current_user) # Authentication is required
):
    if body.userId != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot modify data for another user."
        )

    try:
        await user_data_service.save_data(body.userId, key, body.data)
        return {"success": True}
    except Exception as e:
        print(f"Save user data error for key {key}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to save user data")
