/**
 * Creator HTTP Client
 * Handles API calls for creator follow/unfollow operations
 */

interface FollowResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Follow a creator
 */
export async function followCreator(
  creatorId: number,
  accessToken?: string
): Promise<FollowResponse> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch("/api/creators/follow", {
    method: "POST",
    headers,
    body: JSON.stringify({ creatorId }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.error) {
    throw new Error(payload.error || "Failed to follow creator");
  }

  return payload;
}

/**
 * Unfollow a creator
 */
export async function unfollowCreator(
  creatorId: number,
  accessToken?: string
): Promise<FollowResponse> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch("/api/creators/unfollow", {
    method: "DELETE",
    headers,
    body: JSON.stringify({ creatorId }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.error) {
    throw new Error(payload.error || "Failed to unfollow creator");
  }

  return payload;
}
