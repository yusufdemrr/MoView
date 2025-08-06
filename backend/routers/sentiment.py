from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import os
from groq import Groq

router = APIRouter()

# Initialize Groq client with error handling
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = None

if GROQ_API_KEY:
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
    except Exception:
        groq_client = None

class SentimentRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000, description="Text to analyze")

class SentimentResponse(BaseModel):
    text: str
    sentiment: str
    confidence: float

@router.post("/analyze", response_model=SentimentResponse)
async def analyze_sentiment(request: SentimentRequest):
    """Analyze sentiment of review text using Groq API or fallback method"""
    if not groq_client:
        # Use fallback sentiment analysis
        sentiment = simple_sentiment_analysis(request.text)
        return SentimentResponse(
            text=request.text,
            sentiment=sentiment,
            confidence=0.7  # Default confidence for fallback method
        )
    
    try:
        # Create a prompt for sentiment analysis
        prompt = f"""
        Analyze the sentiment of the following movie review text and classify it as 'positive', 'negative', or 'neutral'.
        Also provide a confidence score between 0.0 and 1.0.
        
        Text: "{request.text}"
        
        Respond with only a JSON object in this format:
        {{"sentiment": "positive/negative/neutral", "confidence": 0.85}}
        """
        
        # Call Groq API
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama3-8b-8192",  # You can change this to other available models
            temperature=0.1,  # Low temperature for consistent results
            max_tokens=100,
        )
        
        # Parse the response
        response_text = chat_completion.choices[0].message.content.strip()
        
        # Try to extract JSON from response
        import json
        try:
            # Clean up the response and extract JSON
            if '```json' in response_text:
                response_text = response_text.split('```json')[1].split('```')[0].strip()
            elif '```' in response_text:
                response_text = response_text.split('```')[1].strip()
            
            result = json.loads(response_text)
            sentiment = result.get('sentiment', 'neutral').lower()
            confidence = float(result.get('confidence', 0.5))
            
            # Validate sentiment value
            if sentiment not in ['positive', 'negative', 'neutral']:
                sentiment = 'neutral'
                
            # Ensure confidence is between 0 and 1
            confidence = max(0.0, min(1.0, confidence))
            
        except (json.JSONDecodeError, KeyError, ValueError):
            # Fallback: simple keyword-based analysis
            sentiment = simple_sentiment_analysis(request.text)
            confidence = 0.5
        
        return SentimentResponse(
            text=request.text,
            sentiment=sentiment,
            confidence=confidence
        )
        
    except Exception as e:
        # Fallback to simple analysis if Groq fails
        sentiment = simple_sentiment_analysis(request.text)
        return SentimentResponse(
            text=request.text,
            sentiment=sentiment,
            confidence=0.5
        )

def simple_sentiment_analysis(text: str) -> str:
    """Simple fallback sentiment analysis based on keywords"""
    text_lower = text.lower()
    
    positive_words = ['good', 'great', 'excellent', 'amazing', 'love', 'best', 'awesome', 'fantastic', 'wonderful', 'brilliant']
    negative_words = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disappointing', 'boring', 'poor', 'waste']
    
    positive_score = sum(1 for word in positive_words if word in text_lower)
    negative_score = sum(1 for word in negative_words if word in text_lower)
    
    if positive_score > negative_score:
        return 'positive'
    elif negative_score > positive_score:
        return 'negative'
    else:
        return 'neutral' 