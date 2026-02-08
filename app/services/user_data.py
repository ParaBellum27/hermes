from typing import Dict, Any, Optional
from pyrewrite.repositories.user_data import UserDataRepository
from pyrewrite.supabase_client import supabase_service_client

class UserDataService:
    def __init__(self, user_data_repo: UserDataRepository):
        self.user_data_repo = user_data_repo

    async def load_data(self, user_id: str, key: str) -> Optional[Dict[str, Any]]:
        return await self.user_data_repo.find_by_user_id_and_key(user_id, key)

    async def save_data(self, user_id: str, key: str, data: Dict[str, Any]) -> None:
        await self.user_data_repo.upsert(user_id, key, data)

    async def delete_data(self, user_id: str, key: str) -> None:
        await self.user_data_repo.delete(user_id, key)

    async def find_by_key_pattern(self, user_id: str, key_pattern: str) -> List[Dict[str, Any]]: # Returning raw dict for now
        rows = await self.user_data_repo.find_by_user_id_and_key_pattern(user_id, key_pattern)
        return [{"key": row.key, "data": row.data} for row in rows]

# Singleton instance with injected repository
user_data_repository = UserDataRepository(supabase_service_client)
user_data_service = UserDataService(user_data_repository)
