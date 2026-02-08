from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Dict, Any
from app.models import LinkedInScrapeRequest, ScrapeResult, AuthUser
from app.services.linkedin_scraper import linked_in_scraper_service
from app.dependencies import get_current_user
import re

router = APIRouter()

@router.post("/linkedin", response_model=ScrapeResult)
async def scrape_linkedin(
    body: LinkedInScrapeRequest,
    current_user: AuthUser = Depends(get_current_user) # Authentication is required
):
    # Validate profileUrls array - already done by Pydantic model min_length and max_length
    # Validate each URL
    for url in body.profileUrls:
        if not url.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="All profileUrls must be non-empty strings")

        # Basic LinkedIn URL validation
        if not re.search(r"linkedin\.com/", url):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="All URLs must be LinkedIn profile URLs")

    if not linked_in_scraper_service.apify_token:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="APIFY_API_TOKEN is not configured, LinkedIn scraping service is unavailable."
        )

    try:
        result = await linked_in_scraper_service.scrape_profiles(body.profileUrls, current_user.id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        print(f"LinkedIn scrape error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to scrape LinkedIn profiles")
