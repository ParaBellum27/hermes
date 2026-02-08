// services/creatorApiClient.ts
import { CreatorProfile, FollowRequestBody } from "@/types/fastapi";

const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL || "http://localhost:8000";

export class CreatorApiClient {
  private async request<T>(
    method: string,
    path: string,
    body?: any,
    params?: URLSearchParams
  ): Promise<T> {
    const url = new URL(`${FASTAPI_BASE_URL}/api/creators${path}`);
    if (params) {
      params.forEach((value, key) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method,
      headers: {
        "Content-Type": "application/json",
        // Add authentication headers if necessary (e.g., from a stored token)
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `API request failed: ${response.statusText}`);
    }

    // For DELETE and POST that return status only or simple objects,
    // we might not always expect a JSON response with content,
    // but the FastAPI routes usually return something.
    if (response.headers.get("content-type")?.includes("application/json")) {
      return response.json();
    }
    return {} as T; // Return empty object for non-JSON responses
  }

  async getAllCreators(): Promise<CreatorProfile[]> {
    return this.request<CreatorProfile[]>("GET", "/get-all-creators");
  }

  async getFollowedCreators(userId: string): Promise<CreatorProfile[]> {
    // FastAPI endpoint does not take userId as query param, but relies on auth.user.id
    // For now, we'll assume the client making the request is authenticated and the FastAPI backend
    // will infer the user ID from the authentication token.
    // If the FastAPI endpoint were to expect userId as a query parameter, it would be:
    // const params = new URLSearchParams();
    // params.append("user_id", userId);
    return this.request<CreatorProfile[]>("GET", "/get-followed-creators");
  }

  async followCreator(creatorId: number): Promise<any> {
    const body: FollowRequestBody = { creatorId };
    return this.request<any>("POST", "/follow", body);
  }

  async unfollowCreator(creatorId: number): Promise<any> {
    const body: FollowRequestBody = { creatorId };
    return this.request<any>("DELETE", "/unfollow", body);
  }
}

export const creatorApiClient = new CreatorApiClient();
