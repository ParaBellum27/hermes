from typing import List, Optional
from supabase import Client
from pyrewrite.models import CreatorContentWithProfile, CreatorContent, CreatorProfileForContent # Import the new models

class ContentRepository:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client

    async def find_all_with_profiles(
        self, limit: int = 1000, offset: int = 0
    ) -> List[CreatorContentWithProfile]:
        response = (self.supabase
            .from_("creator_content") 
            .select(
                "*, creator_profiles!inner(creator_id, profile_url, platform, display_name)"
            ) 
            .order("created_at", desc=True) 
            .range(offset, offset + limit - 1) 
            .execute()
        )
        if response.data:
            # Map the response data to CreatorContentWithProfile Pydantic models
            # The structure from supabase client (postgrest-py) maps nested selects
            # into a dictionary under the table name by default.
            # So, creator_profiles data will be under 'creator_profiles' key directly.
            return [CreatorContentWithProfile(**item) for item in response.data]
        return []

    async def find_by_creator_id(self, creator_id: int) -> List[CreatorContent]:
        response = (self.supabase 
            .from_("creator_content") 
            .select("*") 
            .eq("creator_id", creator_id) 
            .order("content_id", desc=True) 
            .execute()
        )
        if response.data:
            return [CreatorContent(**item) for item in response.data]
        return []

    async def find_by_post_url(self, post_url: str) -> Optional[CreatorContent]:
        response = (self.supabase 
            .from_("creator_content") 
            .select("*") 
            .eq("post_url", post_url) 
            .single() 
            .execute()
        )
        if response.data:
            return CreatorContent(**response.data)
        return None

    async def create(
        self, creator_id: int, post_url: str, post_raw: Optional[str] = None
    ) -> None:
        data = {
            "creator_id": creator_id,
            "post_url": post_url,
            "post_raw": post_raw,
        }
        response = self.supabase.from_("creator_content").insert(data).execute()
        if response.count is None: # Indicates an error or no row inserted
             raise Exception("Failed to create content")

    async def count(self) -> int:
        response = (self.supabase 
            .from_("creator_content") 
            .select("*", count="exact", head=True) 
            .execute()
        )
        return response.count if response.count is not None else 0

    async def find_all_for_stats(self) -> List[dict]: # Returns raw dicts as per original TS
        response = (self.supabase 
            .from_("creator_content") 
            .select("creator_id, post_raw") 
            .execute()
        )
        if response.data:
            return response.data
        return []
