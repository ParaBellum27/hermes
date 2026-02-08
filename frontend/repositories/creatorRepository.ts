/**
 * CreatorRepository - Data access layer for creator_profiles table
 *
 * Responsibilities:
 * - CRUD operations on creator_profiles table
 * - Database queries ONLY (no business logic)
 * - Returns raw data models
 * - Throws errors (doesn't handle them)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreatorProfile } from "@/types";
import { serviceClient } from "@/lib/supabase/service";

export class CreatorRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get all creators, ordered by creation date
   */
  async findAll(): Promise<CreatorProfile[]> {
    const { data, error } = await this.supabase
      .from("creator_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  /**
   * Find creator by ID
   */
  async findById(creatorId: number): Promise<CreatorProfile | null> {
    const { data, error } = await this.supabase
      .from("creator_profiles")
      .select("*")
      .eq("creator_id", creatorId)
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
   * Find creator by profile URL
   */
  async findByProfileUrl(profileUrl: string): Promise<CreatorProfile | null> {
    const { data, error } = await this.supabase
      .from("creator_profiles")
      .select("*")
      .eq("profile_url", profileUrl)
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
   * Create a new creator
   */
  async create(input: {
    profileUrl: string;
    displayName?: string;
    platform: string;
  }): Promise<CreatorProfile> {
    const { data, error } = await this.supabase
      .from("creator_profiles")
      .insert({
        profile_url: input.profileUrl,
        display_name: input.displayName,
        platform: input.platform,
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to create creator");
    }

    return data;
  }
}

// Singleton instance with service role client (bypasses RLS)
export const creatorRepository = new CreatorRepository(serviceClient);
