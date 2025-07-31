import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Movies API
export const moviesApi = {
  getPopular: (page = 1) => api.get(`/movies/popular?page=${page}`),
  search: (query, page = 1) => api.get(`/movies/search?q=${encodeURIComponent(query)}&page=${page}`),
  getById: (id) => api.get(`/movies/${id}`),
};

// Reviews API
export const reviewsApi = {
  create: (reviewData) => api.post('/reviews/', reviewData),
  getByMovieId: (movieId) => api.get(`/reviews/${movieId}`),
  getByUserId: (userId) => api.get(`/reviews/user/${userId}`),
  getMovieStats: (movieId) => api.get(`/reviews/stats/${movieId}`),
};

// Sentiment API
export const sentimentApi = {
  analyze: (text) => api.post('/sentiment/analyze', { text }),
};

// Authentication API
export const authApi = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: (token) => api.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  verifyToken: (token) => api.post('/auth/verify-token', {}, {
    headers: { Authorization: `Bearer ${token}` }
  }),
};

export default api; 