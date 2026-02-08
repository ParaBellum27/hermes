/**
 * UserPostRepository - Data access layer for user_posts table
 *
 * Responsibilities:
 * - CRUD operations on user_posts table
 * - Database queries ONLY (no business logic)
 * - Returns raw data models
 * - Throws errors (doesn't handle them)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserPost, PostStatus } from "@/types";
import { serviceClient } from "@/lib/supabase/service";

interface CreatePostInput {
  userId: string;
  rawText?: string;
  status?: PostStatus;
}

interface UpdatePostInput {
  title?: string | null;
  rawText?: string | null;
  status?: PostStatus | null;
}

/**
 * Database row from user_posts table
 */
interface UserPostRow {
  post_id: string;
  user_id: string;
  title?: string | null;
  raw_text: string;
  status?: PostStatus | null;
  editor_state?: unknown;
  scheduled_for?: string | null;
  published_at?: string | null;
  word_count?: number | null;
  inspiration_summary?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Maps database row to UserPost model
 */
function mapRowToUserPost(row: UserPostRow): UserPost {
  return {
    postId: row.post_id,
    userId: row.user_id,
    title: row.title ?? undefined,
    rawText: row.raw_text ?? "",
    status: row.status ?? undefined,
    editorState: row.editor_state ?? undefined,
    scheduledFor: row.scheduled_for ?? undefined,
    publishedAt: row.published_at ?? undefined,
    wordCount: row.word_count ?? undefined,
    inspirationSummary: row.inspiration_summary ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class UserPostRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Fetch all posts for a user, ordered by most recently updated
   */
  async findByUserId(userId: string): Promise<UserPost[]> {
    const { data, error } = await this.supabase
      .from("user_posts")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(mapRowToUserPost);
  }

  /**
   * Find a single post by ID
   */
  async findById(postId: string): Promise<UserPost | null> {
    const { data, error } = await this.supabase
      .from("user_posts")
      .select("*")
      .eq("post_id", postId)
      .single();

    if (error) {
      // PGRST116 = "not found" error from Supabase
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(error.message);
    }

    return data ? mapRowToUserPost(data) : null;
  }

  /**
   * Create a new post
   */
  async create(input: CreatePostInput): Promise<UserPost> {
    const payload: Partial<UserPostRow> = {
      user_id: input.userId,
      raw_text: input.rawText ?? "",
    };

    if (typeof input.status !== "undefined") {
      payload.status = input.status;
    }

    const { data, error } = await this.supabase
      .from("user_posts")
      .insert(payload)
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to create post");
    }

    return mapRowToUserPost(data);
  }

  /**
   * Update an existing post
   */
  async update(postId: string, input: UpdatePostInput): Promise<UserPost> {
    const payload: Partial<Pick<UserPostRow, 'raw_text' | 'title' | 'status'>> = {};

    if (typeof input.rawText !== "undefined") {
      payload.raw_text = input.rawText ?? "";
    }

    if (typeof input.title !== "undefined") {
      payload.title = input.title ?? undefined;
    }

    if (typeof input.status !== "undefined") {
      payload.status = input.status ?? undefined;
    }

    const { data, error } = await this.supabase
      .from("user_posts")
      .update(payload)
      .eq("post_id", postId)
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to update post");
    }

    return mapRowToUserPost(data);
  }

  /**
   * Delete a post
   */
  async delete(postId: string): Promise<void> {
    const { error } = await this.supabase
      .from("user_posts")
      .delete()
      .eq("post_id", postId);

    if (error) {
      throw new Error(error.message);
    }
  }
}

// Singleton instance with service role client (bypasses RLS)
export const userPostRepository = new UserPostRepository(serviceClient);
