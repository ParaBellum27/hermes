/**
 * Client-side HTTP client for AI API endpoints
 */

import type {
  GenerateEditRequest,
  GenerateEditResponse,
  AskQuestionRequest,
  AskQuestionResponse,
  TextToSpeechRequest,
} from "@/types/api";

class AIClient {
  async generateEdit(request: GenerateEditRequest): Promise<GenerateEditResponse> {
    const response = await fetch("/api/ai/generate-edit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    return response.json();
  }

  async askQuestion(request: AskQuestionRequest): Promise<AskQuestionResponse> {
    const response = await fetch("/api/ai/ask-question", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    return response.json();
  }

  async generateTextToSpeech(request: TextToSpeechRequest): Promise<Blob> {
    const response = await fetch("/api/ai/text-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    return response.blob();
  }
}

export const aiClient = new AIClient();
