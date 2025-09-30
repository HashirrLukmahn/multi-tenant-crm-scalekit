// client/src/services/api.js
// API service for handling HTTP requests to the backend

import { authenticatedFetch } from '../utils/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Authentication API methods -------------------------------------------------------------------------

export const authAPI = {
  // Send magic link to user's email
  sendMagicLink: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/login/magic-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send magic link');
    }
    
    return response.json();
  },

  // Send OTP to user's email
  sendOTP: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/login/otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send OTP');
    }
    
    return response.json();
  },

  // Verify magic link token
  verifyMagicLink: async (linkToken, authRequestId) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify/magic-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkToken, authRequestId })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Invalid magic link');
    }
    
    return response.json();
  },

  // Verify OTP code
  verifyOTP: async (code, authRequestId) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify/otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, authRequestId })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Invalid OTP code');
    }
    
    return response.json();
  },

  // Get Google OAuth URL
  getGoogleAuthURL: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/login/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get Google auth URL');
    }
    
    return response.json();
  },

  // Get Microsoft OAuth URL
  getMicrosoftAuthURL: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/login/microsoft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get Microsoft auth URL');
    }
    
    return response.json();
  },

  // Logout user
  logout: async () => {
    const response = await authenticatedFetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Logout failed');
    }
    
    return response.json();
  }
};

// Users API----------------------------------------------------------

export const usersAPI = {
  getOrganizationUsers: async () => {
    return authenticatedFetch('/users/organization', { method: 'GET' });
  },
  inviteUser: async (userData) => {
    return authenticatedFetch('/users/invite', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  updateUserRole: async (userId, role) => {
    return authenticatedFetch(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });
  },
  deleteUser: async (userId) => {
    return authenticatedFetch(`/users/${userId}`, {
      method: 'DELETE'
    });
  }
};

// Contacts API methods ------------------------------------------------------------
// Contacts API - Fix to use relative paths
export const contactsAPI = {
  getAll: async () => {
    return authenticatedFetch('/contacts');
  },
  create: async (contactData) => {
    return authenticatedFetch('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData)
    });
  },
  update: async (id, contactData) => {
    return authenticatedFetch(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contactData)
    });
  },
  delete: async (id) => {
    return authenticatedFetch(`/contacts/${id}`, { method: 'DELETE' });
  },
  getStats: async () => {
    return authenticatedFetch('/contacts/stats/overview');
  },
  search: async (query) => {
    return authenticatedFetch(`/contacts/search?q=${encodeURIComponent(query)}`);
  }
};

// General API utility functions
export const apiUtils = {
  // Test server connection
  healthCheck: async () => {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  },

  // Test ScaleKit connection
  testScaleKit: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/test-scalekit`);
      if (response.ok) {
        return response.json();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'ScaleKit test failed');
      }
    } catch (error) {
      console.error('ScaleKit test failed:', error);
      throw error;
    }
  },

  // Handle API errors uniformly
  handleError: (error) => {
    console.error('API Error:', error);
    
    if (error.message.includes('Authentication expired')) {
      window.location.href = '/login';
      return;
    }
    
    // Return user-friendly error message
    return error.message || 'An unexpected error occurred';
  }
};

export default {
  auth: authAPI,
  contacts: contactsAPI,
  utils: apiUtils
};