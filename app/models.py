from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any, Literal

class CreatorProfile(BaseModel):
    id: Optional[str] = None  # Assuming 'id' or 'creator_id' is the primary key
    creator_id: Optional[int] = None
    profile_url: str
    display_name: Optional[str] = None
    platform: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CreatorProfileForContent(BaseModel):
    creator_id: int
    profile_url: str
    platform: str
    display_name: Optional[str] = None

    class Config:
        from_attributes = True

class CreatorContent(BaseModel):
    content_id: int
    creator_id: int
    post_url: str
    post_raw: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CreatorContentWithProfile(BaseModel):
    content_id: int
    creator_id: int
    post_url: str
    post_raw: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    creator_profiles: CreatorProfileForContent # Nested Pydantic model

    class Config:
        from_attributes = True

class UserFollow(BaseModel):
    user_id: str
    creator_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class FollowRequestBody(BaseModel):
    creatorId: int

class AuthUser(BaseModel):
    id: str
    email: Optional[str] = None
    # Add other relevant user fields as needed

class AnalyzePostRequest(BaseModel):
    postContent: str
    existingProfile: Optional[Dict[str, Any]] = None # Assuming existingProfile can be a dictionary of any structure

class Question(BaseModel):
    field: str
    question: str
    why: str

class DataPoint(BaseModel):
    # This might need to be more specific based on actual dataPoints
    # For now, assuming it's just a string, but the original implies more structure.
    # Re-reading the original, dataPoints is a list of strings.
    pass

class AnalysisResult(BaseModel):
    analysis: str
    dataPoints: List[str] # Corrected based on re-read
    questions: List[Question]

class ConversationMessage(BaseModel):
    role: Literal["assistant", "user"]
    content: str

class AskQuestionRequest(BaseModel):
    postContent: str
    conversationHistory: List[ConversationMessage] = []
    existingContext: Optional[Dict[str, str]] = None
    missingFields: Optional[List[str]] = None

class AskQuestionResponse(BaseModel):
    ready: bool
    question: Optional[str] = None

class GenerateEditRequest(BaseModel):
    text: str
    prompt: Optional[str] = None
    context: Optional[Dict[str, Any]] = None # Assuming context can be a dictionary of any structure
    conversationHistory: Optional[List[ConversationMessage]] = None
    similarity: Optional[int] = None # 0-100

class GenerateEditResponse(BaseModel):
    originalText: str
    suggestedText: str
    additions: int
    deletions: int

class TextToSpeechRequest(BaseModel):
    text: str
    voice: Literal["alloy", "echo", "fable", "onyx", "nova", "shimmer"] = "alloy"

# ContentPost related models
class PostStats(BaseModel):
    total_reactions: Optional[int] = None
    comments: Optional[int] = None
    reposts: Optional[int] = None

class PostMedia(BaseModel):
    type: Optional[str] = None
    url: Optional[str] = None

class Article(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None

class ContentPost(BaseModel):
    id: int
    title: str
    author: str
    timeAgo: str
    isHighlighted: bool
    creatorId: int
    postUrl: str
    postRaw: str # This should be the parsed text content
    text: str
    postedAt: Optional[str] = None # Date string
    postedAtTimestamp: Optional[int] = None # Unix timestamp
    postType: Optional[str] = None
    stats: Optional[PostStats] = None
    media: Optional[List[PostMedia]] = None
    article: Optional[Article] = None

class ExtractFieldValueRequest(BaseModel):
    transcript: str
    fieldLabel: str

class LinkedInScrapeRequest(BaseModel):
    profileUrls: List[str] = Field(..., min_length=1, max_length=50)

# Apify related models
class ApiMaestroAuthor(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    headline: Optional[str] = None
    username: Optional[str] = None
    profile_url: Optional[str] = None
    profile_picture: Optional[str] = None

class ApiMaestroStats(BaseModel):
    total_reactions: Optional[int] = None
    like: Optional[int] = None
    comments: Optional[int] = None
    reposts: Optional[int] = None

class ApiMaestroMedia(BaseModel):
    type: Optional[str] = None
    url: Optional[str] = None

class ApiMaestroArticle(BaseModel):
    url: Optional[str] = None
    title: Optional[str] = None

class ApiMaestroPostedAt(BaseModel):
    date: Optional[str] = None
    relative: Optional[str] = None
    timestamp: Optional[int] = None

class ApiMaestroPost(BaseModel):
    urn: str
    full_urn: Optional[str] = None
    posted_at: Optional[ApiMaestroPostedAt] = None
    text: Optional[str] = None
    url: Optional[str] = None
    post_type: Optional[str] = None
    author: Optional[ApiMaestroAuthor] = None
    stats: Optional[ApiMaestroStats] = None
    media: Optional[List[ApiMaestroMedia]] = None
    article: Optional[ApiMaestroArticle] = None

class ScrapeResult(BaseModel):
    success: bool
    postsScraped: int
    posts: Optional[List[ApiMaestroPost]] = None
    error: Optional[str] = None
    urlsSent: Optional[List[str]] = None

class UserDataPutRequest(BaseModel):
    userId: str
    data: Dict[str, Any] # 'data' can be any JSON structure

class UserDataRow(BaseModel):
    user_id: str
    key: str
    data: Dict[str, Any]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserPost(BaseModel):
    post_id: str
    user_id: str
    title: Optional[str] = None
    raw_text: str
    status: Optional[str] = None
    editor_state: Optional[Dict[str, Any]] = None
    scheduled_for: Optional[datetime] = None
    published_at: Optional[datetime] = None
    word_count: Optional[int] = None
    inspiration_summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CreateUserPostRequest(BaseModel):
    userId: str
    title: Optional[str] = None
    rawText: Optional[str] = None
    status: Optional[str] = None

class UpdateUserPostRequest(BaseModel):
    title: Optional[str] = None
    rawText: Optional[str] = None
    status: Optional[str] = None

