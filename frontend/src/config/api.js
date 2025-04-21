/**
 * API configuration file
 * This file centralizes API URLs and makes deployment to different environments easier
 */

// Get the base API URL from environment variables or default to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const API_URLS = {
  // Authentication endpoints
  register: `${API_BASE_URL}/register`,
  login: `${API_BASE_URL}/login`,
  verifyOtp: `${API_BASE_URL}/verify-otp`,
  logout: `${API_BASE_URL}/logout`,

  // Deepfake detection endpoints
  analyze: `${API_BASE_URL}/analyze`,
  getAnalysis: `${API_BASE_URL}/analysis`,

  // User history endpoints
  userHistory: `${API_BASE_URL}/user/history`,

  // Articles endpoints
  articles: `${API_BASE_URL}/articles`,
  getArticle: (slug) => `${API_BASE_URL}/articles/${slug}`
};

export default API_URLS; 