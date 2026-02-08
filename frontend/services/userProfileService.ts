/**
 * UserProfileService - Business logic for user profiles
 *
 * Responsibilities:
 * - Business rules for personal information
 * - Orchestrates repository calls
 * - NO direct database queries
 */

import { UserDataRepository, userDataRepository } from "@/repositories/userDataRepository";

export type PersonalInfoData = Record<string, string>;

const PERSONAL_INFO_KEY = "personal_info";

export interface UserProfileService {
  loadPersonalInfo(userId: string): Promise<PersonalInfoData>;
  savePersonalInfo(userId: string, data: PersonalInfoData): Promise<void>;
}

class UserProfileServiceImpl implements UserProfileService {
  constructor(private userDataRepo: UserDataRepository) {}

  /**
   * Load personal info data for a user
   */
  async loadPersonalInfo(userId: string): Promise<PersonalInfoData> {
    const data = await this.userDataRepo.findByUserIdAndKey(userId, PERSONAL_INFO_KEY);

    // If no data exists yet, return empty object
    if (!data) {
      return {};
    }

    return (data as PersonalInfoData) || {};
  }

  /**
   * Save personal info data for a user
   */
  async savePersonalInfo(userId: string, data: PersonalInfoData): Promise<void> {
    await this.userDataRepo.upsert(userId, PERSONAL_INFO_KEY, data);
  }
}

// Singleton instance with injected repository
export const userProfileService = new UserProfileServiceImpl(userDataRepository);
