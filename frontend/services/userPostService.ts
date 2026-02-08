/**
 * UserPostService - Business logic for user posts
 *
 * Responsibilities:
 * - Business rules and validation
 * - Orchestrates repository calls
 * - NO direct database queries
 */

import type { PostStatus, UserPost } from "@/types";
import { UserPostRepository, userPostRepository } from "@/repositories/userPostRepository";

interface CreatePostInput {
  rawText?: string;
  status?: PostStatus;
}

interface UpdatePostInput {
  title?: string | null;
  rawText?: string | null;
  status?: PostStatus | null;
}

class UserPostService {
  constructor(private repository: UserPostRepository) {}

  async fetchUserPosts(userId: string): Promise<UserPost[]> {
    return this.repository.findByUserId(userId);
  }

  async createPost(userId: string, input: CreatePostInput = {}): Promise<UserPost> {
    return this.repository.create({
      userId,
      rawText: input.rawText,
      status: input.status,
    });
  }

  async updatePost(postId: string, input: UpdatePostInput): Promise<UserPost> {
    return this.repository.update(postId, input);
  }

  async deletePost(postId: string): Promise<void> {
    return this.repository.delete(postId);
  }

  async fetchPostById(postId: string): Promise<UserPost | null> {
    return this.repository.findById(postId);
  }
}

// Singleton instance with injected repository
export const userPostService = new UserPostService(userPostRepository);
