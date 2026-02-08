// services/contentApiClient.ts
import { ContentPost } from "@/types";

const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL || "http://localhost:8000";

export class ContentApiClient {
  private async request<T>(
    method: string,
    path: string,
    params?: URLSearchParams
  ): Promise<T> {
    const url = new URL(`${FASTAPI_BASE_URL}${path}`);
    if (params) {
      params.forEach((value, key) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method,
      headers: {
        "Content-Type": "application/json",
        // Add authentication headers if necessary
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async fetchCreatorContent(limit?: number, offset?: number): Promise<ContentPost[]> {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append("limit", limit.toString());
    if (offset !== undefined) params.append("offset", offset.toString());

    // The FastAPI endpoint returns a list directly, not an object with a 'data' key
    return this.request<ContentPost[]>("GET", "/api/content/fetch", params);
  }

  async getAllPosts(): Promise<ContentPost[]> {
    // The FastAPI endpoint returns a list directly, not an object with a 'data' key
    return this.request<ContentPost[]>("GET", "/api/posts/get-all-posts");
  }
}

export const contentApiClient = new ContentApiClient();
