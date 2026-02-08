from typing import List, Optional
from supabase import Client
from app.models import CreatorProfile, UserFollow

class UserFollowRepository:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client

    async def find_by_user_id_with_profiles(self, user_id: str) -> List[CreatorProfile]:
        # Perform the join with creator_profiles
        response = (self.supabase 
            .from_('user_follows') 
            .select('creator_id, created_at, creator_profiles(*)') 
            .eq('user_id', user_id) 
            .order('created_at', desc=True) 
            .execute()
        )

        if response.data:
            creators = []
            for item in response.data:
                if 'creator_profiles' in item and item['creator_profiles']:
                    creators.append(CreatorProfile(**item['creator_profiles']))
            return creators
        return []

    async def upsert(self, user_id: str, creator_id: int) -> UserFollow:
        data = {
            "user_id": user_id,
            "creator_id": creator_id,
        }
        response = self.supabase.from_('user_follows').upsert(data, on_conflict="user_id,creator_id").execute()
        if response.data:
            return UserFollow(**response.data[0])
        raise Exception("Failed to upsert user follow")

    async def delete(self, user_id: str, creator_id: int) -> None:
        response = self.supabase.from_('user_follows').delete().eq('user_id', user_id).eq('creator_id', creator_id).execute()
        # Supabase client delete doesn't return data, just checks for errors
        if response.count is None: # indicates an error or no row found/deleted
             raise Exception("Failed to delete user follow or no record found")

    async def find_creator_ids_by_user_id(self, user_id: str) -> List[int]:
        response = self.supabase.from_('user_follows').select('creator_id').eq('user_id', user_id).execute()
        if response.data:
            return [item['creator_id'] for item in response.data]
        return []

    async def exists(self, user_id: str, creator_id: int) -> bool:
        response = self.supabase.from_('user_follows').select('user_id').eq('user_id', user_id).eq('creator_id', creator_id).maybe_single().execute()
        return response.data is not None
