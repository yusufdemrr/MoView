import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewsApi, moviesApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MyRatings = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moviesData, setMoviesData] = useState({});

  // Use authenticated user ID or demo user ID as fallback
  const userId = user?.id || '12345678-1234-5678-9012-123456789012';

  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        setLoading(true);
        const response = await reviewsApi.getByUserId(userId);
        const userReviews = response.data;
        setReviews(userReviews);

        // Fetch movie details for each review
        const movieIds = [...new Set(userReviews.map(review => review.movie_id))];
        const moviePromises = movieIds.map(id => moviesApi.getById(id));
        
        try {
          const movieResponses = await Promise.all(moviePromises);
          const movieMap = {};
          movieResponses.forEach(response => {
            movieMap[response.data.id] = response.data;
          });
          setMoviesData(movieMap);
        } catch (movieError) {
          console.error('Failed to fetch some movie details:', movieError);
        }

      } catch (error) {
        console.error('Failed to fetch user reviews:', error);
        setError('Failed to load your reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchUserReviews();
  }, [userId]);

  const renderStars = (rating, size = 'text-lg') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className={`text-yellow-400 ${size}`}>★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className={`text-yellow-400 ${size}`}>☆</span>);
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className={`text-gray-400 ${size}`}>☆</span>);
    }
    
    return stars;
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSentimentEmoji = (sentiment) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      default: return '😐';
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/30 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading your reviews...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/30 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/')}
            className="mb-6 flex items-center text-purple-300 hover:text-white transition-colors"
          >
            <span className="mr-2">←</span> Back to Home
          </button>

          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-300 to-purple-500 mb-4">
              My Ratings
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto"></div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="backdrop-blur-lg bg-white/5 rounded-2xl border border-white/10 p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">{reviews.length}</div>
              <div className="text-gray-300">Total Reviews</div>
            </div>
            <div className="backdrop-blur-lg bg-white/5 rounded-2xl border border-white/10 p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">{getAverageRating()}</div>
              <div className="text-gray-300">Average Rating</div>
            </div>
            <div className="backdrop-blur-lg bg-white/5 rounded-2xl border border-white/10 p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {reviews.filter(r => r.sentiment === 'positive').length}
              </div>
              <div className="text-gray-300">Positive Reviews</div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="backdrop-blur-lg bg-white/5 rounded-3xl border border-white/10 p-8">
          {error ? (
            <div className="text-center text-red-400 py-8">{error}</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-2xl text-white mb-4">No Reviews Yet</h3>
              <p className="text-gray-400 mb-8">Start reviewing movies to see them here!</p>
              <button 
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold"
              >
                Discover Movies
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Your Movie Reviews</h2>
              
              {reviews.map(review => {
                const movie = moviesData[review.movie_id];
                return (
                  <div key={review.id} className="border border-gray-700 rounded-2xl p-6 hover:border-purple-500/50 transition-colors">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Movie Poster */}
                      <div className="md:w-32 flex-shrink-0">
                        {movie && movie.poster_url ? (
                          <img 
                            src={movie.poster_url} 
                            alt={movie.title}
                            className="w-full h-48 md:h-40 object-cover rounded-lg shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300"
                            onClick={() => navigate(`/movie/${movie.id}`)}
                          />
                        ) : (
                          <div className="w-full h-48 md:h-40 bg-gradient-to-br from-purple-800 to-purple-900 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs text-center p-2">
                              {movie ? movie.title : 'Loading...'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Review Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 
                              className="text-xl font-semibold text-white hover:text-purple-300 cursor-pointer transition-colors"
                              onClick={() => navigate(`/movie/${review.movie_id}`)}
                            >
                              {movie ? movie.title : `Movie #${review.movie_id}`}
                            </h3>
                            {movie && movie.release_date && (
                              <p className="text-gray-400 text-sm">
                                {new Date(movie.release_date).getFullYear()}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-gray-500 text-sm mb-1">
                              {new Date(review.created_at).toLocaleDateString()}
                            </div>
                            {review.sentiment && (
                              <span className={`text-xs px-2 py-1 rounded-full bg-gray-800 ${getSentimentColor(review.sentiment)}`}>
                                {getSentimentEmoji(review.sentiment)} {review.sentiment}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center mb-4">
                          <div className="flex items-center mr-4">
                            {renderStars(review.rating)}
                            <span className="text-white ml-2 font-semibold">({review.rating}/5)</span>
                          </div>
                        </div>

                        <p className="text-gray-300 leading-relaxed">
                          {review.content}
                        </p>

                        <div className="mt-4 flex justify-end">
                          <button 
                            onClick={() => navigate(`/movie/${review.movie_id}`)}
                            className="text-purple-400 hover:text-purple-300 text-sm font-medium underline underline-offset-4 decoration-purple-400/50 hover:decoration-purple-300 transition-colors"
                          >
                            View Movie →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyRatings; 