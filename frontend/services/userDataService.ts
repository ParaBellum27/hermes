/**
 * UserDataService - Business logic for generic user data storage
 *
 * Responsibilities:
 * - Business rules for user_data table operations
 * - Orchestrates repository calls
 * - NO direct database queries
 */

import { UserDataRepository, userDataRepository } from "@/repositories/userDataRepository";

export class UserDataService {
  constructor(private userDataRepo: UserDataRepository) {}

  /**
   * Load data for a user by key
   */
  async loadData<T = Record<string, unknown>>(userId: string, key: string): Promise<T | null> {
    const data = await this.userDataRepo.findByUserIdAndKey(userId, key);
    return data as T | null;
  }

  /**
   * Save data for a user
   */
  async saveData<T = Record<string, unknown>>(
    userId: string,
    key: string,
    data: T
  ): Promise<void> {
    await this.userDataRepo.upsert(userId, key, data as Record<string, unknown>);
  }

  /**
   * Delete data for a user by key
   */
  async deleteData(userId: string, key: string): Promise<void> {
    await this.userDataRepo.delete(userId, key);
  }

  /**
   * Find all data for a user matching a key pattern
   */
  async findByKeyPattern(userId: string, keyPattern: string): Promise<Array<{
    key: string;
    data: Record<string, unknown>;
  }>> {
    const rows = await this.userDataRepo.findByUserIdAndKeyPattern(userId, keyPattern);
    return rows.map(row => ({ key: row.key, data: row.data }));
  }
}

// Singleton instance with injected repository
export const userDataService = new UserDataService(userDataRepository);
