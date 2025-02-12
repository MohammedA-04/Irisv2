import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AppRoutes from './AppRoutes';
import { AuthProvider } from './components/auth/AuthContext';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
          <AppRoutes />
        </GoogleOAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App; 