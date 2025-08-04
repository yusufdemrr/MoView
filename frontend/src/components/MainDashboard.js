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
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  useEffect(() => {
    const fetchRecommendedMovies = async () => {
      try {
        const response = await moviesApi.getPopular();
        setRecommendedMovies(response.data.results || []);
        setCurrentPage(2); // Start from page 2 for next load
        setHasMore(response.data.total_pages > 1);
      } catch (error) {
        console.error('Failed to fetch recommended movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedMovies();
  }, []);

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight ||
        loadingMore ||
        !hasMore ||
        searchResults.length > 0 // Don't load more during search
      ) {
        return;
      }
      
      loadMoreMovies();
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, searchResults.length, currentPage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  const loadMoreMovies = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const response = await moviesApi.getPopular(currentPage);
      const newMovies = response.data.results || [];
      
      setRecommendedMovies(prev => [...prev, ...newMovies]);
      setCurrentPage(prev => prev + 1);
      setHasMore(currentPage < response.data.total_pages);
    } catch (error) {
      console.error('Failed to load more movies:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearchLoading(true);
      const response = await moviesApi.search(searchQuery);
      setSearchResults(response.data.results.slice(0, 12));  // Get most matching 12 movies
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
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 relative z-[9999]">
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
                  className="w-full px-6 py-3 pr-20 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="absolute right-16 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
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
              <button
                onClick={() => navigate('/my-ratings')}
                className="px-4 py-2 bg-purple-600/20 border border-purple-500/50 text-purple-300 rounded-lg hover:bg-purple-500/20 hover:border-purple-400 transition-all duration-300"
              >
                My Ratings
              </button>
              
              {/* Profile Dropdown */}
              <div className="relative profile-dropdown z-[9999]">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold text-sm">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <svg 
                    className={`w-4 h-4 text-white transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="fixed top-16 right-4 w-48 bg-gray-800/95 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl py-2 z-[9999]">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-white font-medium">{user?.username}</p>
                      <p className="text-gray-400 text-sm">{user?.email}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setShowSettingsPanel(true);
                        setShowProfileDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-200 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        navigate('/');
                        setShowProfileDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-red-300 hover:text-red-200 hover:bg-red-900/20 transition-colors duration-200 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Section Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">{sectionTitle}</h2>
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
          <>
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
            
            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="flex justify-center items-center py-8 mt-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                  <p className="text-gray-400 text-sm">Loading more movies...</p>
                </div>
              </div>
            )}
          </>
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

      {/* Settings Panel Modal */}
      {showSettingsPanel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <button
                onClick={() => setShowSettingsPanel(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Profile Image Section */}
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <button className="text-purple-400 hover:text-purple-300 text-sm transition-colors duration-200">
                  Change Profile Picture
                </button>
              </div>

              {/* Username Section */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Username</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={user?.username || ''}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button className="px-3 py-2 bg-purple-600/20 border border-purple-500/50 text-purple-300 rounded-lg hover:bg-purple-500/20 hover:border-purple-400 transition-all duration-300 text-sm">
                    Edit
                  </button>
                </div>
              </div>

              {/* Password Section */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value="••••••••"
                    readOnly
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button className="px-3 py-2 bg-purple-600/20 border border-purple-500/50 text-purple-300 rounded-lg hover:bg-purple-500/20 hover:border-purple-400 transition-all duration-300 text-sm">
                    Change
                  </button>
                </div>
              </div>

              {/* Email Section (Read-only) */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent opacity-50"
                />
                <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-white/10">
              <button
                onClick={() => setShowSettingsPanel(false)}
                className="flex-1 px-4 py-2 border border-white/20 text-white/70 rounded-lg hover:bg-white/5 transition-all duration-300"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-300">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainDashboard;