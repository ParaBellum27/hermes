from typing import List, Optional, Dict, Any
from supabase import Client
from app.models import UserPost, UserPostRow

class UserPostRepository:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client

    def _map_row_to_user_post(self, row: Dict[str, Any]) -> UserPost:
        # Convert keys from snake_case to camelCase for Pydantic model
        mapped_data = {
            "post_id": row.get("post_id"),
            "user_id": row.get("user_id"),
            "title": row.get("title"),
            "raw_text": row.get("raw_text", ""),
            "status": row.get("status"),
            "editor_state": row.get("editor_state"),
            "scheduled_for": row.get("scheduled_for"),
            "published_at": row.get("published_at"),
            "word_count": row.get("word_count"),
            "inspiration_summary": row.get("inspiration_summary"),
            "created_at": row.get("created_at"),
            "updated_at": row.get("updated_at"),
        }
        return UserPost(**mapped_data)

    async def find_by_user_id(self, user_id: str) -> List[UserPost]:
        response = (self.supabase 
            .from_("user_posts") 
            .select("*") 
            .eq("user_id", user_id) 
            .order("updated_at", desc=True) 
            .execute()
        )

        if response.data:
            return [self._map_row_to_user_post(item) for item in response.data]
        return []

    async def find_by_id(self, post_id: str) -> Optional[UserPost]:
        response = (self.supabase 
            .from_("user_posts") 
            .select("*") 
            .eq("post_id", post_id) 
            .maybe_single() 
            .execute()
        )

        if response.data:
            return self._map_row_to_user_post(response.data)
        return None

    async def create(self, user_id: str, raw_text: Optional[str] = None, status: Optional[str] = None) -> UserPost:
        payload: Dict[str, Any] = {
            "user_id": user_id,
            "raw_text": raw_text or "",
        }
        if status:
            payload["status"] = status

        response = (self.supabase 
            .from_("user_posts") 
            .insert(payload) 
            .select("*") 
            .single() 
            .execute()
        )

        if response.data:
            return self._map_row_to_user_post(response.data)
        raise Exception("Failed to create post")

    async def update(self, post_id: str, title: Optional[str] = None, raw_text: Optional[str] = None, status: Optional[str] = None) -> UserPost:
        payload: Dict[str, Any] = {}
        if raw_text is not None:
            payload["raw_text"] = raw_text
        if title is not None:
            payload["title"] = title
        if status is not None:
            payload["status"] = status
        payload["updated_at"] = datetime.now().isoformat() # Update timestamp

        response = (self.supabase 
            .from_("user_posts") 
            .update(payload) 
            .eq("post_id", post_id) 
            .select("*") 
            .single() 
            .execute()
        )
        
        if response.data:
            return self._map_row_to_user_post(response.data)
        raise Exception("Failed to update post")

    async def delete(self, post_id: str) -> None:
        response = (self.supabase 
            .from_("user_posts") 
            .delete() 
            .eq("post_id", post_id) 
            .execute()
        )
        if response.count is None: # indicates an error or no row found/deleted
             raise Exception("Failed to delete post or no record found")
