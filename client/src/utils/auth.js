// client/src/utils/auth.js
// Authentication utility functions for token management

import { authAPI } from '../services/api';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'userData';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Token Management
export const setToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to store token:', error);
  }
};

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to retrieve token:', error);
    return null;
  }
};

export const removeToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Failed to remove token:', error);
  }
};

// User Data Management
export const setUserData = (user) => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to store user data:', error);
  }
};

export const getUserData = () => {
  try {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Failed to retrieve user data:', error);
    return null;
  }
};

// Token Validation
export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    if (payload.exp < currentTime) {
      removeToken();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Invalid token format:', error);
    removeToken();
    return false;
  }
};

export const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.userId,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: payload.role,
      organizationId: payload.organizationId
    };
  } catch (error) {
    console.error('Failed to parse token:', error);
    return null;
  }
};

// Authentication Functions
export const sendMagicLink = async (email) => {
  try {
    const response = await authAPI.sendMagicLink(email);
    
    if (response.authUrl) {
      window.location.href = response.authUrl;
    }
    
    return response;
  } catch (error) {
    console.error('Failed to send magic link:', error);
    throw error;
  }
};

export const sendOTP = async (email) => {
  try {
    const response = await authAPI.sendOTP(email);
    
    if (response.authUrl) {
      window.location.href = response.authUrl;
    }
    
    return response;
  } catch (error) {
    console.error('Failed to send OTP:', error);
    throw error;
  }
};

export const loginWithGoogle = async (email) => {
  try {
    const response = await authAPI.getGoogleAuthURL(email);
    if (response.authUrl) {
      window.location.href = response.authUrl;
    }
    return response;
  } catch (error) {
    console.error('Failed to initiate Google login:', error);
    throw error;
  }
};

export const loginWithMicrosoft = async (email) => {
  try {
    const response = await authAPI.getMicrosoftAuthURL(email);
    if (response.authUrl) {
      window.location.href = response.authUrl;
    }
    return response;
  } catch (error) {
    console.error('Failed to initiate Microsoft login:', error);
    throw error;
  }
};

// Handle OAuth Callback
export const handleOAuthCallback = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const error = urlParams.get('error');
  
  if (error) {
    console.error('OAuth error:', error);
    return { success: false, error };
  }
  
  if (token) {
    setToken(token);
    const user = getUserFromToken();
    if (user) {
      setUserData(user);
    }
    window.history.replaceState({}, document.title, window.location.pathname);
    return { success: true, user };
  }
  
  return { success: false, error: 'No token received' };
};

// client/src/utils/auth.js
export const logout = () => {
  // Clear all local data
  localStorage.clear();
  sessionStorage.clear();
  
  console.log('User logged out');
  
  // Redirect to login
  window.location.href = '/login';
};

// Authenticated Fetch Helper
export const authenticatedFetch = async (url, options = {}) => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token available');
  }

  // Build full URL - only add API_BASE_URL if url doesn't already include it
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  const response = await fetch(fullUrl, {
    ...options,
    headers: authHeaders
  });
  
  if (response.status === 401) {
    removeToken();
    window.location.href = '/login';
    throw new Error('Authentication expired');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed: ${response.status}`);
  }
  
  return response.json();
};