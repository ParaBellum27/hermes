from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends

from app.config import get_logger
from sqlmodel import Session

import json

router = APIRouter()
logger = get_logger(__name__)

@router.post('/upload/person')
async def process_person(
    company: str = Form(...),
    person: str = Form(...),
    session: Session = Depends(DatabaseManager.get_session)
):
	pass
