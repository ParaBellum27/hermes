from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.creators import router as creators_router
from app.ai.route import router as ai_router
from app.content.route import router as content_router
from app.extraction.route import router as extraction_router
from app.posts.route import router as posts_router
from app.scrape.route import router as scrape_router
from app.user_data.route import router as user_data_router
from app.user_posts.route import router as user_posts_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(creators_router, prefix="/api/creators", tags=["creators"])
app.include_router(ai_router, prefix="/api/ai", tags=["ai"])
app.include_router(content_router, prefix="/api/content", tags=["content"])
app.include_router(extraction_router, prefix="/api/extract-field-value", tags=["extraction"])
app.include_router(posts_router, prefix="/api/posts", tags=["posts"])
app.include_router(scrape_router, prefix="/api/scrape", tags=["scrape"])
app.include_router(user_data_router, prefix="/api/user-data", tags=["user_data"])
app.include_router(user_posts_router, prefix="/api/user-posts", tags=["user_posts"])

@app.get("/")
async def read_root():
    return {"message": "Hello, FastAPI in pyrewrite!"}

# TODO: Implement other API endpoints from the existing project.
