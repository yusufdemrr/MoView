from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()

class SentimentRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000, description="Text to analyze")

class SentimentResponse(BaseModel):
    text: str
    sentiment: str
    confidence: float

@router.post("/analyze", response_model=SentimentResponse)
async def analyze_sentiment(request: SentimentRequest):
    """Analyze sentiment of review text using simple keyword-based analysis
    
    This endpoint uses a fast, local sentiment analysis method based on 
    positive and negative keyword matching. No external API calls are made.
    """
    sentiment = simple_sentiment_analysis(request.text)
    
    # Calculate confidence based on keyword matches
    confidence = calculate_sentiment_confidence(request.text, sentiment)
    
    return SentimentResponse(
        text=request.text,
        sentiment=sentiment,
        confidence=confidence
    )

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

def calculate_sentiment_confidence(text: str, sentiment: str) -> float:
    """Calculate confidence score based on keyword density and text length"""
    text_lower = text.lower()
    words = text_lower.split()
    total_words = len(words)
    
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
    
    positive_matches = sum(1 for word in positive_words if word in text_lower)
    negative_matches = sum(1 for word in negative_words if word in text_lower)
    
    # Base confidence
    if sentiment == 'neutral':
        base_confidence = 0.5
    else:
        # Higher confidence for more keyword matches
        relevant_matches = positive_matches if sentiment == 'positive' else negative_matches
        base_confidence = min(0.9, 0.6 + (relevant_matches * 0.1))
    
    # Adjust confidence based on text length
    if total_words < 5:
        base_confidence *= 0.8  # Lower confidence for very short text
    elif total_words > 50:
        base_confidence *= 1.1  # Higher confidence for longer text
    
    # Ensure confidence is between 0.3 and 0.9
    return max(0.3, min(0.9, base_confidence))