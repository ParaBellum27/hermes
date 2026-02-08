from fastapi import HTTPException, status, Request, Depends
from typing import Optional
from app.models import AuthUser
from app.supabase_client import get_supabase_client
from supabase import Client

# This will need to be replaced with the actual project ref from Supabase
# or dynamically retrieved if necessary. For now, using a placeholder.
SUPABASE_PROJECT_REF = "your-supabase-project-ref"

async def get_current_user(request: Request) -> AuthUser:
    supabase_client: Client = get_supabase_client()
    access_token: Optional[str] = None

    # Supabase session token is typically stored in a cookie.
    # The exact name might vary, often sb-<project-ref>-auth-token
    # We will iterate through cookies to find one that looks like a Supabase session
    for cookie_name, cookie_value in request.cookies.items():
        if cookie_name.startswith(f"sb-{SUPABASE_PROJECT_REF}-auth-token"):
            access_token = cookie_value
            break

    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated: No access token found in cookies",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        # Verify the access token using Supabase
        # Note: supabase-py's client.auth.get_user returns a UserResponse object
        user_response = await supabase_client.auth.get_user(access_token)
        user = user_response.user

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated: Invalid access token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # You might need to adjust the field names based on the actual Supabase User object structure
        return AuthUser(id=user.id, email=user.email)

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated: Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Example of how to use this dependency in a route:
# @router.get("/protected-route")
# async def protected_route(current_user: AuthUser = Depends(get_current_user)):
#     return {"message": f"Hello, {current_user.email}! You are authenticated."}
