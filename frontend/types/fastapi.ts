// types/fastapi.ts

import { Literal } from "typescript";

// Mirroring pyapp/models.py Pydantic models for FastAPI
export interface AuthUser {
  id: string;
  email?: string;
  // Add other relevant user fields as needed
}

export interface CreatorProfile {
  id?: string;
  creatorId?: number; // Renamed from creator_id
  profileUrl: string; // Renamed from profile_url
  displayName?: string; // Renamed from display_name
  platform: string;
  createdAt?: string; // Renamed from created_at (datetime string)
}

export interface CreatorProfileForContent {
  creatorId: number; // Renamed from creator_id
  profileUrl: string; // Renamed from profile_url
  platform: string;
  displayName?: string; // Renamed from display_name
}

export interface CreatorContent {
  contentId: number; // Renamed from content_id
  creatorId: number; // Renamed from creator_id
  postUrl: string; // Renamed from post_url
  postRaw?: string; // Renamed from post_raw
  createdAt: string; // Renamed from created_at
  updatedAt: string; // Renamed from updated_at
}

export interface CreatorContentWithProfile {
  contentId: number; // Renamed from content_id
  creatorId: number; // Renamed from creator_id
  postUrl: string; // Renamed from post_url
  postRaw?: string; // Renamed from post_raw
  createdAt: string; // Renamed from created_at
  updatedAt: string; // Renamed from updated_at
  creatorProfiles: CreatorProfileForContent; // Renamed from creator_profiles
}

export interface UserFollow {
  userId: string; // Renamed from user_id
  creatorId: number; // Renamed from creator_id
  createdAt?: string; // Renamed from created_at
}

export interface FollowRequestBody {
  creatorId: number;
}

export interface AnalyzePostRequest {
  postContent: string;
  existingProfile?: Record<string, any>;
}

export interface Question {
  field: string;
  question: string;
  why: string;
}

export interface AnalysisResult {
  analysis: string;
  dataPoints: string[];
  questions: Question[];
}

export type ConversationRole = "assistant" | "user";

export interface ConversationMessage {
  role: ConversationRole;
  content: string;
}

export interface AskQuestionRequest {
  postContent: string;
  conversationHistory?: ConversationMessage[];
  existingContext?: Record<string, string>;
  missingFields?: string[];
}

export interface AskQuestionResponse {
  ready: boolean;
  question?: string;
}

export interface GenerateEditRequest {
  text: string;
  prompt?: string;
  context?: Record<string, any>;
  conversationHistory?: ConversationMessage[];
  similarity?: number; // 0-100
}

export interface GenerateEditResponse {
  originalText: string;
  suggestedText: string;
  additions: number;
  deletions: number;
}

export type SpeechVoice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

export interface TextToSpeechRequest {
  text: string;
  voice?: SpeechVoice;
}

// ContentPost related models (from pyapp/models.py)
export interface PostStats {
  totalReactions?: number; // Renamed from total_reactions
  comments?: number;
  reposts?: number;
}

export interface PostMedia {
  type?: string;
  url?: string;
}

export interface Article {
  title?: string;
  url?: string;
}

export interface ApiMaestroPostedAt {
  date?: string;
  relative?: string;
  timestamp?: number;
}

export interface ContentPost {
  id: number;
  title: string;
  author: string;
  timeAgo: string;
  isHighlighted: boolean;
  creatorId: number; // Renamed from creatorId
  postUrl: string; // Renamed from postUrl
  postRaw: string; // Renamed from postRaw
  text: string;
  postedAt?: string; // Renamed from postedAt
  postedAtTimestamp?: number; // Renamed from postedAtTimestamp
  postType?: string; // Renamed from postType
  stats?: PostStats;
  media?: PostMedia[];
  article?: Article;
}

export interface UserPost {
  postId: string; // Renamed from post_id
  userId: string; // Renamed from user_id
  title?: string;
  rawText: string; // Renamed from raw_text
  status?: string;
  editorState?: Record<string, any>; // Renamed from editor_state
  scheduledFor?: string; // Renamed from scheduled_for
  publishedAt?: string; // Renamed from published_at
  wordCount?: number; // Renamed from word_count
  inspirationSummary?: string; // Renamed from inspiration_summary
  createdAt: string; // Renamed from created_at
  updatedAt: string; // Renamed from updated_at
}

export interface CreateUserPostRequest {
  userId: string;
  title?: string;
  rawText?: string;
  status?: string;
}

export interface UpdateUserPostRequest {
  title?: string;
  rawText?: string;
  status?: string;
}

export interface ApiMaestroAuthor {
  firstName?: string; // Renamed from first_name
  lastName?: string; // Renamed from last_name
  headline?: string;
  username?: string;
  profileUrl?: string; // Renamed from profile_url
  profilePicture?: string; // Renamed from profile_picture
}

export interface ApiMaestroStats {
  totalReactions?: number; // Renamed from total_reactions
  like?: number;
  comments?: number;
  reposts?: number;
}

export interface ApiMaestroMedia {
  type?: string;
  url?: string;
}

export interface ApiMaestroArticle {
  url?: string;
  title?: string;
}

export interface ApiMaestroPost {
  urn: string;
  fullUrn?: string; // Renamed from full_urn
  postedAt?: ApiMaestroPostedAt; // Renamed from posted_at
  text?: string;
  url?: string;
  postType?: string; // Renamed from post_type
  author?: ApiMaestroAuthor;
  stats?: ApiMaestroStats;
  media?: ApiMaestroMedia[];
  article?: ApiMaestroArticle;
}

export interface ScrapeResult {
  success: boolean;
  postsScraped: number; // Renamed from postsScraped
  posts?: ApiMaestroPost[];
  error?: string;
  urlsSent?: string[]; // Renamed from urlsSent
}

export interface LinkedInScrapeRequest {
  profileUrls: string[]; // Renamed from profileUrls
}
