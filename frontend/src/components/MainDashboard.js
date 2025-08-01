import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { moviesApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MainDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const fetchRecommendedMovies = async () => {
      try {
        const response = await moviesApi.getPopular();
        setRecommendedMovies(response.data.results.slice(0, 12)); // Get first 12 movies
      } catch (error) {
        console.error('Failed to fetch recommended movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedMovies();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearchLoading(true);
      const response = await moviesApi.search(searchQuery);
      setSearchResults(response.data.results.slice(0, 12));
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const moviesToShow = searchResults.length > 0 ? searchResults : recommendedMovies;
  const sectionTitle = searchResults.length > 0 ? 'Search Results' : 'Recommended Movies';

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/30 to-black">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <h1 
                className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 cursor-pointer"
                onClick={() => navigate('/')}
              >
                MoView
              </h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for movies..."
                  className="w-full px-6 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                />
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-500 hover:to-pink-500 transition-all duration-300 disabled:opacity-50"
                >
                  {searchLoading ? '...' : 'Search'}
                </button>
              </form>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4">
              <span className="text-white font-medium">Welcome, {user?.username}!</span>
              <button
                onClick={() => navigate('/my-ratings')}
                className="px-4 py-2 bg-purple-600/20 border border-purple-500/50 text-purple-300 rounded-lg hover:bg-purple-500/20 hover:border-purple-400 transition-all duration-300"
              >
                My Ratings
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600/20 border border-red-500/50 text-red-300 rounded-lg hover:bg-red-500/20 hover:border-red-400 transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Section Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">{sectionTitle}</h2>
          {searchResults.length > 0 && (
            <button
              onClick={() => {
                setSearchResults([]);
                setSearchQuery('');
              }}
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Loading State */}
        {(loading || searchLoading) && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading movies...</p>
            </div>
          </div>
        )}

        {/* Movies Grid */}
        {!loading && !searchLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {moviesToShow.map((movie) => (
              <div
                key={movie.id}
                onClick={() => handleMovieClick(movie.id)}
                className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
              >
                <div className="relative overflow-hidden rounded-lg shadow-2xl bg-gray-800">
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-80 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🎬</div>
                        <p className="text-gray-400 text-sm">No Image</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-semibold text-sm leading-tight mb-1">
                        {movie.title}
                      </h3>
                      <p className="text-gray-300 text-xs">
                        {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                      </p>
                      {movie.vote_average > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-yellow-400">⭐</span>
                          <span className="text-white text-xs">{movie.vote_average.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !searchLoading && moviesToShow.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-2xl font-bold text-white mb-2">No movies found</h3>
            <p className="text-gray-400 mb-6">Try searching for a different movie title</p>
            <button
              onClick={() => {
                setSearchResults([]);
                setSearchQuery('');
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-300"
            >
              View Recommended Movies
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MainDashboard;