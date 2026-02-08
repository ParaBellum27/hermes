from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends, Security
from fastapi.security import APIKeyHeader

from app.config import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.post('/match')
async def generate_summarized_matches(
    email: str = Form(...),
    query: str = Form(...),
):
	pass
