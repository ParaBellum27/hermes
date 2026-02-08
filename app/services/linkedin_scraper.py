import os
import re
import json
from typing import List, Dict, Any, Optional
import httpx
from pyrewrite.models import (
    ApiMaestroPost, ScrapeResult, CreatorProfile, CreatorContent, UserFollow
)
from pyrewrite.repositories.creator import CreatorRepository
from pyrewrite.repositories.content import ContentRepository
from pyrewrite.repositories.user_follow import UserFollowRepository
from pyrewrite.supabase_client import supabase_service_client

APIFY_ACTOR_ID = "apimaestro~linkedin-profile-posts"

class LinkedInScraperService:
    def __init__(
        self,
        apify_token: str,
        creator_repo: CreatorRepository,
        content_repo: ContentRepository,
        user_follow_repo: UserFollowRepository
    ):
        self.apify_token = apify_token
        self.creator_repo = creator_repo
        self.content_repo = content_repo
        self.user_follow_repo = user_follow_repo
        self.http_client = httpx.AsyncClient()

    async def scrape_profiles(self, profile_urls: List[str], user_id: str) -> ScrapeResult:
        if not profile_urls:
            raise ValueError("Profile URLs are required")

        all_posts = await self._fetch_posts_from_apify(profile_urls)

        if not all_posts:
            return ScrapeResult(
                success=False,
                postsScraped=0,
                error="No posts found for any profile",
                urlsSent=profile_urls,
            )

        await self._save_posts_and_auto_follow(all_posts, user_id)

        return ScrapeResult(
            success=True,
            postsScraped=len(all_posts),
            posts=all_posts[:5],  # Return first 5 for debugging
        )

    async def _fetch_posts_from_apify(self, profile_urls: List[str]) -> List[ApiMaestroPost]:
        all_posts: List[ApiMaestroPost] = []

        for profile_url in profile_urls:
            url_match = re.search(r"linkedin\.com/in/([^\/\?]+)", profile_url)
            username = url_match.group(1) if url_match else profile_url

            input_body = {"username": username}

            apify_url = f"https://api.apify.com/v2/acts/{APIFY_ACTOR_ID}/run-sync-get-dataset-items?token={self.apify_token}"

            try:
                run_response = await self.http_client.post(
                    apify_url,
                    headers={"Content-Type": "application/json"},
                    json=input_body,
                    timeout=httpx.Timeout(120.0) # Increased timeout for scraping
                )
                run_response.raise_for_status() # Raise an exception for bad status codes

                response_text = run_response.text

                if not response_text.strip():
                    print(f"Empty response for {username}")
                    continue

                results = json.loads(response_text)
                posts = self._extract_posts_from_response(results)
                all_posts.extend(posts)

            except httpx.HTTPStatusError as e:
                print(f"Apify HTTP error for {username}: {e.response.status_code} - {e.response.text[:500]}")
            except httpx.RequestError as e:
                print(f"Apify request error for {username}: {e}")
            except json.JSONDecodeError as e:
                print(f"Invalid JSON response for {username}: {e}")
            except Exception as e:
                print(f"Unexpected error fetching posts for {username}: {e}")

        return all_posts

    def _extract_posts_from_response(self, results: Any) -> List[ApiMaestroPost]:
        # Handle wrapped response format: [{ success, data: { posts } }]
        if isinstance(results, list) and results and isinstance(results[0], dict) and 
           results[0].get('success') and results[0].get('data') and results[0]['data'].get('posts'):
            return [ApiMaestroPost(**p) for p in results[0]['data']['posts']]
        # Handle direct posts format: [{ urn, text, ... }, ...]
        elif isinstance(results, list) and results and isinstance(results[0], dict) and 
             (results[0].get('urn') or results[0].get('text')):
            return [ApiMaestroPost(**p) for p in results]
        # Handle single response object (not array): { success, data: { posts } }
        elif isinstance(results, dict) and results.get('success') and results.get('data') and results['data'].get('posts'):
            return [ApiMaestroPost(**p) for p in results['data']['posts']]
        else:
            print(f"Unexpected Apify response format: {results}")
            return []

    async def _save_posts_and_auto_follow(self, posts: List[ApiMaestroPost], user_id: str) -> None:
        creator_ids = set()

        for post in posts:
            creator_id = await self._find_or_create_creator(post)
            if creator_id is None:
                continue

            creator_ids.add(creator_id)
            await self._save_post_if_new(post, creator_id)

        await self._auto_follow_creators(list(creator_ids), user_id)

    async def _find_or_create_creator(self, post: ApiMaestroPost) -> Optional[int]:
        raw_profile_url = post.author.profile_url if post.author else ""
        author_profile_url = raw_profile_url.split("?")[0].rstrip('/')
        author_name = f"{post.author.first_name or ''} {post.author.last_name or ''}".strip() if post.author else ""
        author_username = post.author.username if post.author else None

        clean_profile_url = author_username 
            and f"https://www.linkedin.com/in/{author_username}" 
            or author_profile_url

        if not clean_profile_url:
            return None

        existing_creator = await self.creator_repo.find_by_profile_url(clean_profile_url)

        if existing_creator:
            return existing_creator.creator_id

        try:
            new_creator = await self.creator_repo.create(
                profile_url=clean_profile_url,
                display_name=author_name,
                platform="linkedin",
            )
            return new_creator.creator_id
        except Exception as e:
            print(f"Failed to create creator: {e}, profile_url: {clean_profile_url}, display_name: {author_name}")
            return None

    async def _save_post_if_new(self, post: ApiMaestroPost, creator_id: int) -> None:
        post_url = post.url
        if not post_url:
            return

        existing_post = await self.content_repo.find_by_post_url(post_url)

        if not existing_post:
            await self.content_repo.create(creator_id, post_url, post.model_dump_json()) # Save as JSON string

    async def _auto_follow_creators(self, creator_ids: List[int], user_id: str) -> None:
        for creator_id in creator_ids:
            try:
                await self.user_follow_repo.upsert(user_id, creator_id)
            except Exception as e:
                print(f"Failed to auto-follow creator: {e}, userId: {user_id}, creatorId: {creator_id}")

# Singleton instance with injected repositories
apify_token = os.getenv("APIFY_API_TOKEN")
if not apify_token:
    # Do not raise error here, allow application to start without it for dev purposes
    # Endpoints using this service should check if apify_token is None and raise HTTPException
    print("Warning: APIFY_API_TOKEN environment variable is not set. LinkedIn scraping will not work.")

# Inject necessary repositories
_creator_repository = CreatorRepository(supabase_service_client)
_content_repository = ContentRepository(supabase_service_client)
_user_follow_repository = UserFollowRepository(supabase_service_client)

linked_in_scraper_service = LinkedInScraperService(
    apify_token=apify_token,
    creator_repo=_creator_repository,
    content_repo=_content_repository,
    user_follow_repo=_user_follow_repository
)
