from fastapi import APIRouter, HTTPException
import requests
import os
from typing import List, Dict, Any

router = APIRouter()

# TMDb API configuration
TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"

@router.get("/popular")
async def get_popular_movies(page: int = 1) -> Dict[str, Any]:
    """Get popular movies from TMDb API"""
    if not TMDB_API_KEY:
        raise HTTPException(status_code=500, detail="TMDb API key not configured")
    
    try:
        url = f"{TMDB_BASE_URL}/movie/popular"
        params = {
            "api_key": TMDB_API_KEY,
            "page": page,
            "language": "en-US",
            "include_adult": False
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        data = response.json()
        
        # Add full image URLs to the response
        for movie in data.get("results", []):
            if movie.get("poster_path"):
                movie["poster_url"] = f"{TMDB_IMAGE_BASE_URL}{movie['poster_path']}"
            if movie.get("backdrop_path"):
                movie["backdrop_url"] = f"https://image.tmdb.org/t/p/w1280{movie['backdrop_path']}"
        
        return data
        
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch movies: {str(e)}")

@router.get("/search")
async def search_movies(q: str, page: int = 1) -> Dict[str, Any]:
    """Search movies by title"""
    if not TMDB_API_KEY:
        raise HTTPException(status_code=500, detail="TMDb API key not configured")
    
    if not q.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty")
    
    try:
        url = f"{TMDB_BASE_URL}/search/movie"
        params = {
            "api_key": TMDB_API_KEY,
            "query": q,
            "page": page,
            "language": "en-US",
            "include_adult": False
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        data = response.json()
        
        # Add full image URLs to the response
        for movie in data.get("results", []):
            if movie.get("poster_path"):
                movie["poster_url"] = f"{TMDB_IMAGE_BASE_URL}{movie['poster_path']}"
            if movie.get("backdrop_path"):
                movie["backdrop_url"] = f"https://image.tmdb.org/t/p/w1280{movie['backdrop_path']}"
        
        return data
        
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to search movies: {str(e)}")

@router.get("/{movie_id}")
async def get_movie_details(movie_id: int) -> Dict[str, Any]:
    """Get detailed information about a specific movie"""
    if not TMDB_API_KEY:
        raise HTTPException(status_code=500, detail="TMDb API key not configured")
    
    try:
        url = f"{TMDB_BASE_URL}/movie/{movie_id}"
        params = {
            "api_key": TMDB_API_KEY,
            "language": "en-US",
            "append_to_response": "credits,videos,reviews"
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        data = response.json()

        if data.get("adult"):
            raise HTTPException(status_code=403, detail="Adult content is not allowed")
        
        # Add full image URLs
        if data.get("poster_path"):
            data["poster_url"] = f"{TMDB_IMAGE_BASE_URL}{data['poster_path']}"
        if data.get("backdrop_path"):
            data["backdrop_url"] = f"https://image.tmdb.org/t/p/w1280{data['backdrop_path']}"
        
        return data
        
    except requests.RequestException as e:
        if e.response and e.response.status_code == 404:
            raise HTTPException(status_code=404, detail="Movie not found")
        raise HTTPException(status_code=500, detail=f"Failed to fetch movie details: {str(e)}") 