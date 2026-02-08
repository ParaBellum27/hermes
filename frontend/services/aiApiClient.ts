// services/aiApiClient.ts
import {
  AnalyzePostRequest,
  AnalysisResult,
  AskQuestionRequest,
  AskQuestionResponse,
  GenerateEditRequest,
  GenerateEditResponse,
  TextToSpeechRequest,
} from "@/types/fastapi";

const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL || "http://localhost:8000"; // Assuming FastAPI runs on port 8000

export class AiApiClient {
  private async request<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<T> {
    const response = await fetch(`${FASTAPI_BASE_URL}/api/ai${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        // Add any necessary authentication headers here, e.g., Authorization: `Bearer ${token}`
        // For now, assuming authentication is handled by the FastAPI backend directly or not required for simple proxy
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async analyzePost(data: AnalyzePostRequest): Promise<AnalysisResult> {
    return this.request<AnalysisResult>("POST", "/analyze-post", data);
  }

  async askQuestion(data: AskQuestionRequest): Promise<AskQuestionResponse> {
    return this.request<AskQuestionResponse>("POST", "/ask-question", data);
  }

  async generateEdit(data: GenerateEditRequest): Promise<GenerateEditResponse> {
    return this.request<GenerateEditResponse>("POST", "/generate-edit", data);
  }

  async textToSpeech(data: TextToSpeechRequest): Promise<ArrayBuffer> {
    const response = await fetch(`${FASTAPI_BASE_URL}/api/ai/text-to-speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `API request failed: ${response.statusText}`);
    }

    return response.arrayBuffer(); // Return audio as ArrayBuffer
  }
}

export const aiApiClient = new AiApiClient();
