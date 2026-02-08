/**
 * LinkedInScraperService - Business logic for LinkedIn profile scraping
 *
 * Responsibilities:
 * - Orchestrate Apify API calls
 * - Business rules for scraping and saving posts
 * - Use repositories for database operations
 * - NO direct database queries
 */

import { CreatorRepository, creatorRepository } from "@/repositories/creatorRepository";
import { ContentRepository, contentRepository } from "@/repositories/contentRepository";
import { UserFollowRepository, userFollowRepository } from "@/repositories/userFollowRepository";
import { logger } from "@/lib/logger";

const APIFY_ACTOR_ID = "apimaestro~linkedin-profile-posts";

export interface ApiMaestroPost {
  urn: string;
  full_urn: string;
  posted_at: {
    date: string;
    relative: string;
    timestamp: number;
  };
  text: string;
  url: string;
  post_type: string;
  author: {
    first_name: string;
    last_name: string;
    headline: string;
    username: string;
    profile_url: string;
    profile_picture: string;
  };
  stats: {
    total_reactions: number;
    like: number;
    comments: number;
    reposts: number;
  };
  media?: {
    type: string;
    url: string;
  };
  article?: {
    url: string;
    title: string;
  };
}

export interface ScrapeResult {
  success: boolean;
  postsScraped: number;
  posts?: ApiMaestroPost[];
  error?: string;
  urlsSent?: string[];
}

export interface LinkedInScraperService {
  scrapeProfiles(profileUrls: string[], userId: string): Promise<ScrapeResult>;
}

class LinkedInScraperServiceImpl implements LinkedInScraperService {
  constructor(
    private apifyToken: string,
    private creatorRepo: CreatorRepository,
    private contentRepo: ContentRepository,
    private followRepo: UserFollowRepository
  ) {}

  /**
   * Scrape LinkedIn profiles and save posts to database
   */
  async scrapeProfiles(profileUrls: string[], userId: string): Promise<ScrapeResult> {
    if (!profileUrls || profileUrls.length === 0) {
      throw new Error("Profile URLs are required");
    }

    // Fetch posts from Apify
    const allPosts = await this.fetchPostsFromApify(profileUrls);

    if (allPosts.length === 0) {
      return {
        success: false,
        postsScraped: 0,
        error: "No posts found for any profile",
        urlsSent: profileUrls,
      };
    }

    // Save posts and auto-follow creators
    await this.savePostsAndAutoFollow(allPosts, userId);

    return {
      success: true,
      postsScraped: allPosts.length,
      posts: allPosts.slice(0, 5), // Return first 5 for debugging
    };
  }

  /**
   * Fetch posts from Apify API for given profile URLs
   */
  private async fetchPostsFromApify(profileUrls: string[]): Promise<ApiMaestroPost[]> {
    const allPosts: ApiMaestroPost[] = [];

    for (const profileUrl of profileUrls) {
      // Extract username from URL (e.g., linkedin.com/in/satyanadella -> satyanadella)
      const urlMatch = profileUrl.match(/linkedin\.com\/in\/([^\/\?]+)/);
      const username = urlMatch ? urlMatch[1] : profileUrl;

      const inputBody = {
        username: username,
      };

      const runResponse = await fetch(
        `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/run-sync-get-dataset-items?token=${this.apifyToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inputBody),
        }
      );

      const responseText = await runResponse.text();

      if (!runResponse.ok) {
        logger.error(`Apify error for ${username}`, null, { responseText: responseText.slice(0, 500) });
        continue;
      }

      if (!responseText || responseText.trim() === "") {
        logger.error(`Empty response for ${username}`, null);
        continue;
      }

      try {
        const results = JSON.parse(responseText);
        const posts = this.extractPostsFromResponse(results);
        allPosts.push(...posts);
      } catch (error) {
        logger.error(`Invalid JSON response for ${username}`, error);
      }
    }

    return allPosts;
  }

  /**
   * Extract posts from Apify response (handles multiple response formats)
   */
  private extractPostsFromResponse(results: unknown): ApiMaestroPost[] {
    // Type guard helpers
    const isArrayWithSuccess = (val: unknown): val is Array<{ success: boolean; data: { posts: ApiMaestroPost[] } }> => {
      return Array.isArray(val) && val[0]?.success && val[0]?.data?.posts;
    };

    const isArrayOfPosts = (val: unknown): val is ApiMaestroPost[] => {
      return Array.isArray(val) && (val[0]?.urn || val[0]?.text);
    };

    const isObjectWithSuccess = (val: unknown): val is { success: boolean; data: { posts: ApiMaestroPost[] } } => {
      return typeof val === 'object' && val !== null && 'success' in val && 'data' in val;
    };

    // Handle wrapped response format: [{ success, data: { posts } }]
    if (isArrayWithSuccess(results)) {
      return results[0].data.posts;
    }
    // Handle direct posts format: [{ urn, text, ... }, ...]
    else if (isArrayOfPosts(results)) {
      return results;
    }
    // Handle single response object (not array): { success, data: { posts } }
    else if (isObjectWithSuccess(results)) {
      return results.data.posts;
    }
    // Unexpected format
    else {
      logger.error("Unexpected Apify response format", null, { results });
      return [];
    }
  }

  /**
   * Save posts to database and auto-follow creators
   */
  private async savePostsAndAutoFollow(posts: ApiMaestroPost[], userId: string): Promise<void> {
    const creatorIds = new Set<number>();

    for (const post of posts) {
      const creatorId = await this.findOrCreateCreator(post);
      if (!creatorId) continue;

      creatorIds.add(creatorId);

      // Save post if it doesn't exist
      await this.savePostIfNew(post, creatorId);
    }

    // Auto-follow all creators
    await this.autoFollowCreators(Array.from(creatorIds), userId);
  }

  /**
   * Find existing creator or create new one
   */
  private async findOrCreateCreator(post: ApiMaestroPost): Promise<number | null> {
    const rawProfileUrl = post.author?.profile_url || "";
    const authorProfileUrl = rawProfileUrl.split("?")[0].replace(/\/$/, "");
    const authorName = `${post.author?.first_name || ""} ${post.author?.last_name || ""}`.trim();
    const authorUsername = post.author?.username;

    const cleanProfileUrl = authorUsername
      ? `https://www.linkedin.com/in/${authorUsername}`
      : authorProfileUrl;

    if (!cleanProfileUrl) {
      return null;
    }

    // Try to find existing creator by profile URL
    const existingCreator = await this.creatorRepo.findByProfileUrl(cleanProfileUrl);

    if (existingCreator) {
      return existingCreator.creator_id;
    }

    // Create new creator
    try {
      const newCreator = await this.creatorRepo.create({
        profileUrl: cleanProfileUrl,
        displayName: authorName,
        platform: "linkedin",
      });
      return newCreator.creator_id;
    } catch (error) {
      logger.error("Failed to create creator", error, {
        profile_url: cleanProfileUrl,
        display_name: authorName,
      });
      return null;
    }
  }

  /**
   * Save post to database if it doesn't already exist
   */
  private async savePostIfNew(post: ApiMaestroPost, creatorId: number): Promise<void> {
    const postUrl = post.url;
    if (!postUrl) return;

    // Check if post already exists
    const existingPost = await this.contentRepo.findByPostUrl(postUrl);

    if (!existingPost) {
      await this.contentRepo.create(creatorId, postUrl, JSON.stringify(post));
    }
  }

  /**
   * Auto-follow creators for a user
   */
  private async autoFollowCreators(creatorIds: number[], userId: string): Promise<void> {
    for (const creatorId of creatorIds) {
      try {
        // Use repository's upsert method - it handles duplicates automatically
        await this.followRepo.upsert(userId, creatorId);
      } catch (error) {
        logger.error("Failed to auto-follow creator", error, { userId, creatorId });
      }
    }
  }
}

// Singleton instance with injected repositories
const apifyToken = process.env.APIFY_API_TOKEN;
if (!apifyToken) {
  throw new Error("APIFY_API_TOKEN is not configured");
}

export const linkedInScraperService = new LinkedInScraperServiceImpl(
  apifyToken,
  creatorRepository,
  contentRepository,
  userFollowRepository
);
