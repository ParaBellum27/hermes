from typing import Dict, Any, Optional, List
from supabase import Client
from pyrewrite.models import UserDataRow

class UserDataRepository:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client

    async def find_by_user_id_and_key(self, user_id: str, key: str) -> Optional[Dict[str, Any]]:
        # print(f"[UserDataRepository] Query: userId={user_id}, key={key}")
        response = (self.supabase 
            .from_("user_data") 
            .select("data") 
            .eq("user_id", user_id) 
            .eq("key", key) 
            .maybe_single() 
            .execute()
        )

        # print(f"[UserDataRepository] Result:", {"data": response.data})

        if response.data:
            return response.data.get("data") # Extract the 'data' field
        return None

    async def upsert(self, user_id: str, key: str, data: Dict[str, Any]) -> None:
        payload = {
            "user_id": user_id,
            "key": key,
            "data": data,
        }
        response = self.supabase.from_("user_data").upsert(
            payload,
            on_conflict="user_id,key"
        ).execute()

        if response.count is None: # indicates an error or no row found/inserted/updated
             raise Exception("Failed to upsert user data")

    async def delete(self, user_id: str, key: str) -> None:
        response = self.supabase.from_("user_data").delete().eq("user_id", user_id).eq("key", key).execute()
        if response.count is None:
            raise Exception("Failed to delete user data or no record found")

    async def find_by_user_id_and_key_pattern(self, user_id: str, key_pattern: str) -> List[UserDataRow]:
        response = self.supabase.from_("user_data").select("*").eq("user_id", user_id).like("key", key_pattern).execute()
        if response.data:
            return [UserDataRow(**item) for item in response.data]
        return []

