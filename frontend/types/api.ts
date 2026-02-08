/**
 * Shared API types used across client and server
 */

export interface GenerateEditResponse {
  originalText: string;
  suggestedText: string;
  additions: number;
  deletions: number;
}

export interface GenerateEditRequest {
  text: string;
  prompt?: string;
  context?: Record<string, string>;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  similarity?: number; // 0-100, how different from original (higher = more different)
}

export interface AskQuestionRequest {
  postContent: string;
  conversationHistory: Array<{ role: "assistant" | "user"; content: string }>;
  existingContext?: Record<string, string>;
  missingFields?: string[];
}

export interface AskQuestionResponse {
  ready: boolean;
  question?: string;
}

export interface TextToSpeechRequest {
  text: string;
  voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
}
