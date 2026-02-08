/**
 * ContentRepository - Data access layer for creator_content table
 *
 * Responsibilities:
 * - CRUD operations on creator_content table
 * - Database queries ONLY (no business logic)
 * - Returns raw data models
 * - Throws errors (doesn't handle them)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreatorContent } from "@/types";
import { serviceClient } from "@/lib/supabase/service";

interface CreatorContentWithProfile {
  content_id: number;
  creator_id: number;
  post_url: string;
  post_raw: string | null;
  created_at: string;
  updated_at: string;
  creator_profiles: {
    creator_id: number;
    profile_url: string;
    platform: string;
    display_name?: string | null;
  };
}

interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export class ContentRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Fetch all content with creator profiles (with pagination)
   */
  async findAllWithProfiles(
    options: PaginationOptions = {}
  ): Promise<CreatorContentWithProfile[]> {
    const { limit = 1000, offset = 0 } = options;

    const { data, error } = await this.supabase
      .from("creator_content")
      .select(`
        *,
        creator_profiles!inner (
          creator_id,
          profile_url,
          platform,
          display_name
        )
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(error.message);
    }

    return (data as unknown as CreatorContentWithProfile[]) || [];
  }

  /**
   * Fetch content by creator ID
   */
  async findByCreatorId(creatorId: number): Promise<CreatorContent[]> {
    const { data, error } = await this.supabase
      .from("creator_content")
      .select("*")
      .eq("creator_id", creatorId)
      .order("content_id", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  /**
   * Find content by post URL
   */
  async findByPostUrl(postUrl: string): Promise<CreatorContent | null> {
    const { data, error } = await this.supabase
      .from("creator_content")
      .select("*")
      .eq("post_url", postUrl)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Create new content
   */
  async create(
    creatorId: number,
    postUrl: string,
    postRaw?: string
  ): Promise<void> {
    const { error } = await this.supabase.from("creator_content").insert({
      creator_id: creatorId,
      post_url: postUrl,
      post_raw: postRaw,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Get total count of content
   */
  async count(): Promise<number> {
    const { count, error } = await this.supabase
      .from("creator_content")
      .select("*", { count: "exact", head: true });

    if (error) {
      throw new Error(error.message);
    }

    return count || 0;
  }

  /**
   * Fetch all content with creator_id and post_raw for stats calculation
   */
  async findAllForStats(): Promise<
    Array<{ creator_id: number; post_raw?: string }>
  > {
    const { data, error } = await this.supabase
      .from("creator_content")
      .select("creator_id, post_raw");

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }
}

// Singleton instance with service role client (bypasses RLS)
export const contentRepository = new ContentRepository(serviceClient);
