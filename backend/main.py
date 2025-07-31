from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="MoView API",
    description="Movie Review API with TMDB integration",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to MoView API"}

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include routers
from routers import movies, reviews, sentiment, auth
app.include_router(movies.router, prefix="/movies", tags=["movies"])
app.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
app.include_router(sentiment.router, prefix="/sentiment", tags=["sentiment"])
app.include_router(auth.router, prefix="/auth", tags=["authentication"])

# Initialize database tables
@app.on_event("startup")
async def startup_event():
    from database import create_tables
    create_tables()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 