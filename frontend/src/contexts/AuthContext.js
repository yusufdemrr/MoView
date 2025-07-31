import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          // Verify token is still valid
          const response = await authApi.verifyToken(savedToken);
          if (response.data.valid) {
            setToken(savedToken);
            // Get user info
            const userResponse = await authApi.getMe(savedToken);
            setUser(userResponse.data);
          } else {
            // Token is invalid
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authApi.login({ email, password });
      const { access_token } = response.data;
      
      // Save token
      localStorage.setItem('token', access_token);
      setToken(access_token);
      
      // Get user info
      const userResponse = await authApi.getMe(access_token);
      setUser(userResponse.data);
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await authApi.register({ username, email, password });
      
      // Auto-login after successful registration
      const loginResult = await login(email, password);
      if (loginResult.success) {
        return { success: true, user: response.data };
      } else {
        return { success: false, error: 'Registration successful but login failed' };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 