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
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Use authenticated user ID, with demo user as fallback
  const demoUserId = '12345678-1234-5678-9012-123456789012';
  const userId = user?.id || demoUserId;

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

  const fetchRecommendations = async () => {
    try {
      setLoadingRecommendations(true);
      
      const response = await reviewsApi.getRecommendations(userId);
      
      if (response.data.recommendations && response.data.recommendations.length > 0) {
        setRecommendations(response.data.recommendations);
        setShowRecommendations(true);
      } else {
        setRecommendations([]);
        setShowRecommendations(true);
        alert('No recommendations available. This could be due to insufficient review data or temporary service issues.');
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      
      if (error.response?.status === 400) {
        alert('Please rate some movies first to get personalized recommendations!');
      } else if (error.response?.status === 404) {
        alert('Demo user data not found. Please ensure the sample data is loaded in the database.');
      } else if (error.response?.status === 500) {
        const errorMsg = error.response?.data?.detail || 'Internal server error';
        alert(`Server error: ${errorMsg}`);
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        alert('Network error: Please check your connection and try again.');
      } else {
        alert(`Failed to load recommendations: ${error.message || 'Unknown error'}. Please try again later.`);
      }
    } finally {
      setLoadingRecommendations(false);
    }
  };

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

        {/* Recommendations Section */}
        <div className="mb-8">
          <div className="backdrop-blur-lg bg-white/5 rounded-3xl border border-white/10 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Recommended for You</h2>
              <button
                onClick={fetchRecommendations}
                disabled={loadingRecommendations || reviews.length === 0}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loadingRecommendations ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Getting Recommendations...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Get Recommendations
                  </>
                )}
              </button>
            </div>

            {!showRecommendations && !loadingRecommendations && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎭</div>
                <p className="text-gray-400 mb-4">
                  {reviews.length === 0 
                    ? "Rate some movies first to get personalized recommendations!"
                    : "Click the button above to discover movies you might love based on your ratings!"
                  }
                </p>
              </div>
            )}

            {showRecommendations && recommendations.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendations.map((movie) => (
                  <div 
                    key={movie.movie_id}
                    className="group cursor-pointer"
                    onClick={() => navigate(`/movie/${movie.movie_id}`)}
                  >
                    <div className="backdrop-blur-lg bg-white/5 rounded-2xl border border-white/10 p-4 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
                      <div className="aspect-[2/3] mb-4 overflow-hidden rounded-lg">
                        {movie.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-800 to-purple-900 flex items-center justify-center">
                            <span className="text-white text-sm text-center p-2">
                              {movie.title}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-white font-semibold text-sm group-hover:text-purple-300 transition-colors truncate">
                          {movie.title}
                        </h3>
                        
                        <div className="flex items-center gap-1 text-yellow-400">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <span className="text-sm">{movie.vote_average.toFixed(1)}</span>
                        </div>
                        
                        <p className="text-gray-400 text-xs leading-relaxed">
                          {movie.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showRecommendations && recommendations.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">😕</div>
                <p className="text-gray-400">
                  Sorry, we couldn't find any recommendations at the moment. Please try again later!
                </p>
              </div>
            )}
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