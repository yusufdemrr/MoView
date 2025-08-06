from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

# CORS middleware - Update for production
allowed_origins = [
    "http://localhost:3000",  # Local development
    "http://frontend:80",     # Docker
    "https://*.vercel.app",   # Vercel deployments (keeping for backward compatibility)
    "https://*.onrender.com", # Render deployments
    "https://moview-frontend.onrender.com", # Specific Render frontend URL
]

# Allow all origins in production for flexibility (you can restrict this later)
if os.getenv("ENVIRONMENT") == "production":
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
    port = int(os.getenv("PORT", 8000))  # Use PORT env var, fallback to 8000
    uvicorn.run(app, host="0.0.0.0", port=port) 