import OpenAI from "openai";
import type { ProfileData } from "@/types";
import { aiApiClient, AiApiClient } from "@/services/aiApiClient";
import {
  AnalysisResult,
  AskQuestionRequest,
  AskQuestionResponse,
  GenerateEditRequest,
  GenerateEditResponse,
  TextToSpeechRequest,
} from "@/types/fastapi";

export class OpenAIService {
  private openai: OpenAI;
  private aiApiClient: AiApiClient;

  constructor(aiApiClient: AiApiClient) {
    this.openai = new OpenAI({
      apiKey: process.env.OPEN_AI_API_KEY,
    });
    this.aiApiClient = aiApiClient;
  }

  async generateSpeech(
    text: string,
    voice: TextToSpeechRequest["voice"] = "alloy"
  ): Promise<Buffer> {
    const data: TextToSpeechRequest = { text, voice };
    const arrayBuffer = await this.aiApiClient.textToSpeech(data);
    return Buffer.from(arrayBuffer);
  }

  async askQuestion(
    postContent: string,
    conversationHistory: AskQuestionRequest["conversationHistory"],
    existingContext?: AskQuestionRequest["existingContext"],
    missingFields?: AskQuestionRequest["missingFields"]
  ): Promise<AskQuestionResponse> {
    const data: AskQuestionRequest = {
      postContent,
      conversationHistory,
      existingContext,
      missingFields,
    };
    return this.aiApiClient.askQuestion(data);
  }

  async generateEdit(
    text: string,
    prompt?: string,
    context?: GenerateEditRequest["context"],
    conversationHistory?: GenerateEditRequest["conversationHistory"],
    similarity?: number
  ): Promise<GenerateEditResponse> {
    const data: GenerateEditRequest = {
      text,
      prompt,
      context,
      conversationHistory,
      similarity,
    };
    return this.aiApiClient.generateEdit(data);
  }

  async analyzePost(
    postContent: string,
    existingProfile?: ProfileData
  ): Promise<AnalysisResult> {
    return this.aiApiClient.analyzePost({ postContent, existingProfile });
  }

  async extractFieldValue(transcript: string, fieldLabel: string): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are extracting structured data from natural language voice input.
The user is filling out a profile form field by field using voice input.
Extract ONLY the relevant value for the requested field from what the user said.
Be concise - extract just the core information, not full sentences.

Examples:
Field: "Current Title" | User says: "I'm the founder" → Extract: "Founder"
Field: "Company Name" | User says: "my company is called Acme Corp" → Extract: "Acme Corp"
Field: "Industry" | User says: "we're in SaaS" → Extract: "SaaS"
Field: "Location" | User says: "I'm based in San Francisco" → Extract: "San Francisco"
Field: "Total Users" | User says: "we have about 1000 users" → Extract: "1000"

Return ONLY the extracted value, nothing else.`
        },
        {
          role: "user",
          content: `Field: "${fieldLabel}"\nUser said: "${transcript}"\n\nExtract the value:`
        }
      ],
      temperature: 0.3,
      max_tokens: 100,
    });

    return completion.choices[0]?.message?.content?.trim() || transcript;
  }
}

export const openaiService = new OpenAIService(aiApiClient);
