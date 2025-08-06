from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
from database import get_db
from models.review import Review
from models.user import User
import uuid
import os
import requests
import asyncio
from datetime import datetime
from groq import Groq

router = APIRouter()

def simple_sentiment_analysis(text: str) -> str:
    """Simple sentiment analysis based on keywords"""
    text_lower = text.lower()
    
    positive_words = [
        'good', 'great', 'excellent', 'amazing', 'love', 'best', 'awesome', 
        'fantastic', 'wonderful', 'brilliant', 'outstanding', 'superb', 
        'incredible', 'perfect', 'beautiful', 'stunning', 'masterpiece',
        'enjoyable', 'entertaining', 'impressive', 'remarkable', 'exceptional'
    ]
    
    negative_words = [
        'bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 
        'disappointing', 'boring', 'poor', 'waste', 'pathetic', 'garbage',
        'stupid', 'ridiculous', 'annoying', 'frustrating', 'dreadful',
        'mediocre', 'overrated', 'bland', 'tedious', 'unwatchable'
    ]
    
    positive_score = sum(1 for word in positive_words if word in text_lower)
    negative_score = sum(1 for word in negative_words if word in text_lower)
    
    if positive_score > negative_score:
        return 'positive'
    elif negative_score > positive_score:
        return 'negative'
    else:
        return 'neutral'

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

class RecommendedMovie(BaseModel):
    movie_id: int
    title: str
    poster_path: str | None
    overview: str
    release_date: str
    vote_average: float
    reason: str  # Why this movie was recommended

class RecommendationResponse(BaseModel):
    user_id: str
    recommendations: List[RecommendedMovie]

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
        
        # Perform sentiment analysis using simple keyword-based method
        new_review.sentiment = simple_sentiment_analysis(review_data.content)
        
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

# Initialize Groq client for recommendations
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
TMDB_API_KEY = os.getenv("TMDB_API_KEY")

groq_client = None
if GROQ_API_KEY:
    try:
        import groq
        groq_client = groq.Groq(api_key=GROQ_API_KEY)
    except Exception:
        groq_client = None

# Alternative Groq API function using direct HTTP requests
async def groq_api_request(messages, model="llama-3.3-70b-versatile", max_tokens=1000, temperature=0.7):
    """Make direct HTTP request to Groq API as fallback"""
    if not GROQ_API_KEY:
        return None
    
    try:
        import requests
        
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        data = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        return response.json()
    except Exception:
        return None

async def get_movie_metadata_from_tmdb(movie_id: int) -> Optional[dict]:
    """Get detailed movie metadata including genres and keywords from TMDb API"""
    if not TMDB_API_KEY:
        return None
    
    try:
        # Get movie details
        details_url = f"https://api.themoviedb.org/3/movie/{movie_id}"
        details_params = {
            "api_key": TMDB_API_KEY,
            "language": "en-US"
        }
        
        details_response = requests.get(details_url, params=details_params, timeout=10)
        details_response.raise_for_status()
        movie_details = details_response.json()
        
        # Get movie keywords
        keywords_url = f"https://api.themoviedb.org/3/movie/{movie_id}/keywords"
        keywords_params = {"api_key": TMDB_API_KEY}
        
        keywords_response = requests.get(keywords_url, params=keywords_params, timeout=10)
        keywords_response.raise_for_status()
        keywords_data = keywords_response.json()
        
        return {
            "id": movie_details["id"],
            "title": movie_details["title"],
            "genres": [genre["name"] for genre in movie_details.get("genres", [])],
            "keywords": [keyword["name"] for keyword in keywords_data.get("keywords", [])[:10]],  # Limit to 10 keywords
            "overview": movie_details.get("overview", ""),
            "release_date": movie_details.get("release_date", ""),
            "vote_average": movie_details.get("vote_average", 0.0),
            "runtime": movie_details.get("runtime", 0),
            "director": None,  # We'll get this from credits if needed
            "production_companies": [company["name"] for company in movie_details.get("production_companies", [])[:3]]
        }
        
    except Exception:
        return None

async def get_user_movie_preferences_enhanced(user_reviews: List[Review]) -> str:
    """Analyze user's movie preferences with enhanced metadata from TMDb"""
    if not user_reviews:
        return "User has no movie reviews yet"
    
    # Sort reviews by rating to get the highest-rated ones
    high_rated = sorted([r for r in user_reviews if r.rating >= 4.0], key=lambda x: x.rating, reverse=True)
    low_rated = [r for r in user_reviews if r.rating <= 2.5]
    
    preference_text = f"User has rated {len(user_reviews)} movies. "
    
    # Enhanced profiling with metadata for top-rated movies
    if high_rated:
        preference_text += f"Highly rated movies (4+ stars): {len(high_rated)} movies. "
        
        # Get metadata for top 3-5 highest-rated movies to avoid API limits
        top_movies_to_analyze = min(5, len(high_rated))
        favorite_genres = []
        favorite_keywords = []
        favorite_movies_details = []
        
        # Add a small delay between API calls to respect rate limits
        for i, review in enumerate(high_rated[:top_movies_to_analyze]):
            if i > 0:  # Add delay between requests (except for the first one)
                await asyncio.sleep(0.25)  # 250ms delay between requests
                
            movie_metadata = await get_movie_metadata_from_tmdb(review.movie_id)
            if movie_metadata:
                favorite_genres.extend(movie_metadata["genres"])
                favorite_keywords.extend(movie_metadata["keywords"])
                favorite_movies_details.append({
                    "title": movie_metadata["title"],
                    "rating": review.rating,
                    "genres": movie_metadata["genres"],
                    "keywords": movie_metadata["keywords"][:5],  # Top 5 keywords
                    "review_snippet": review.content[:100]
                })
        
        # Count genre preferences
        from collections import Counter
        genre_counts = Counter(favorite_genres)
        keyword_counts = Counter(favorite_keywords)
        
        # Add genre preferences to the profile
        if genre_counts:
            top_genres = [genre for genre, count in genre_counts.most_common(5)]
            preference_text += f"Favorite genres: {', '.join(top_genres)}. "
        
        # Add keyword preferences
        if keyword_counts:
            top_keywords = [keyword for keyword, count in keyword_counts.most_common(8)]
            preference_text += f"Preferred themes/elements: {', '.join(top_keywords)}. "
        
        # Add specific movie examples with context
        preference_text += "Specific favorites: "
        for movie in favorite_movies_details:
            preference_text += f"'{movie['title']}' (rated {movie['rating']}/5, genres: {', '.join(movie['genres'][:3])}) - '{movie['review_snippet']}...' "
    
    # Add disliked movies for contrast
    if low_rated:
        preference_text += f"Lower-rated movies (2.5 or less): {len(low_rated)} movies. "
        for review in low_rated[:2]:
            movie_metadata = await get_movie_metadata_from_tmdb(review.movie_id)
            if movie_metadata:
                preference_text += f"Disliked '{movie_metadata['title']}' (rated {review.rating}/5, genres: {', '.join(movie_metadata['genres'][:2])}): '{review.content[:80]}...' "
            else:
                preference_text += f"Disliked movie ID {review.movie_id} (rated {review.rating}/5): '{review.content[:80]}...' "
    
    return preference_text

async def get_movie_details_from_tmdb(movie_title: str) -> Optional[dict]:
    """Search for movie details using TMDb API"""
    if not TMDB_API_KEY:
        return None
    
    try:
        # Search for the movie
        search_url = "https://api.themoviedb.org/3/search/movie"
        params = {
            "api_key": TMDB_API_KEY,
            "query": movie_title,
            "language": "en-US"
        }
        
        response = requests.get(search_url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data.get("results") and len(data["results"]) > 0:
            movie = data["results"][0]  # Take the first (most relevant) result
            return {
                "movie_id": movie["id"],
                "title": movie["title"],
                "poster_path": movie.get("poster_path"),
                "overview": movie.get("overview", ""),
                "release_date": movie.get("release_date", ""),
                "vote_average": movie.get("vote_average", 0.0)
            }
    except Exception:
        pass
    
    return None

@router.get("/recommendations/{user_id}", response_model=RecommendationResponse)
async def get_movie_recommendations(user_id: str, db: Session = Depends(get_db)):
    """Get personalized movie recommendations for a user using Groq AI"""
    try:
        # Verify user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get user's reviews
        user_reviews = db.query(Review).filter(Review.user_id == user_id).all()
        
        if not user_reviews:
            raise HTTPException(status_code=400, detail="User has no reviews yet. Please rate some movies first to get recommendations.")
        
        # Analyze user preferences with enhanced metadata
        try:
            preferences = await get_user_movie_preferences_enhanced(user_reviews)
        except Exception:
            # Fallback to basic preference analysis
            preferences = f"User has rated {len(user_reviews)} movies. Basic analysis available."
        
        # Use Groq AI to generate recommendations
        recommendations = []
        
        # Try Groq client first, then direct API request
        ai_response = None
        
        if groq_client:
            try:
                prompt = f"""
                You are a movie recommendation expert. Based on this detailed user profile with genre preferences and movie metadata, recommend exactly 4 movies they would love.
                
                User's detailed movie profile:
                {preferences}
                
                Recommendation Guidelines:
                1. Prioritize movies that match their favorite genres and themes/keywords
                2. Consider their rating patterns and review content sentiment
                3. Avoid movies they've already rated
                4. Include a mix of popular classics and critically acclaimed films
                5. Ensure variety across different sub-genres while staying within their preferences
                6. Consider the specific elements they praised in their reviews
                
                For each recommendation, provide:
                - "title": the exact movie title (must be searchable on TMDb)
                - "reason": a personalized explanation (max 60 words) connecting the recommendation to their specific preferences, mentioning relevant genres/themes
                
                Format as a JSON array with exactly 4 objects:
                [
                  {{"title": "Movie Title", "reason": "Matches your love for [specific genre/theme] seen in your high rating of [example movie]. Features [relevant elements] you praised."}},
                  ...
                ]
                
                Focus on quality over quantity - each recommendation should feel personally curated for this user's taste profile.
                Return only the JSON array, no additional text.
                """
                
                chat_completion = groq_client.chat.completions.create(
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a movie recommendation expert. Always respond with valid JSON format only."
                        },
                        {
                            "role": "user", 
                            "content": prompt
                        }
                    ],
                    model="llama-3.3-70b-versatile",
                    temperature=0.7,
                    max_tokens=1000
                )
                
                # Parse the AI response
                ai_response = chat_completion.choices[0].message.content.strip()
                
                # Clean up the response to ensure it's valid JSON
                if ai_response.startswith("```json"):
                    ai_response = ai_response.replace("```json", "").replace("```", "").strip()
                
                import json
                try:
                    ai_recommendations = json.loads(ai_response)
                except json.JSONDecodeError:
                    ai_recommendations = []
                
                # Get movie details from TMDb for each recommendation
                for i, rec in enumerate(ai_recommendations[:4]):  # Limit to 4 recommendations
                    try:
                        movie_details = await get_movie_details_from_tmdb(rec["title"])
                        if movie_details:
                            recommendations.append(RecommendedMovie(
                                movie_id=movie_details["movie_id"],
                                title=movie_details["title"],
                                poster_path=movie_details["poster_path"],
                                overview=movie_details["overview"],
                                release_date=movie_details["release_date"],
                                vote_average=movie_details["vote_average"],
                                reason=rec.get("reason", "Recommended based on your preferences")
                            ))
                    except Exception:
                        continue

            except Exception:
                pass
        else:
            # Try direct API request as fallback
            try:
                messages = [
                    {
                        "role": "system",
                        "content": "You are a movie recommendation expert. Always respond with valid JSON format only."
                    },
                    {
                        "role": "user", 
                        "content": f"""
                        You are a movie recommendation expert. Based on this detailed user profile with genre preferences and movie metadata, recommend exactly 4 movies they would love.
                        
                        User's detailed movie profile:
                        {preferences}
                        
                        Recommendation Guidelines:
                        1. Prioritize movies that match their favorite genres and themes/keywords
                        2. Consider their rating patterns and review content sentiment
                        3. Avoid movies they've already rated
                        4. Include a mix of popular classics and critically acclaimed films
                        5. Ensure variety across different sub-genres while staying within their preferences
                        6. Consider the specific elements they praised in their reviews
                        
                        For each recommendation, provide:
                        - "title": the exact movie title (must be searchable on TMDb)
                        - "reason": a personalized explanation (max 60 words) connecting the recommendation to their specific preferences, mentioning relevant genres/themes
                        
                        Format as a JSON array with exactly 4 objects:
                        [
                          {{"title": "Movie Title", "reason": "Matches your love for [specific genre/theme] seen in your high rating of [example movie]. Features [relevant elements] you praised."}},
                          ...
                        ]
                        
                        Focus on quality over quantity - each recommendation should feel personally curated for this user's taste profile.
                        Return only the JSON array, no additional text.
                        """
                    }
                ]
                
                direct_api_result = await groq_api_request(messages, max_tokens=1000, temperature=0.7)
                if direct_api_result and 'choices' in direct_api_result:
                    ai_response = direct_api_result['choices'][0]['message']['content'].strip()
                    
                    # Clean up the response to ensure it's valid JSON
                    if ai_response.startswith("```json"):
                        ai_response = ai_response.replace("```json", "").replace("```", "").strip()
                    
                    # Process the AI response (same logic as client method)
                    import json
                    try:
                        ai_recommendations = json.loads(ai_response)
                        
                        for i, rec in enumerate(ai_recommendations[:4]):
                            try:
                                movie_details = await get_movie_details_from_tmdb(rec["title"])
                                if movie_details:
                                    recommendations.append(RecommendedMovie(
                                        movie_id=movie_details["movie_id"],
                                        title=movie_details["title"],
                                        poster_path=movie_details["poster_path"],
                                        overview=movie_details["overview"],
                                        release_date=movie_details["release_date"],
                                        vote_average=movie_details["vote_average"],
                                        reason=rec.get("reason", "Recommended based on your preferences")
                                    ))
                            except Exception:
                                continue
                    except json.JSONDecodeError:
                        pass
            except Exception:
                pass
        
        # Fallback recommendations if AI failed or no Groq client
        if not recommendations:
            # Create varied fallback recommendations based on user's ratings
            import random
            
            # Different movie pools based on user preference analysis
            if "action" in preferences.lower() or "adventure" in preferences.lower():
                fallback_movies = ["Mad Max: Fury Road", "John Wick", "The Matrix", "Inception"]
            elif "drama" in preferences.lower() or "emotional" in preferences.lower():
                fallback_movies = ["The Shawshank Redemption", "Forrest Gump", "Good Will Hunting", "A Beautiful Mind"]
            elif "comedy" in preferences.lower() or "funny" in preferences.lower():
                fallback_movies = ["The Grand Budapest Hotel", "Superbad", "Groundhog Day", "The Big Lebowski"]
            elif "horror" in preferences.lower() or "thriller" in preferences.lower():
                fallback_movies = ["Get Out", "A Quiet Place", "The Silence of the Lambs", "Hereditary"]
            elif "sci-fi" in preferences.lower() or "science" in preferences.lower():
                fallback_movies = ["Blade Runner 2049", "Interstellar", "Ex Machina", "Arrival"]
            else:
                # Default varied recommendations
                all_fallback_options = [
                    ["The Shawshank Redemption", "The Godfather", "Pulp Fiction", "The Dark Knight"],
                    ["Inception", "Interstellar", "The Matrix", "Blade Runner 2049"],
                    ["Forrest Gump", "Good Will Hunting", "A Beautiful Mind", "The Pursuit of Happyness"],
                    ["Mad Max: Fury Road", "John Wick", "The Avengers", "Guardians of the Galaxy"]
                ]
                fallback_movies = random.choice(all_fallback_options)
            
            for movie_title in fallback_movies:
                movie_details = await get_movie_details_from_tmdb(movie_title)
                if movie_details:
                    recommendations.append(RecommendedMovie(
                        movie_id=movie_details["movie_id"],
                        title=movie_details["title"],
                        poster_path=movie_details["poster_path"],
                        overview=movie_details["overview"],
                        release_date=movie_details["release_date"],
                        vote_average=movie_details["vote_average"],
                        reason="Popular movie that many users enjoy"
                    ))
        
        if not recommendations:
            return RecommendationResponse(
                user_id=user_id,
                recommendations=[]
            )
        
        return RecommendationResponse(
            user_id=user_id,
            recommendations=recommendations[:4]  # Ensure max 4 recommendations
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}") 