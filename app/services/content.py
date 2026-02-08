import json
from typing import List, Dict, Any, Optional
from datetime import datetime
from pyrewrite.models import ContentPost, CreatorContentWithProfile, PostStats, PostMedia, Article, CreatorProfile
from pyrewrite.repositories.content import ContentRepository
from pyrewrite.repositories.creator import CreatorRepository
from pyrewrite.repositories.user_follow import UserFollowRepository
from pyrewrite.supabase_client import supabase_service_client
from pyrewrite.utils import format_post_title, format_time_ago, extract_name_from_url

class ContentService:
    def __init__(
        self,
        content_repo: ContentRepository,
        creator_repo: CreatorRepository,
        user_follow_repo: UserFollowRepository
    ):
        self.content_repo = content_repo
        self.creator_repo = creator_repo
        self.user_follow_repo = user_follow_repo

    async def fetch_creator_content(self, limit: int = 1000, offset: int = 0) -> List[ContentPost]:
        data = await self.content_repo.find_all_with_profiles(limit=limit, offset=offset)

        posts: List[ContentPost] = []
        for item in data:
            parsed_post: Optional[Dict[str, Any]] = None
            text = ""
            stats: Optional[PostStats] = None
            media: Optional[List[PostMedia]] = None
            article: Optional[Article] = None
            posted_at_date: Optional[str] = None
            posted_at_timestamp: Optional[int] = None
            post_type: Optional[str] = None

            try:
                if item.post_raw and item.post_raw.strip().startswith('{'):
                    parsed_post = json.loads(item.post_raw)
            except json.JSONDecodeError:
                # Not JSON, treat as plain text
                pass

            if parsed_post:
                text = parsed_post.get('text', '')
                stats_data = parsed_post.get('stats')
                if stats_data:
                    stats = PostStats(**stats_data)
                
                media_data = parsed_post.get('media')
                if media_data:
                    media = [PostMedia(**m) for m in media_data]

                article_data = parsed_post.get('article')
                if article_data:
                    article = Article(**article_data)

                posted_at_info = parsed_post.get('posted_at')
                if posted_at_info:
                    posted_at_date = posted_at_info.get('date')
                    posted_at_timestamp = posted_at_info.get('timestamp')
                post_type = parsed_post.get('post_type')
            else:
                text = item.post_raw if item.post_raw else ''

            author = item.creator_profiles.display_name or extract_name_from_url(item.creator_profiles.profile_url)
            
            # Use original created_at if postedAtTimestamp is not available from parsed_post
            effective_posted_at_timestamp = posted_at_timestamp if posted_at_timestamp is not None else int(item.created_at.timestamp() * 1000)
            
            # Use parsed_post relative if available, else format item.created_at
            time_ago_str = None
            if parsed_post and parsed_post.get('posted_at') and parsed_post.get('posted_at').get('relative'):
                time_ago_parts = parsed_post['posted_at']['relative'].split('•')
                if time_ago_parts:
                    time_ago_str = time_ago_parts[0].strip()
            
            if time_ago_str is None:
                time_ago_str = format_time_ago(item.created_at.isoformat())

            posts.append(ContentPost(
                id=item.content_id,
                title=format_post_title(text),
                author=author,
                timeAgo=time_ago_str,
                isHighlighted=False, # Default as per TS
                creatorId=item.creator_id,
                postUrl=item.post_url,
                postRaw=text,
                text=text,
                postedAt=posted_at_date,
                postedAtTimestamp=effective_posted_at_timestamp,
                postType=post_type,
                stats=stats,
                media=media,
                article=article,
            ))
        
        # Sort by LinkedIn post date (newest first)
        return sorted(posts, key=lambda p: p.postedAtTimestamp if p.postedAtTimestamp is not None else 0, reverse=True)

    async def save_content(self, creator_id: int, post_url: str, post_raw: Optional[str] = None) -> None:
        return await self.content_repo.create(creator_id, post_url, post_raw)

    async def get_post_count(self) -> int:
        return await self.content_repo.count()

    async def fetch_creators(self, user_id: Optional[str] = None) -> List[CreatorProfile]: # Returning CreatorProfile for now, original returns Profile
        # Fetch all creator profiles from database
        data = await self.creator_repo.find_all()

        # Business logic: Build a map of creator IDs to follow timestamps for O(1) lookup
        followed_creators_map = {} # type: Dict[int, str]

        if user_id:
            try:
                profiles = await self.user_follow_repo.find_by_user_id_with_profiles(user_id)
                profiles_with_ids = [p for p in profiles if p.creator_id is not None]
                for profile in profiles_with_ids:
                    followed_creators_map[profile.creator_id] = datetime.now().isoformat() # Placeholder for actual followed_at date
            except Exception as e:
                print(f"Failed to load followed creators: {e}")

        # Fetch posts with stats for each creator
        content_data = await self.content_repo.find_all_for_stats()

        # Business logic: Calculate post counts and average stats per creator
        creator_stats = {} # type: Dict[int, Dict[str, Any]]

        if content_data:
            for item in content_data:
                creator_id = item['creator_id']
                existing = creator_stats.get(creator_id, {'count': 0, 'totalReactions': 0, 'totalComments': 0, 'totalReposts': 0})
                existing['count'] += 1

                if item['post_raw'] and item['post_raw'].strip().startswith('{'):
                    try:
                        parsed = json.loads(item['post_raw'])
                        if parsed.get('stats'):
                            existing['totalReactions'] += parsed['stats'].get('total_reactions', 0)
                            existing['totalComments'] += parsed['stats'].get('comments', 0)
                            existing['totalReposts'] += parsed['stats'].get('reposts', 0)
                    except json.JSONDecodeError:
                        pass
                creator_stats[creator_id] = existing

        # Transform database model to UI model, enriching with follow status and stats
        # Note: The original TypeScript returns a `Profile` type which is a blend of CreatorProfile and follow/stats data.
        # For simplicity, we are returning CreatorProfile for now, but this will need to be adjusted
        # if the frontend strictly relies on the `Profile` type with all its fields.
        return [
            CreatorProfile( # Using CreatorProfile as a placeholder
                id=str(creator.creator_id), # Assuming ID can be string for Pydantic
                creator_id=creator.creator_id,
                profile_url=creator.profile_url,
                display_name=creator.display_name,
                platform=creator.platform,
                created_at=creator.created_at,
                # isFollowed=followed_creators_map.has_key(creator.creator_id), # Not directly in CreatorProfile
                # postCount=creator_stats.get(creator.creator_id, {}).get('count', 0),
                # avgReactions=creator_stats.get(creator.creator_id, {}).get('totalReactions', 0)
            )
            for creator in data
        ]

    async def get_all_creator_content(self) -> List[Dict[str, Any]]: # Returns raw dicts as per original TS
        data = await self.content_repo.find_all_for_stats()
        return data

# Singleton instance with injected repositories
content_repository = ContentRepository(supabase_service_client)
creator_repository = CreatorRepository(supabase_service_client)
user_follow_repository = UserFollowRepository(supabase_service_client)
content_service = ContentService(content_repository, creator_repository, user_follow_repository)
