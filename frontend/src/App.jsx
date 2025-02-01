import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/common/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VerifyEmail from './components/auth/VerifyEmail';
import VerifyOTP from './components/auth/VerifyOTP';
import ImagePredict from './components/predict/ImagePredict';
import Home from './pages/Home';
import AuthTabs from './components/auth/AuthTabs';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  console.log("This is App.jsx");

  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-green-200 via-emerald-100 to-teal-200">
          <Navbar 
            isAuthenticated={isAuthenticated} 
            logout={() => setIsAuthenticated(false)} 
          />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<AuthTabs />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify" element={<VerifyEmail />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route 
                path="/predict/image" 
                element={
                  <PrivateRoute>
                    <ImagePredict />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/" 
                element={
                  <PrivateRoute>
                    <Home user={user} />
                  </PrivateRoute>
                } 
              />
              <Route path="/home" element={<Home />} />
            </Routes>
          </main>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App; 