from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel, Field
from database import get_db
from models.review import Review
from models.user import User
import uuid
from datetime import datetime

router = APIRouter()

# Pydantic models for request/response
class ReviewCreate(BaseModel):
    user_id: str = Field(..., description="User ID")
    movie_id: int = Field(..., description="TMDB Movie ID")
    content: str = Field(..., min_length=10, max_length=1000, description="Review content")
    rating: float = Field(..., ge=1.0, le=5.0, description="Rating from 1.0 to 5.0")

class ReviewResponse(BaseModel):
    id: str
    user_id: str
    movie_id: int
    content: str
    rating: float
    sentiment: str | None
    created_at: datetime
    username: str | None = None
    
    class Config:
        from_attributes = True

@router.post("/", response_model=ReviewResponse)
async def create_review(review_data: ReviewCreate, db: Session = Depends(get_db)):
    """Create a new review for a movie"""
    try:
        # Verify user exists
        user = db.query(User).filter(User.id == review_data.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if user has already reviewed this movie
        existing_review = db.query(Review).filter(
            Review.user_id == review_data.user_id,
            Review.movie_id == review_data.movie_id
        ).first()
        
        if existing_review:
            raise HTTPException(status_code=400, detail="User has already reviewed this movie")
        
        # Create new review
        new_review = Review(
            user_id=review_data.user_id,
            movie_id=review_data.movie_id,
            content=review_data.content,
            rating=review_data.rating
        )
        
        db.add(new_review)
        db.commit()
        db.refresh(new_review)
        
        # Perform sentiment analysis
        try:
            from routers.sentiment import analyze_sentiment, SentimentRequest
            sentiment_request = SentimentRequest(text=review_data.content)
            sentiment_result = await analyze_sentiment(sentiment_request)
            new_review.sentiment = sentiment_result.sentiment
        except Exception as e:
            # If sentiment analysis fails, continue without it
            new_review.sentiment = "neutral"
        
        # Prepare response
        response = ReviewResponse(
            id=str(new_review.id),
            user_id=str(new_review.user_id),
            movie_id=new_review.movie_id,
            content=new_review.content,
            rating=new_review.rating,
            sentiment=new_review.sentiment,
            created_at=new_review.created_at,
            username=user.username
        )
        
        return response
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create review: {str(e)}")

@router.get("/{movie_id}", response_model=List[ReviewResponse])
async def get_movie_reviews(movie_id: int, db: Session = Depends(get_db)):
    """Get all reviews for a specific movie"""
    try:
        reviews = db.query(Review, User).join(User).filter(Review.movie_id == movie_id).all()
        
        response = []
        for review, user in reviews:
            response.append(ReviewResponse(
                id=str(review.id),
                user_id=str(review.user_id),
                movie_id=review.movie_id,
                content=review.content,
                rating=review.rating,
                sentiment=review.sentiment,
                created_at=review.created_at,
                username=user.username
            ))
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch reviews: {str(e)}")

@router.get("/user/{user_id}", response_model=List[ReviewResponse])
async def get_user_reviews(user_id: str, db: Session = Depends(get_db)):
    """Get all reviews by a specific user"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        reviews = db.query(Review).filter(Review.user_id == user_id).all()
        
        response = []
        for review in reviews:
            response.append(ReviewResponse(
                id=str(review.id),
                user_id=str(review.user_id),
                movie_id=review.movie_id,
                content=review.content,
                rating=review.rating,
                sentiment=review.sentiment,
                created_at=review.created_at,
                username=user.username
            ))
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user reviews: {str(e)}")

@router.get("/stats/{movie_id}")
async def get_movie_rating_stats(movie_id: int, db: Session = Depends(get_db)):
    """Get rating statistics for a movie"""
    try:
        from sqlalchemy import func
        
        stats = db.query(
            func.avg(Review.rating).label('average_rating'),
            func.count(Review.id).label('total_reviews')
        ).filter(Review.movie_id == movie_id).first()
        
        return {
            "movie_id": movie_id,
            "average_rating": round(float(stats.average_rating), 1) if stats.average_rating else 0.0,
            "total_reviews": stats.total_reviews or 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch movie stats: {str(e)}") 