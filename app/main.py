from dotenv import load_dotenv
load_dotenv()

import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import time
from app.config import setup_logging, get_logger
from fastapi.security import APIKeyHeader

# Initialize logging
setup_logging(log_level="INFO", log_to_file=True)
logger = get_logger(__name__)

logger.info(f"Current working directory: {os.getcwd()}")


from app.routes import *


# Add request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all HTTP requests and responses"""
    start_time = time.time()

    # Log incoming request
    logger.info(
        f"Incoming request: {request.method} {request.url.path} - "
        f"Client: {request.client.host if request.client else 'unknown'}"
    )

    # Process request
    response = await call_next(request)

    # Calculate request duration
    duration = time.time() - start_time

    # Log response
    logger.info(
        f"Completed request: {request.method} {request.url.path} - "
        f"Status: {response.status_code} - Duration: {duration:.3f}s"
    )

    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(people_search_router, prefix="/search", tags=["people_search"])

if __name__ == "__main__":
    app.run(debug=True)
