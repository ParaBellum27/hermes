/**
 * Service for sorting and filtering content posts
 * Centralizes duplicated sorting/filtering logic across the app
 */

import type { ContentPost } from "@/types";

export type ContentSortOption = "recent" | "oldest" | "reactions" | "comments" | "reposts" | "multiplier";
export type FilterType = "all" | "bangers" | "mid";

export const CONTENT_SORT_OPTIONS = [
  { value: "recent" as const, label: "Newest" },
  { value: "oldest" as const, label: "Oldest" },
  { value: "reactions" as const, label: "Most reactions" },
  { value: "comments" as const, label: "Most comments" },
  { value: "reposts" as const, label: "Most reposts" },
  { value: "multiplier" as const, label: "Biggest outperformers" },
];

/**
 * Calculate multiplier for a post based on creator's average reactions
 */
export function calculateMultiplier(
  post: ContentPost,
  creatorAvgReactions: number
): number {
  const postReactions = post.stats?.total_reactions || 0;
  return creatorAvgReactions > 0 ? postReactions / creatorAvgReactions : 0;
}

/**
 * Sort content posts by various criteria
 */
export function sortContentPosts(
  posts: ContentPost[],
  sortType: ContentSortOption,
  getMultiplier: (post: ContentPost) => number
): ContentPost[] {
  const sorted = [...posts];
  const defaultCompare = (a: ContentPost, b: ContentPost) =>
    (b.postedAtTimestamp ?? 0) - (a.postedAtTimestamp ?? 0);

  switch (sortType) {
    case "recent":
      return sorted.sort(defaultCompare);
    case "oldest":
      return sorted.sort((a, b) => (a.postedAtTimestamp ?? 0) - (b.postedAtTimestamp ?? 0));
    case "reactions":
      return sorted.sort(
        (a, b) => (b.stats?.total_reactions ?? 0) - (a.stats?.total_reactions ?? 0)
      );
    case "comments":
      return sorted.sort(
        (a, b) => (b.stats?.comments ?? 0) - (a.stats?.comments ?? 0)
      );
    case "reposts":
      return sorted.sort(
        (a, b) => (b.stats?.reposts ?? 0) - (a.stats?.reposts ?? 0)
      );
    case "multiplier":
      return sorted.sort((a, b) => {
        const diff = getMultiplier(b) - getMultiplier(a);
        return diff !== 0 ? diff : defaultCompare(a, b);
      });
    default:
      return sorted.sort(defaultCompare);
  }
}

/**
 * Filter posts by performance category
 */
export function filterPostsByPerformance(
  posts: ContentPost[],
  filterType: FilterType,
  getMultiplier: (post: ContentPost) => number
): ContentPost[] {
  if (filterType === "all") return posts;

  return posts.filter(post => {
    const multiplier = getMultiplier(post);
    if (filterType === "bangers") return multiplier >= 1.5;
    if (filterType === "mid") return multiplier > 0 && multiplier < 0.7;
    return true;
  });
}

/**
 * Count posts by performance category
 */
export function countPostsByPerformance(
  posts: ContentPost[],
  getMultiplier: (post: ContentPost) => number
): { bangers: number; mid: number } {
  let bangers = 0;
  let mid = 0;

  posts.forEach(post => {
    const multiplier = getMultiplier(post);
    if (multiplier >= 1.5) bangers++;
    else if (multiplier > 0 && multiplier < 0.7) mid++;
  });

  return { bangers, mid };
}
