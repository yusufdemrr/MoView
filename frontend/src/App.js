import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import MovieDetail from './components/MovieDetail';
import MyRatings from './components/MyRatings';
import TestPage from './components/TestPage';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/my-ratings" element={<MyRatings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/test" element={<TestPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 