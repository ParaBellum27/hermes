/**
 * ContentService - Business logic for creator content
 *
 * Responsibilities:
 * - Business logic for content transformation and formatting
 * - Orchestrates repository calls
 * - NO direct database queries
 */

import type {
  ContentPost,
  CreatorContent,
  CreatorProfile,
  Profile,
  PostStats,
  PostMedia,
} from "@/types";
import { extractNameFromUrl, formatPostTitle, formatTimeAgo } from "@/lib/formatters";
import { ContentRepository, contentRepository } from "@/repositories/contentRepository";
import { CreatorRepository, creatorRepository } from "@/repositories/creatorRepository";
import { UserFollowRepository, userFollowRepository } from "@/repositories/userFollowRepository";
import { logger } from "@/lib/logger";

interface UserFollowRow {
  creator_id: number;
  created_at: string;
}

interface PaginationOptions {
  limit?: number;
  offset?: number;
}

const DEFAULT_PAGE_SIZE = 1000; // Fetch all posts

export class ContentService {
  constructor(
    private contentRepo: ContentRepository,
    private creatorRepo: CreatorRepository,
    private followRepo: UserFollowRepository
  ) {}

  async fetchCreatorContent(options: PaginationOptions = {}): Promise<ContentPost[]> {
    const data = await this.contentRepo.findAllWithProfiles(options);

    // Business logic: Transform database data to ContentPost format
    const posts = data.map((item) => {
      // Try to parse post_raw as JSON (new format with full data)
      let parsedPost: Record<string, unknown> | null = null;
      try {
        if (item.post_raw?.startsWith('{')) {
          parsedPost = JSON.parse(item.post_raw);
        }
      } catch {
        // Not JSON, use as plain text
      }

      // Extract text - if JSON parsed, use text field; otherwise use raw content
      const text = parsedPost?.text as string || (parsedPost ? '' : item.post_raw) || '';
      const stats = parsedPost?.stats as ContentPost['stats'];
      const media = parsedPost?.media as ContentPost['media'];
      const article = parsedPost?.article as ContentPost['article'];
      const postedAt = parsedPost?.posted_at as { date?: string; relative?: string; timestamp?: number } | undefined;

      return {
        id: item.content_id,
        title: formatPostTitle(text),
        author: item.creator_profiles.display_name || extractNameFromUrl(item.creator_profiles.profile_url),
        timeAgo: postedAt?.relative?.split('•')[0]?.trim() || formatTimeAgo(item.created_at),
        isHighlighted: false,
        creatorId: item.creator_id,
        postUrl: item.post_url,
        postRaw: text, // Use parsed text, not raw JSON
        text,
        postedAt: postedAt?.date,
        postedAtTimestamp: postedAt?.timestamp || new Date(item.created_at).getTime(),
        postType: parsedPost?.post_type as string,
        stats,
        media,
        article,
      };
    });

    // Sort by LinkedIn post date (newest first)
    return posts.sort((a: ContentPost, b: ContentPost) => (b.postedAtTimestamp || 0) - (a.postedAtTimestamp || 0));
  }

  async saveContent(
    creatorId: number,
    postUrl: string,
    postRaw?: string
  ): Promise<void> {
    return this.contentRepo.create(creatorId, postUrl, postRaw);
  }

  /**
   * Get total count of posts for pagination
   */
  async getPostCount(): Promise<number> {
    return this.contentRepo.count();
  }

  /**
   * Fetch all creators and merge with user's follow status
   * If userId is provided, checks which creators the user follows and marks them
   * This enables the UI to show follow/unfollow buttons with correct state
   */
  async fetchCreators(userId?: string): Promise<Profile[]> {
    // Fetch all creator profiles from database
    const data = await this.creatorRepo.findAll();

    // Business logic: Build a map of creator IDs to follow timestamps for O(1) lookup
    const followedCreatorsMap = new Map<number, string>();

    if (userId) {
      try {
        const profiles = await this.followRepo.findByUserIdWithProfiles(userId);
        // Get creator IDs from profiles
        profiles.forEach((profile) => {
          followedCreatorsMap.set(profile.creator_id, new Date().toISOString());
        });
      } catch (error) {
        logger.error("Failed to load followed creators", error);
      }
    }

    // Fetch posts with stats for each creator
    const contentData = await this.contentRepo.findAllForStats();

    // Business logic: Calculate post counts and average stats per creator
    const creatorStats = new Map<number, { count: number; totalReactions: number; totalComments: number; totalReposts: number }>();

    if (contentData) {
      contentData.forEach((item) => {
        const existing = creatorStats.get(item.creator_id) || { count: 0, totalReactions: 0, totalComments: 0, totalReposts: 0 };
        existing.count++;

        // Try to parse stats from post_raw JSON
        if (item.post_raw?.startsWith('{')) {
          try {
            const parsed = JSON.parse(item.post_raw);
            if (parsed.stats) {
              existing.totalReactions += parsed.stats.total_reactions || 0;
              existing.totalComments += parsed.stats.comments || 0;
              existing.totalReposts += parsed.stats.reposts || 0;
            }
          } catch {
            // Not valid JSON
          }
        }

        creatorStats.set(item.creator_id, existing);
      });
    }

    // Transform database model to UI model, enriching with follow status and stats
    return data.map((creator: CreatorProfile) => {
      const stats = creatorStats.get(creator.creator_id);
      const postCount = stats?.count || 0;

      return {
        id: creator.creator_id,
        name: creator.display_name || extractNameFromUrl(creator.profile_url),
        connections: creator.platform === "linkedin" ? "LinkedIn" : creator.platform,
        profileUrl: creator.profile_url,
        isFollowed: followedCreatorsMap.has(creator.creator_id),
        followedAt: followedCreatorsMap.get(creator.creator_id),
        postCount,
        avgReactions: stats && postCount > 0 ? Math.round(stats.totalReactions / postCount) : 0,
        avgComments: stats && postCount > 0 ? Math.round(stats.totalComments / postCount) : 0,
        avgReposts: stats && postCount > 0 ? Math.round(stats.totalReposts / postCount) : 0,
      };
    });
  }

  /**
   * Server-side method: Get all creator content (for API routes)
   */
  async getAllCreatorContent(): Promise<CreatorContent[]> {
    // Use repository instead of direct Supabase query
    const data = await this.contentRepo.findAllForStats();
    return data as CreatorContent[];
  }
}

// Singleton instance with injected repositories
export const contentService = new ContentService(
  contentRepository,
  creatorRepository,
  userFollowRepository
);
