/**
 * CreatorService - Business logic for creator operations
 *
 * Responsibilities:
 * - Business rules for following/unfollowing creators
 * - Orchestrates repository calls
 * - NO direct database queries
 */

import type { CreatorProfile } from "@/types";
import { CreatorRepository, creatorRepository } from "@/repositories/creatorRepository";
import { UserFollowRepository, userFollowRepository } from "@/repositories/userFollowRepository";

export class CreatorService {
  constructor(
    private creatorRepo: CreatorRepository,
    private followRepo: UserFollowRepository
  ) {}

  /**
   * Follow a creator
   * Uses upsert to handle both INSERT and UPDATE cases:
   * - If user hasn't followed this creator: creates new follow relationship (CREATE)
   * - If follow already exists: updates the record (UPDATE)
   * This implements the "U" in CRUD operations
   */
  async followCreator(userId: string, creatorId: number) {
    const data = await this.followRepo.upsert(userId, creatorId);
    return { data, isFollowed: true };
  }

  /**
   * Unfollow a creator
   */
  async unfollowCreator(userId: string, creatorId: number) {
    await this.followRepo.delete(userId, creatorId);
    return {
      data: { user_id: userId, creator_id: creatorId },
      isFollowed: false,
    };
  }

  /**
   * Get all creators a user is following (with creator profile data)
   */
  async getFollowedCreatorsWithProfiles(userId: string) {
    return this.followRepo.findByUserIdWithProfiles(userId);
  }

  /**
   * Get all creators a user is following (just IDs)
   */
  async getFollowedCreators(userId: string) {
    const ids = await this.followRepo.findCreatorIdsByUserId(userId);
    return ids.map((creator_id) => ({ creator_id }));
  }

  /**
   * Get all creators
   */
  async getAllCreators() {
    return this.creatorRepo.findAll();
  }
}

// Singleton instance with injected repositories
export const creatorService = new CreatorService(creatorRepository, userFollowRepository);
