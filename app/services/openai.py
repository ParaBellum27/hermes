import os
import json
from typing import Dict, Any, List, Optional, Literal
import openai
from openai import OpenAI
from pyrewrite.models import Question, AnalysisResult, ConversationMessage, AskQuestionResponse, GenerateEditResponse

class OpenAIService:
    def __init__(self):
        api_key = os.getenv("OPEN_AI_API_KEY")
        if not api_key:
            raise ValueError("OPEN_AI_API_KEY environment variable is not set.")
        self.openai_client = OpenAI(api_key=api_key)

    async def generate_speech(
        self,
        text: str,
        voice: Literal["alloy", "echo", "fable", "onyx", "nova", "shimmer"] = "alloy"
    ) -> bytes: # Return type changed to bytes for audio data
        mp3 = await self.openai_client.audio.speech.create(
            model="tts-1",
            voice=voice,
            input=text,
        )
        return mp3.read() # Read as bytes

    async def ask_question(
        self,
        post_content: str,
        conversation_history: List[ConversationMessage],
        existing_context: Optional[Dict[str, str]] = None,
        missing_fields: Optional[List[str]] = None
    ) -> AskQuestionResponse:
        # Build context section from existing profile data
        existing_data_section = ""
        if existing_context and len(existing_context) > 0:
            context_parts = [f"- {key}: {value}" for key, value in existing_context.items() if value and value.strip()]
            if len(context_parts) > 0:
                existing_data_section = "\n\nWE ALREADY KNOW THIS ABOUT THE USER (do NOT ask about these):\n" + "\n".join(context_parts)

        # Build missing fields section
        missing_fields_section = ""
        if missing_fields and len(missing_fields) > 0:
            missing_fields_section = "\n\nFIELDS WE STILL NEED (prioritize asking about these):\n" + "\n".join([f"- {f}" for f in missing_fields])

        system_prompt = f"""You are a helpful assistant gathering context to personalize content for a user.

Your goal: Ask the user questions to understand their background, company, industry, experiences, and audience so you can rewrite the provided post authentically for them.
{existing_data_section}
{missing_fields_section}

CRITICAL: Identify every specific data point in the original post and get the user's version:
- Years/dates (e.g., "graduated in 2018" → ask THEIR graduation year)
- Company names (e.g., "worked at Google" → ask THEIR company)
- Job titles, numbers, metrics, locations
- Personal stories/anecdotes (get THEIR equivalent experience)
- Industry-specific details

DO NOT ask about information we already have. Focus ONLY on what's missing and what's needed for this specific post.

Rules:
1. If we already have all the basic info needed (name, company, title, industry), respond with ONLY: "READY_TO_GENERATE"
2. If important context is missing, ask ONE specific, relevant question at a time
3. Base follow-up questions on their previous answers
4. After getting critical missing info OR after 3-4 questions, respond with ONLY: "READY_TO_GENERATE"
5. Only ask about post-specific details (stories, examples, metrics) if they're critical and not already covered
6. Make questions conversational and natural

Post to personalize:
{post_content}

Current conversation length: {len(conversation_history)} messages

{('If we have sufficient profile data for this post, respond with ONLY "READY_TO_GENERATE". Otherwise, ask your first question about critical missing context.' if len(conversation_history) == 0 else 'Ask your next question about critical missing info, or respond with ONLY "READY_TO_GENERATE" if you have enough context.')}"""

        messages_for_openai = [
            {"role": "system", "content": system_prompt},
            *([{"role": msg.role, "content": msg.content} for msg in conversation_history])
        ]

        try:
            completion = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages_for_openai,
                temperature=0.7,
            )

            response_content = completion.choices[0].message.content.strip()
            if not response_content:
                raise ValueError("OpenAI API returned an empty response.")

            # Check if response contains READY_TO_GENERATE (be lenient with AI being chatty)
            if "READY_TO_GENERATE" in response_content:
                return AskQuestionResponse(ready=True)
            else:
                return AskQuestionResponse(ready=False, question=response_content)

        except openai.APIError as e:
            print(f"OpenAI API Error: {e}")
            raise ValueError(f"OpenAI API error: {e.code} - {e.message}") from e
        except Exception as e:
            print(f"Unexpected error in ask_question: {e}")
            raise

    async def generate_edit(
        self,
        text: str,
        prompt: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        conversation_history: Optional[List[ConversationMessage]] = None,
        similarity: Optional[int] = None # 0-100
    ) -> GenerateEditResponse:
        context_section = ""
        if context and len(context) > 0:
            parts = []
            for key, value in context.items():
                if isinstance(value, str) and "?" in key: # If key looks like a question (contains "?"), format as Q&A
                    parts.append(f"Q: {key}\nA: {value}")
                else: # Otherwise format as key-value
                    parts.append(f"{key}: {value}")
            context_section = "\n\nIMPORTANT USER CONTEXT:\n" + "\n\n".join(parts) + "\n\nUse this context to make the content authentic, personalized, and relevant to the user's specific situation."

        # Build similarity instruction
        similarity_instruction = ""
        if similarity is not None:
            extra_instructions = ""
            if similarity < 30:
                extra_instructions = """
BECAUSE THIS IS BELOW 30% SIMILARITY:
- Completely restructure the post - don't follow the original's flow
- Use different sentence structures and lengths throughout
- Change the opening hook entirely
- Rearrange the order of ideas
- Rewrite every sentence from scratch - no copy-pasting phrases
- Make it feel like a completely different post about the same topic"""

            similarity_instruction = f"""
YOU ARE A COPY TRADER: Extract the core best parts and winning patterns from the original, but never plagiarize.

KEEP: The same subject matter, topic, and core insights.

SIMILARITY LEVEL: Make the output {similarity}% similar to the original in terms of:
- Structure and layout
- Sentence patterns
- Word choice and phrasing

At {similarity}% similarity, adjust how much you change the structure, sentences, and words accordingly. Lower percentages = more different from the original.{extra_instructions}"""

        system_prompt = ""
        if prompt:
            system_prompt = f"You are a content editor. The conversation history shows previous edits that have ALREADY been applied. Only apply the LATEST user instruction - do NOT re-apply previous changes. Return ONLY the edited content with no explanations.{context_section}{similarity_instruction}"
        elif context and len(context) > 0:
            system_prompt = f"""You are a content personalization expert. Your job is to adapt the provided post to make it feel like it was written BY the user FOR their specific audience.

IMPORTANT RULES:
1. KEEP the core message, story, and insights from the original post
2. ADAPT the details, examples, and framing to match the user's context
3. If the original mentions a specific company/industry, replace it with the user's company/industry
4. If the original has a personal story, adapt it to feel like the user's experience
5. Maintain the same tone and structure as the original
6. DO NOT invent completely new ideas - stay true to the original post's message
7. Make it feel authentic to the user's background and audience
8. KEEP approximately the same word count as the original (within 10-20%)

Think of this as "translating" the post to the user's world, not writing a new post.{context_section}{similarity_instruction}"""
        else:
            system_prompt = f"""You are a copy trader. Your job is to rewrite the provided post based on the similarity level, keeping the same examples, stories, and companies from the original.

IMPORTANT RULES:
1. DO NOT add placeholders like [Your Company Name] or [Your Industry]
2. KEEP the same examples, companies, and stories from the original (e.g., if it mentions Celsius, keep Celsius)
3. Rewrite the structure, sentences, and wording based on the similarity percentage
4. The goal is to learn from the winning pattern, not personalize it
5. KEEP approximately the same word count as the original (within 10-20%){similarity_instruction}"""

        messages_for_openai: List[Dict[str, str]] = [
            {"role": "system", "content": system_prompt},
        ]

        text_message = ""
        if prompt:
            text_message = f"Here is the current text:\n\n{text}\n\nEdit instruction: {prompt}"
        else:
            text_message = f"Here is the text to edit:\n\n{text}"

        messages_for_openai.append({"role": "user", "content": text_message})

        if conversation_history:
            messages_for_openai.extend([{"role": msg.role, "content": msg.content} for msg in conversation_history])

        try:
            completion = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages_for_openai,
                temperature=0.7,
            )

            suggested_text = completion.choices[0].message.content or ""

            # Calculate actual additions/deletions by comparing words
            original_words = set(text.lower().split())
            suggested_words = set(suggested_text.lower().split())

            additions = len(suggested_words - original_words)
            deletions = len(original_words - suggested_words)

            return GenerateEditResponse(
                originalText=text,
                suggestedText=suggested_text,
                additions=additions,
                deletions=deletions,
            )

        except openai.APIError as e:
            print(f"OpenAI API Error: {e}")
            raise ValueError(f"OpenAI API error: {e.code} - {e.message}") from e
        except Exception as e:
            print(f"Unexpected error in generate_edit: {e}")
            raise

    async def analyze_post(self, post_content: str, existing_profile: Optional[Dict[str, Any]] = None) -> AnalysisResult:
        profile_context = ""
        if existing_profile and len(existing_profile) > 0:
            known = [f"{k}: {v}" for k, v in existing_profile.items() if v and str(v).strip()]
            if known:
                profile_context = f"\n\nWE ALREADY KNOW ABOUT THE USER:\n{'; '.join(known)}\n\nDO NOT ask about things we already know."

        messages = [
            {
                "role": "system",
                "content": f"""You are an expert at analyzing LinkedIn posts to figure out what personal info is needed to rewrite them for someone else.

Your job:
1. Read the post carefully
2. Identify SPECIFIC details that would need to be personalized (company names, metrics, experiences, etc.)
3. Generate 1-3 SHORT, SPECIFIC questions to gather the user's equivalent info

Return a JSON object with:
{{
  "analysis": "Brief 1-sentence summary of what this post is about",
  "dataPoints": ["List of specific things in the post that need personalization"],
  "questions": [
    {{
      "field": "fieldName",
      "question": "The specific question to ask",
      "why": "Brief reason why we need this"
    }}
  ]
}}

Available field names: fullName, currentTitle, companyName, industry, productName, targetCustomer, experience, metrics, achievement

Rules:
- Questions should be SPECIFIC to this post, not generic
- If post mentions "$1M ARR", ask about THEIR revenue/metrics
- If post mentions a specific experience, ask about THEIR similar experience
- Max 3 questions
- Keep questions short and conversational
- If post is generic/motivational and we have their name, return empty questions array{profile_context}"""
            },
            {
                "role": "user",
                "content": f"Analyze this post:\n\n{post_content}"
            }
        ]

        try:
            completion = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.3,
                response_format={"type": "json_object"}
            )

            response_content = completion.choices[0].message.content
            if not response_content:
                raise ValueError("OpenAI API returned an empty response.")

            parsed_response = json.loads(response_content)
            
            # Ensure the structure matches AnalysisResult
            return AnalysisResult(
                analysis=parsed_response.get("analysis", "Unable to analyze"),
                dataPoints=parsed_response.get("dataPoints", []),
                questions=[Question(**q) for q in parsed_response.get("questions", [])]
            )
        except json.JSONDecodeError as e:
            print(f"JSON Decode Error: {e}")
            print(f"Raw response: {response_content}")
            raise ValueError("Failed to parse OpenAI response as JSON.") from e
        except openai.APIError as e:
            print(f"OpenAI API Error: {e}")
            raise ValueError(f"OpenAI API error: {e.code} - {e.message}") from e
        except Exception as e:
            print(f"Unexpected error in analyze_post: {e}")
            raise

    async def extract_field_value(self, transcript: str, field_label: str) -> str:
        messages = [
            {
                "role": "system",
                "content": """You are extracting structured data from natural language voice input.
The user is filling out a profile form field by field using voice input.
Extract ONLY the relevant value for the requested field from what the user said.
Be concise - extract just the core information, not full sentences.

Examples:
Field: "Current Title" | User says: "I'm the founder" → Extract: "Founder"
Field: "Company Name" | User says: "my company is called Acme Corp" → Extract: "Acme Corp"
Field: "Industry" | User says: "we're in SaaS" → Extract: "SaaS"
Field: "Location" | User says: "I'm based in San Francisco" → Extract: "San Francisco"
Field: "Total Users" | User says: "we have about 1000 users" → Extract: "1000"

Return ONLY the extracted value, nothing else."""
            },
            {
                "role": "user",
                "content": f"Field: \"{field_label}\"\nUser said: \"{transcript}\"\n\nExtract the value:"
            }
        ]

        try:
            completion = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.3,
                max_tokens=100,
            )
            return completion.choices[0].message.content.strip() or transcript
        except openai.APIError as e:
            print(f"OpenAI API Error: {e}")
            raise ValueError(f"OpenAI API error: {e.code} - {e.message}") from e
        except Exception as e:
            print(f"Unexpected error in extract_field_value: {e}")
            raise

# Singleton instance
openai_service = OpenAIService()