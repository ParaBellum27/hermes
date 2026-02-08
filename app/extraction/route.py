from fastapi import APIRouter, HTTPException, status, Depends
from pyrewrite.models import ExtractFieldValueRequest, AuthUser
from pyrewrite.services.openai import openai_service
from pyrewrite.dependencies import get_current_user
from typing import Dict, Any

router = APIRouter()

@router.post("/", response_model=Dict[str, Any]) # Return type is { "value": extractedValue }
async def extract_field_value(
    body: ExtractFieldValueRequest,
    current_user: AuthUser = Depends(get_current_user) # Authentication is required
):
    # Validate transcript
    if not body.transcript or len(body.transcript) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Transcript is required and must be a string")
    if len(body.transcript) > 5000:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Transcript exceeds maximum length of 5,000 characters")

    # Validate fieldLabel
    if not body.fieldLabel or len(body.fieldLabel) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Field label is required and must be a string")

    try:
        extracted_value = await openai_service.extract_field_value(body.transcript, body.fieldLabel)
        return {"value": extracted_value}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    except Exception as e:
        print(f"Extract field value error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to extract value")
