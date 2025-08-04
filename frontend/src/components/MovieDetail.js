import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { moviesApi, reviewsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average_rating: 0, total_reviews: 0 });
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    content: '',
    rating: 5,
    user_id: user?.id || '12345678-1234-5678-9012-123456789012' // Use authenticated user ID or demo
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        const [movieResponse, reviewsResponse, statsResponse] = await Promise.all([
          moviesApi.getById(id),
          reviewsApi.getByMovieId(id),
          reviewsApi.getMovieStats(id)
        ]);

        setMovie(movieResponse.data);
        setReviews(reviewsResponse.data);
        setStats(statsResponse.data);
      } catch (error) {
        console.error('Failed to fetch movie data:', error);
        setError('Failed to load movie information');
      } finally {
        setLoading(false);
        setReviewsLoading(false);
      }
    };

    if (id) {
      fetchMovieData();
    }
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewData.content.trim()) return;

    try {
      setSubmittingReview(true);
      const response = await reviewsApi.create({
        ...reviewData,
        movie_id: parseInt(id)
      });

      // Add the new review to the list
      setReviews(prev => [response.data, ...prev]);
      
      // Update stats
      const statsResponse = await reviewsApi.getMovieStats(id);
      setStats(statsResponse.data);
      
      // Reset form
      setReviewData({ content: '', rating: 5, user_id: user?.id || '12345678-1234-5678-9012-123456789012' });
      setShowReviewForm(false);
      
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/30 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading movie details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/30 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/30 to-black">
      {/* Hero Section */}
      <div className="relative">
        {movie.backdrop_url && (
          <div className="absolute inset-0 overflow-hidden">
            <img 
              src={movie.backdrop_url} 
              alt={movie.title}
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          </div>
        )}
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Navigation */}
          <button 
            onClick={() => navigate('/')}
            className="mb-6 flex items-center text-purple-300 hover:text-white transition-colors"
          >
            <span className="mr-2">←</span> Back to Home
          </button>

          {/* Movie Information */}
          <div className="flex flex-col md:flex-row gap-8 mb-12">
            <div className="md:w-1/3">
              {movie.poster_url ? (
                <img 
                  src={movie.poster_url} 
                  alt={movie.title}
                  className="w-full max-w-sm mx-auto rounded-lg shadow-2xl"
                />
              ) : (
                <div className="w-full max-w-sm mx-auto h-96 bg-gradient-to-br from-purple-800 to-purple-900 rounded-lg flex items-center justify-center">
                  <span className="text-white text-center p-4">{movie.title}</span>
                </div>
              )}
            </div>
            
            <div className="md:w-2/3">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{movie.title}</h1>
              
              {movie.tagline && (
                <p className="text-xl text-gray-300 italic mb-6">"{movie.tagline}"</p>
              )}
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">Rating:</span>
                  <div className="flex items-center">
                    {renderStars(movie.vote_average / 2)}
                    <span className="text-white ml-2">({movie.vote_average.toFixed(1)}/10)</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">User Reviews:</span>
                  <div className="flex items-center">
                    {renderStars(stats.average_rating)}
                    <span className="text-white ml-2">({stats.average_rating}/5.0)</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres?.map(genre => (
                  <span key={genre.id} className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-sm">
                    {genre.name}
                  </span>
                ))}
              </div>
              
              <div className="mb-6">
                <span className="text-gray-400">Release Date: </span>
                <span className="text-white">{new Date(movie.release_date).toLocaleDateString()}</span>
                {movie.runtime && (
                  <>
                    <span className="text-gray-400 ml-4">Runtime: </span>
                    <span className="text-white">{movie.runtime} minutes</span>
                  </>
                )}
              </div>
              
              <p className="text-gray-300 text-lg leading-relaxed mb-8">{movie.overview}</p>
              
              {isAuthenticated ? (
                <button 
                  onClick={() => setShowReviewForm(true)}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold"
                >
                  Write a Review
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => navigate('/login')}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold"
                  >
                    Sign In to Review
                  </button>
                  <button 
                    onClick={() => navigate('/register')}
                    className="px-8 py-3 border-2 border-purple-500 text-purple-300 rounded-lg hover:bg-purple-500/10 hover:border-purple-400 transition-all duration-300 font-semibold"
                  >
                    Create Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="backdrop-blur-lg bg-white/5 rounded-3xl border border-white/10 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">
              Reviews ({stats.total_reviews})
            </h2>
            {stats.total_reviews > 0 && (
              <div className="text-right">
                <div className="text-sm text-gray-400">Average Rating</div>
                <div className="flex items-center">
                  {renderStars(stats.average_rating, 'text-xl')}
                  <span className="text-white ml-2 text-xl">{stats.average_rating}/5.0</span>
                </div>
              </div>
            )}
          </div>
          
          {reviewsLoading ? (
            <div className="text-center text-gray-400 py-8">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p>No reviews yet. Be the first to review this movie!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="border-b border-gray-700 pb-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-purple-300 font-semibold mr-3">
                        {review.username || 'Anonymous'}
                      </span>
                      <div className="flex items-center mr-3">
                        {renderStars(review.rating)}
                        <span className="text-white ml-1">({review.rating}/5)</span>
                      </div>
                      {review.sentiment && (
                        <span className={`text-xs px-2 py-1 rounded-full bg-gray-800 ${getSentimentColor(review.sentiment)}`}>
                          {getSentimentEmoji(review.sentiment)} {review.sentiment}
                        </span>
                      )}
                    </div>
                    <span className="text-gray-500 text-sm">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{review.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-6">Write Your Review</h3>
            
            <form onSubmit={handleSubmitReview}>
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Rating
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setReviewData(prev => ({ ...prev, rating }))}
                      className={`text-3xl ${rating <= reviewData.rating ? 'text-yellow-400' : 'text-gray-600'} hover:text-yellow-300 transition-colors`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-white ml-4">({reviewData.rating}/5)</span>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="review-content" className="block text-gray-300 text-sm font-medium mb-2">
                  Your Review
                </label>
                <textarea
                  id="review-content"
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                  placeholder="Share your thoughts about this movie..."
                  value={reviewData.content}
                  onChange={(e) => setReviewData(prev => ({ ...prev, content: e.target.value }))}
                  required
                  minLength={10}
                  maxLength={1000}
                />
                <div className="text-right text-gray-500 text-sm mt-1">
                  {reviewData.content.length}/1000
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-6 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview || !reviewData.content.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetail; 