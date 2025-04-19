// File to handle authentication state
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Add logout function
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
  };

  // Login function to set both authentication and user info
  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  // Only redirect to login for protected routes
  useEffect(() => {
    // Remove '/predict/image' from protected routes to allow guest access
    const protectedRoutes = ['/account']; // Only truly protected routes
    const isProtectedRoute = protectedRoutes.some(route =>
      location.pathname.startsWith(route)
    );

    if (!isAuthenticated && isProtectedRoute) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, location, navigate]);

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    user,
    setUser,
    login,
    logout // Add logout to context value
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};