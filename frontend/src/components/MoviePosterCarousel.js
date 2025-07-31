import React from 'react';
import { useNavigate } from 'react-router-dom';

const MoviePosterCarousel = ({ movies }) => {
  const navigate = useNavigate();
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* First Row - Moving Right */}
      <div className="absolute top-10 left-0 flex space-x-8 animate-scroll-right opacity-20">
        {[...movies, ...movies].map((movie, index) => (
          <div
            key={`row1-${index}`}
            className="flex-shrink-0 w-32 h-48 rounded-lg overflow-hidden shadow-2xl group cursor-pointer"
            onClick={() => navigate(`/movie/${movie.id}`)}
          >
            {movie.poster_url ? (
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-800 to-purple-900 flex items-center justify-center">
                <span className="text-white text-xs text-center p-2">{movie.title}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
              <p className="text-white text-xs p-3 font-medium">{movie.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Second Row - Moving Left */}
      <div className="absolute top-72 right-0 flex space-x-8 animate-scroll-left opacity-15">
        {[...movies.slice().reverse(), ...movies.slice().reverse()].map((movie, index) => (
          <div
            key={`row2-${index}`}
            className="flex-shrink-0 w-32 h-48 rounded-lg overflow-hidden shadow-2xl group cursor-pointer"
            onClick={() => navigate(`/movie/${movie.id}`)}
          >
            {movie.poster_url ? (
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-800 to-purple-900 flex items-center justify-center">
                <span className="text-white text-xs text-center p-2">{movie.title}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
              <p className="text-white text-xs p-3 font-medium">{movie.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Third Row - Moving Right Slow */}
      <div className="absolute bottom-20 left-0 flex space-x-8 animate-scroll-right-slow opacity-10">
        {[...movies.slice(2), ...movies.slice(0, 2), ...movies].map((movie, index) => (
          <div
            key={`row3-${index}`}
            className="flex-shrink-0 w-32 h-48 rounded-lg overflow-hidden shadow-2xl group cursor-pointer"
            onClick={() => navigate(`/movie/${movie.id}`)}
          >
            {movie.poster_url ? (
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-800 to-purple-900 flex items-center justify-center">
                <span className="text-white text-xs text-center p-2">{movie.title}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
              <p className="text-white text-xs p-3 font-medium">{movie.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoviePosterCarousel; 