/**
 * UserDataRepository - Data access layer for user_data table
 *
 * Responsibilities:
 * - CRUD operations on user_data table (key-value storage)
 * - Database queries ONLY (no business logic)
 * - Returns raw data models
 * - Throws errors (doesn't handle them)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { serviceClient } from "@/lib/supabase/service";

interface UserDataRow {
  user_id: string;
  key: string;
  data: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export class UserDataRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Find data by user ID and key
   */
  async findByUserIdAndKey(
    userId: string,
    key: string
  ): Promise<Record<string, unknown> | null> {
    console.log(`[UserDataRepository] Query: userId=${userId}, key=${key}`);

    const { data, error } = await this.supabase
      .from("user_data")
      .select("data")
      .eq("user_id", userId)
      .eq("key", key)
      .single();

    console.log(`[UserDataRepository] Result:`, { data, error });

    if (error) {
      // PGRST116 = "not found" error from Supabase
      if (error.code === "PGRST116") {
        console.log(`[UserDataRepository] No data found (PGRST116)`);
        return null;
      }
      console.error(`[UserDataRepository] Error:`, error);
      throw new Error(error.message);
    }

    const result = (data?.data as Record<string, unknown>) || null;
    console.log(`[UserDataRepository] Returning:`, result);
    return result;
  }

  /**
   * Upsert (insert or update) data for a user
   */
  async upsert(
    userId: string,
    key: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const { error } = await this.supabase.from("user_data").upsert(
      {
        user_id: userId,
        key: key,
        data: data,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,key",
      }
    );

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Delete data by user ID and key
   */
  async delete(userId: string, key: string): Promise<void> {
    const { error } = await this.supabase
      .from("user_data")
      .delete()
      .eq("user_id", userId)
      .eq("key", key);

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Find all data for a user by key pattern
   */
  async findByUserIdAndKeyPattern(
    userId: string,
    keyPattern: string
  ): Promise<UserDataRow[]> {
    const { data, error } = await this.supabase
      .from("user_data")
      .select("*")
      .eq("user_id", userId)
      .like("key", keyPattern);

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }
}

// Singleton instance with service role client (bypasses RLS)
export const userDataRepository = new UserDataRepository(serviceClient);
