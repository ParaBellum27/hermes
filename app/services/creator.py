from typing import List, Dict, Any
from pyrewrite.models import CreatorProfile, UserFollow
from pyrewrite.repositories.creator import CreatorRepository
from pyrewrite.repositories.user_follow import UserFollowRepository
from pyrewrite.supabase_client import supabase_service_client

class CreatorService:
    def __init__(self, creator_repo: CreatorRepository, user_follow_repo: UserFollowRepository):
        self.creator_repo = creator_repo
        self.user_follow_repo = user_follow_repo

    async def get_all_creators(self) -> List[CreatorProfile]:
        return await self.creator_repo.find_all()

    async def get_followed_creators_with_profiles(self, user_id: str) -> List[CreatorProfile]:
        return await self.user_follow_repo.find_by_user_id_with_profiles(user_id)

    async def follow_creator(self, user_id: str, creator_id: int) -> Dict[str, Any]:
        data = await self.user_follow_repo.upsert(user_id, creator_id)
        return {"data": data.model_dump(), "isFollowed": True} # Convert Pydantic model to dict

    async def unfollow_creator(self, user_id: str, creator_id: int) -> Dict[str, Any]:
        await self.user_follow_repo.delete(user_id, creator_id)
        return {"data": {"user_id": user_id, "creator_id": creator_id}, "isFollowed": False}

# Singleton instance with injected repositories
creator_repository = CreatorRepository(supabase_service_client)
user_follow_repository = UserFollowRepository(supabase_service_client)
creator_service = CreatorService(creator_repository, user_follow_repository)