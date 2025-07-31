from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
import uuid


class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    movie_id = Column(Integer, nullable=False, index=True)  # TMDB movie ID
    content = Column(Text, nullable=False)
    rating = Column(Float, nullable=False)  # 1.0 - 5.0 scale
    sentiment = Column(String, nullable=True)  # positive/negative/neutral
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship to User
    user = relationship("User", backref="reviews")
    
    def __repr__(self):
        return f"<Review(movie_id={self.movie_id}, rating={self.rating}, sentiment='{self.sentiment}')>" 