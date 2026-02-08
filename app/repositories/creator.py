from typing import List, Optional
from supabase import Client
from app.models import CreatorProfile

class CreatorRepository:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client

    async def find_all(self) -> List[CreatorProfile]:
        response = self.supabase.from_('creator_profiles').select('*').order('created_at', desc=True).execute()
        # The execute() method returns a PostgrestAPIResponse object
        # The data is in response.data
        if response.data:
            return [CreatorProfile(**item) for item in response.data]
        return []

    async def find_by_id(self, creator_id: int) -> Optional[CreatorProfile]:
        response = self.supabase.from_('creator_profiles').select('*').eq('creator_id', creator_id).single().execute()
        if response.data:
            return CreatorProfile(**response.data)
        return None

    async def find_by_profile_url(self, profile_url: str) -> Optional[CreatorProfile]:
        response = self.supabase.from_('creator_profiles').select('*').eq('profile_url', profile_url).single().execute()
        if response.data:
            return CreatorProfile(**response.data)
        return None

    async def create(self, profile_url: str, platform: str, display_name: Optional[str] = None) -> CreatorProfile:
        data = {
            "profile_url": profile_url,
            "platform": platform,
            "display_name": display_name,
        }
        response = self.supabase.from_('creator_profiles').insert(data).execute()
        if response.data:
            return CreatorProfile(**response.data[0])
        raise Exception("Failed to create creator")
