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

export default api; 