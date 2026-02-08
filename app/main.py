from fastapi import FastAPI
from pyrewrite.creators import router as creators_router
from pyrewrite.ai.route import router as ai_router
from pyrewrite.content.route import router as content_router
from pyrewrite.extraction.route import router as extraction_router
from pyrewrite.posts.route import router as posts_router
from pyrewrite.scrape.route import router as scrape_router
from pyrewrite.user_data.route import router as user_data_router
from pyrewrite.user_posts.route import router as user_posts_router

app = FastAPI()

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
