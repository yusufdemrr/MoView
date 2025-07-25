import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage';

// Import other components (create these later)
// import MovieDetail from './components/MovieDetail';
// import MyRatings from './components/MyRatings';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* Add more routes as components are created */}
        </Routes>
      </div>
    </Router>
  );
}

export default App; 