from typing import List, Optional
from app.models import UserPost, CreateUserPostRequest, UpdateUserPostRequest
from app.repositories.user_post import UserPostRepository
from app.supabase_client import supabase_service_client

class UserPostService:
    def __init__(self, repository: UserPostRepository):
        self.repository = repository

    async def fetch_user_posts(self, user_id: str) -> List[UserPost]:
        return await self.repository.find_by_user_id(user_id)

    async def create_post(
        self,
        user_id: str,
        raw_text: Optional[str] = None,
        status: Optional[str] = None,
    ) -> UserPost:
        return await self.repository.create(
            user_id=user_id,
            raw_text=raw_text,
            status=status,
        )
    
    async def update_post(
        self,
        post_id: str,
        title: Optional[str] = None,
        raw_text: Optional[str] = None,
        status: Optional[str] = None
    ) -> UserPost:
        return await self.repository.update(post_id, title, raw_text, status)

    async def delete_post(self, post_id: str) -> None:
        return await self.repository.delete(post_id)

    async def fetch_post_by_id(self, post_id: str) -> Optional[UserPost]:
        return await self.repository.find_by_id(post_id)


# Singleton instance with injected repository
user_post_repository = UserPostRepository(supabase_service_client)
user_post_service = UserPostService(user_post_repository)
