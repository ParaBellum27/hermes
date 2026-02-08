// services/scraperClient.ts
import { ScrapeResult, LinkedInScrapeRequest } from "@/types/fastapi"; // Import types from fastapi.ts

const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL || "http://localhost:8000"; // Assuming FastAPI runs on port 8000

class ScraperClient {
  async scrapeLinkedInProfiles(profileUrls: string[]): Promise<ScrapeResult> {
    const requestBody: LinkedInScrapeRequest = { profileUrls };

    const response = await fetch(`${FASTAPI_BASE_URL}/api/scrape/linkedin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || `Server error: ${response.status}`);
    }

    return response.json();
  }
}

export const scraperClient = new ScraperClient();
