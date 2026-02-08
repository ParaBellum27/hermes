/**
 * UserFollowRepository - Data access layer for user_follows table
 *
 * Responsibilities:
 * - CRUD operations on user_follows table
 * - Database queries ONLY (no business logic)
 * - Returns raw data models
 * - Throws errors (doesn't handle them)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreatorProfile } from "@/types";
import { serviceClient } from "@/lib/supabase/service";

interface UserFollow {
  user_id: string;
  creator_id: number;
  created_at: string;
}

interface UserFollowWithProfile {
  creator_id: number;
  created_at: string;
  creator_profiles: CreatorProfile;
}

export class UserFollowRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Create or update a follow relationship (upsert)
   */
  async upsert(userId: string, creatorId: number): Promise<UserFollow> {
    const { data, error } = await this.supabase
      .from("user_follows")
      .upsert(
        {
          user_id: userId,
          creator_id: creatorId,
        },
        { onConflict: "user_id,creator_id" }
      )
      .select("user_id, creator_id, created_at")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Delete a follow relationship
   */
  async delete(userId: string, creatorId: number): Promise<void> {
    const { error } = await this.supabase
      .from("user_follows")
      .delete()
      .match({ user_id: userId, creator_id: creatorId });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Get all creators a user is following (with creator profile data via join)
   */
  async findByUserIdWithProfiles(userId: string): Promise<CreatorProfile[]> {
    const { data, error } = await this.supabase
      .from("user_follows")
      .select(`
        creator_id,
        created_at,
        creator_profiles (*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    // Extract the creator_profiles from the joined data
    return (
      (data as unknown as UserFollowWithProfile[])?.map(
        (follow) => follow.creator_profiles
      ) || []
    );
  }

  /**
   * Get all creator IDs a user is following
   */
  async findCreatorIdsByUserId(userId: string): Promise<number[]> {
    const { data, error } = await this.supabase
      .from("user_follows")
      .select("creator_id")
      .eq("user_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    return data?.map((row) => row.creator_id) || [];
  }

  /**
   * Check if a follow relationship exists
   */
  async exists(userId: string, creatorId: number): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("user_follows")
      .select("user_id")
      .eq("user_id", userId)
      .eq("creator_id", creatorId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return false;
      }
      throw new Error(error.message);
    }

    return !!data;
  }
}

// Singleton instance with service role client (bypasses RLS)
export const userFollowRepository = new UserFollowRepository(serviceClient);
