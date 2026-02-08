/**
 * UI formatting utilities
 * Handles presentation logic that should not live in data services
 */

/**
 * Extract name from profile URL
 * For LinkedIn: https://www.linkedin.com/in/username -> username
 */
export function extractNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/").filter(Boolean);
    return pathParts[pathParts.length - 1] || "Unknown";
  } catch {
    return "Unknown";
  }
}

/**
 * Format a title from raw post content
 * Uses first line or first 60 characters
 */
export function formatPostTitle(postRaw: string | undefined): string {
  if (!postRaw) return "Some Cool Post Title";

  const firstLine = postRaw.split("\n")[0];
  return firstLine.length > 60
    ? firstLine.substring(0, 60) + "..."
    : firstLine;
}

/**
 * Calculate relative time ago from a date
 */
export function formatTimeAgo(date: Date | string): string {
  const createdDate = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - createdDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}
