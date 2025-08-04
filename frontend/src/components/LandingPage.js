import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { moviesApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import MoviePosterCarousel from './MoviePosterCarousel';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }

    const fetchPopularMovies = async () => {
      try {
        const response = await moviesApi.getPopular();
        setMovies(response.data.results.slice(0, 6)); // Get first 6 movies for carousel
      } catch (error) {
        console.error('Failed to fetch movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularMovies();
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/30 to-black"></div>
      
      {/* Animated Background Particles */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Movie Posters Background */}
      {!loading && movies.length > 0 && (
        <MoviePosterCarousel movies={movies} />
      )}

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo/Brand */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-300 to-purple-500 mb-4 tracking-tight">
              MoView
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto mb-6"></div>
          </div>

          {/* Welcome Section */}
          <div className="backdrop-blur-lg bg-white/5 rounded-3xl border border-white/10 p-12 shadow-2xl animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">MoView</span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto">
              Discover, rate and review your favorite movies. Join thousands of movie enthusiasts in the ultimate cinematic experience.
            </p>

            {/* CTA Buttons - Only show for unauthenticated users */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button 
                onClick={() => navigate('/register')}
                className="group relative px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 hover:from-purple-500 hover:to-pink-500"
              >
                <span className="relative z-10">Let's Start</span>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 blur opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
              </button>

              <button 
                onClick={() => setShowAbout(!showAbout)}
                className="px-12 py-4 border-2 border-white/20 rounded-full text-white/70 font-semibold text-lg hover:bg-white/5 hover:border-white/30 hover:text-white transition-all duration-300 backdrop-blur-sm"
              >
                Learn More
              </button>
            </div>

            {/* Sign In Link */}
            <div className="mt-8">
              <p className="text-gray-400">
                Already have an account?{' '}
                <button 
                  onClick={() => navigate('/login')}
                  className="text-purple-400 hover:text-purple-300 font-medium underline underline-offset-4 decoration-purple-400/50 hover:decoration-purple-300 transition-colors duration-200"
                >
                  Sign In
                </button>
              </p>
            </div>

            {/* About Section - Expandable */}
            {showAbout && (
              <div className="mt-8 p-8 backdrop-blur-md bg-white/5 rounded-2xl border border-white/10 animate-fade-in">
                <h3 className="text-2xl font-bold text-white mb-4">About MoView</h3>
                <div className="text-gray-300 space-y-4 text-left max-w-3xl">
                  <p>
                    <strong className="text-purple-400">Discover Amazing Movies:</strong> Browse through thousands of popular and trending movies from around the world using our integration with The Movie Database (TMDb).
                  </p>
                  <p>
                    <strong className="text-purple-400">Rate & Review:</strong> Share your thoughts on movies you've watched. Rate films from 1 to 5 stars and write detailed reviews to help other movie enthusiasts.
                  </p>
                  <p>
                    <strong className="text-purple-400">AI-Powered Insights:</strong> Our advanced sentiment analysis automatically categorizes reviews as positive, negative, or neutral, giving you quick insights into community opinions.
                  </p>
                  <p>
                    <strong className="text-purple-400">Personal Dashboard:</strong> Keep track of all your ratings and reviews in your personalized "My Ratings" section.
                  </p>
                  <p>
                    <strong className="text-purple-400">Modern Experience:</strong> Enjoy a sleek, responsive design that works beautifully on all your devices.
                  </p>
                </div>
                <button
                  onClick={() => setShowAbout(false)}
                  className="mt-6 px-6 py-2 bg-purple-600/20 border border-purple-500/50 text-purple-300 rounded-lg hover:bg-purple-500/20 hover:border-purple-400 transition-all duration-300"
                >
                  Got it!
                </button>
              </div>
            )}
          </div>

          {/* Features Preview */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-delayed">
            <div className="backdrop-blur-md bg-white/5 rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 group">
              {/* <div className="text-purple-400 text-3xl mb-4 group-hover:scale-110 transition-transform duration-300"></div> */}
              <h3 className="text-white font-semibold text-lg mb-2">Discover Movies</h3>
              <p className="text-gray-400 text-sm">Explore trending and popular movies from around the world</p>
            </div>
            
            <div className="backdrop-blur-md bg-white/5 rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 group">
              {/* <div className="text-purple-400 text-3xl mb-4 group-hover:scale-110 transition-transform duration-300"></div> */}
              <h3 className="text-white font-semibold text-lg mb-2">Rate & Review</h3>
              <p className="text-gray-400 text-sm">Share your thoughts and rate movies with our community</p>
            </div>
            
            <div className="backdrop-blur-md bg-white/5 rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 group">
              {/* <div className="text-purple-400 text-3xl mb-4 group-hover:scale-110 transition-transform duration-300"></div> */}
              <h3 className="text-white font-semibold text-lg mb-2">AI Insights</h3>
              <p className="text-gray-400 text-sm">Get intelligent sentiment analysis on all reviews</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 