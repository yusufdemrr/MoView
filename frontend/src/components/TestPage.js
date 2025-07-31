import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { moviesApi } from '../services/api';

const TestPage = () => {
  const navigate = useNavigate();
  const [apiTest, setApiTest] = useState('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      console.log('Testing API connection...');
      const response = await moviesApi.getPopular();
      console.log('API Response:', response.data);
      setApiTest(`✅ API Working! Got ${response.data.results.length} movies`);
    } catch (error) {
      console.error('API Error:', error);
      setApiTest(`❌ API Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testNavigation = () => {
    console.log('Testing navigation...');
    try {
      navigate('/movie/755898'); // Test movie ID
      console.log('Navigation successful!');
    } catch (error) {
      console.error('Navigation Error:', error);
    }
  };

  const testMyRatings = () => {
    console.log('Testing My Ratings navigation...');
    try {
      navigate('/my-ratings');
      console.log('My Ratings navigation successful!');
    } catch (error) {
      console.error('My Ratings Navigation Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/30 to-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            🔧 MoView Debug Test Page
          </h1>
          
          <div className="space-y-6">
            {/* API Test */}
            <div className="bg-gray-900/50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">1. API Connection Test</h2>
              <button 
                onClick={testAPI}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 mr-4"
              >
                {loading ? 'Testing...' : 'Test API'}
              </button>
              {apiTest && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                  <p className="text-gray-300">{apiTest}</p>
                </div>
              )}
            </div>

            {/* Navigation Tests */}
            <div className="bg-gray-900/50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Navigation Tests</h2>
              <div className="space-x-4">
                <button 
                  onClick={testNavigation}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Test Movie Detail Page
                </button>
                <button 
                  onClick={testMyRatings}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Test My Ratings Page
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Back to Home
                </button>
              </div>
            </div>

            {/* Console Instructions */}
            <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-yellow-300 mb-4">🔍 Debug Instructions</h2>
              <div className="text-yellow-100 space-y-2">
                <p>1. Open browser Developer Console (F12 → Console tab)</p>
                <p>2. Click the buttons above and watch for console messages</p>
                <p>3. Look for any error messages in red</p>
                <p>4. Check if API calls and navigation work from here</p>
              </div>
            </div>

            {/* Current Status */}
            <div className="bg-gray-900/50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Current Setup Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-green-900/30 border border-green-500 rounded-lg p-4">
                  <div className="text-green-400 text-2xl mb-2">✅</div>
                  <div className="text-green-300">Backend Running</div>
                  <div className="text-green-200 text-sm">Port 8000</div>
                </div>
                <div className="bg-green-900/30 border border-green-500 rounded-lg p-4">
                  <div className="text-green-400 text-2xl mb-2">✅</div>
                  <div className="text-green-300">Frontend Running</div>
                  <div className="text-green-200 text-sm">Port 3000</div>
                </div>
                <div className="bg-green-900/30 border border-green-500 rounded-lg p-4">
                  <div className="text-green-400 text-2xl mb-2">✅</div>
                  <div className="text-green-300">Database Ready</div>
                  <div className="text-green-200 text-sm">Demo user created</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage; 