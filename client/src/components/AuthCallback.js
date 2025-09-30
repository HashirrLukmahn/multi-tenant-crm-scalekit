// client/src/components/AuthCallback.js
// Handles OAuth callback and token processing after Google/Microsoft login

// client/src/components/AuthCallback.js
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { setToken, setUserData, getUserFromToken } from '../utils/auth';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState('');

  useEffect(() => {
    handleAuthCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAuthCallback = async () => {
    console.log('=== AUTH CALLBACK START ===');
    console.log('URL params:', {
    token: searchParams.get('token') ? 'EXISTS' : 'NONE',
    error: searchParams.get('error'),
    linkToken: searchParams.get('link_token')
  });

    try {
      //Clear any previous session data before starting a new session.
      localStorage.clear();

      // Extract parameters from URL
      const token = searchParams.get('token');
      const urlError = searchParams.get('error');
      const linkToken = searchParams.get('link_token'); // For magic link callback

      if (!token) {
      console.error('No token in callback');
      return;
      }

      // Handle OAuth errors
      if (urlError) {
        console.error('OAuth error:', urlError);
        setError(decodeURIComponent(urlError));
        setStatus('error');
        
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
        return;
      }

      // Handle Magic Link callback
      if (linkToken) {
        console.log('Magic link callback detected, redirecting to login...');
        navigate(`/login?link_token=${linkToken}`, { replace: true });
        return;
      }

      // Handle missing token
      if (!token) {
        setError('No authentication token received');
        setStatus('error');
        
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
        return;
      }

      // Process successful OAuth authentication
      console.log('Processing OAuth token...');
      
      console.log('Processing token...');
      setToken(token);
  
    

      // Extract and store user data
      const userData = getUserFromToken();
      console.log('=== NEW LOGIN DEBUG ===');
      console.log('Token user email:', userData.email);
      console.log('Token org ID:', userData.organizationId);
      console.log('Token org name:', userData.organizationName);
      console.log('======================');
      
      if (!userData) {
        throw new Error('Invalid token format');
      }

      console.log('User authenticated:', userData.email);
      setUserData(userData);
      
      setStatus('success');

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);

    } catch (error) {
      console.error('Auth callback error:', error);
      setError(error.message || 'Authentication processing failed');
      setStatus('error');
      
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    }
  };

  // Processing state
  if (status === 'processing') {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.spinner}></div>
          <h2 style={styles.title}>Processing Authentication</h2>
          <p style={styles.message}>Please wait while we complete your login...</p>
          <div style={styles.steps}>
            <p>✓ Provider verified your identity</p>
            <p>⏳ Creating your session...</p>
            <p>⏳ Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div style={styles.container}>
        <div style={{...styles.content, ...styles.successContent}}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.title}>Authentication Successful!</h2>
          <p style={styles.message}>Welcome to your CRM dashboard!</p>
          <p style={styles.subMessage}>Redirecting you now...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div style={styles.container}>
        <div style={{...styles.content, ...styles.errorContent}}>
          <div style={styles.errorIcon}>⚠</div>
          <h2 style={styles.title}>Authentication Failed</h2>
          <p style={styles.message}>{error || 'An error occurred during authentication'}</p>
          <div style={styles.errorDetails}>
            <h4>Common causes:</h4>
            <ul>
              <li>OAuth was cancelled or denied</li>
              <li>Network connectivity issues</li>
              <li>ScaleKit configuration problems</li>
              <li>Invalid redirect URI</li>
            </ul>
            <h4 style={{ marginTop: '16px' }}>What to try:</h4>
            <ul>
              <li>Return to login and try again</li>
              <li>Try a different authentication method</li>
              <li>Check your email for magic link/OTP</li>
              <li>Contact support if the issue persists</li>
            </ul>
          </div>
          <p style={styles.redirectMessage}>Redirecting to login in 3 seconds...</p>
          <button 
            onClick={() => navigate('/login', { replace: true })} 
            style={styles.manualButton}
          >
            Go to Login Now
          </button>
        </div>
      </div>
    );
  }

  return null;
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  content: {
    background: 'white',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  },
  successContent: {
    borderTop: '4px solid #28a745',
  },
  errorContent: {
    borderTop: '4px solid #dc3545',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e3e3e3',
    borderTop: '4px solid #007bff',
    borderRadius: '50%',
    margin: '0 auto 20px auto',
  },
  successIcon: {
    fontSize: '4rem',
    color: '#28a745',
    marginBottom: '20px',
  },
  errorIcon: {
    fontSize: '4rem',
    color: '#dc3545',
    marginBottom: '20px',
  },
  title: {
    fontSize: '1.8rem',
    marginBottom: '16px',
    color: '#333',
    fontWeight: '600',
  },
  message: {
    color: '#666',
    marginBottom: '20px',
    fontSize: '1.1rem',
  },
  subMessage: {
    color: '#888',
    fontSize: '0.9rem',
    fontStyle: 'italic',
  },
  steps: {
    textAlign: 'left',
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    lineHeight: '1.8',
  },
  errorDetails: {
    textAlign: 'left',
    margin: '20px 0',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    fontSize: '0.95rem',
  },
  redirectMessage: {
    color: '#888',
    fontStyle: 'italic',
    marginTop: '20px',
    fontSize: '0.9rem',
  },
  manualButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '16px',
    transition: 'background-color 0.3s ease',
  },
};

// Add CSS animation for spinner
const styleSheet = document.styleSheets[0];
const keyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`;

if (styleSheet) {
  try {
    styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
  } catch (e) {
    // Animation already exists or browser doesn't support
  }
}

export default AuthCallback;