from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import StreamingResponse
from pyrewrite.models import AnalyzePostRequest, AnalysisResult, AuthUser, AskQuestionRequest, AskQuestionResponse, GenerateEditRequest, GenerateEditResponse, TextToSpeechRequest
from pyrewrite.services.openai import openai_service
from pyrewrite.dependencies import get_current_user
import io

router = APIRouter()

@router.post("/analyze-post", response_model=AnalysisResult)
async def analyze_post(
    body: AnalyzePostRequest,
    current_user: AuthUser = Depends(get_current_user) # Authentication is required
):
    # Validate postContent length
    if not body.postContent or len(body.postContent) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Post content is required.")
    if len(body.postContent) > 50000:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Post content exceeds maximum length of 50,000 characters.")

    try:
        result = await openai_service.analyze_post(body.postContent, body.existingProfile)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    except Exception as e:
        print(f"Analyze post error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to analyze post")

@router.post("/ask-question", response_model=AskQuestionResponse)
async def ask_question(
    body: AskQuestionRequest,
    current_user: AuthUser = Depends(get_current_user) # Authentication is required
):
    # Validate postContent
    if not body.postContent or len(body.postContent) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Post content is required and must be a string")
    if len(body.postContent) > 50000:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Post content exceeds maximum length of 50,000 characters")

    # Validate conversationHistory length
    if len(body.conversationHistory) > 50:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="conversationHistory exceeds maximum of 50 messages")

    try:
        result = await openai_service.ask_question(
            body.postContent,
            body.conversationHistory,
            body.existingContext,
            body.missingFields
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    except Exception as e:
        print(f"Ask question error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to ask question")

@router.post("/generate-edit", response_model=GenerateEditResponse)
async def generate_edit(
    body: GenerateEditRequest,
    current_user: AuthUser = Depends(get_current_user) # Authentication is required
):
    # Validate text
    if not body.text or len(body.text) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Text is required and must be a string")
    if len(body.text) > 50000:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Text exceeds maximum length of 50,000 characters")

    # Validate optional prompt
    if body.prompt is not None and not isinstance(body.prompt, str):
      raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Prompt must be a string")

    # Validate conversationHistory if provided
    if body.conversationHistory is not None and not isinstance(body.conversationHistory, list):
      raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="conversationHistory must be an array")

    try:
        result = await openai_service.generate_edit(
            body.text,
            body.prompt,
            body.context,
            body.conversationHistory,
            body.similarity
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    except Exception as e:
        print(f"Generate edit error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to generate edit")

@router.post("/text-to-speech")
async def text_to_speech(
    body: TextToSpeechRequest,
    current_user: AuthUser = Depends(get_current_user) # Authentication is required
):
    # Text validation is handled by TextToSpeechRequest Pydantic model implicitly
    # Max text length handled by Pydantic model and in service.

    try:
        audio_content = await openai_service.generate_speech(body.text, body.voice)
        return StreamingResponse(io.BytesIO(audio_content), media_type="audio/mpeg")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        print(f"Text-to-speech error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to generate speech")
