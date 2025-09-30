// client/src/components/VerifyMagicLink.js
// Handles magic link verification when user clicks the magic link

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const VerifyMagicLink = ({ onLogin }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState('');

  // API base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    handleMagicLinkVerification();
  }, []);

  // Function to process magic link verification
  const handleMagicLinkVerification = async () => {
    try {
      // Extract parameters from magic link URL
      const linkToken = searchParams.get('link_token');
      const authRequestId = localStorage.getItem('authRequestId');

      console.log('Magic link verification started...');
      console.log('Link token:', linkToken ? 'Present' : 'Missing');
      console.log('Auth request ID:', authRequestId ? 'Present' : 'Missing');

      // Validate required parameters
      if (!linkToken) {
        setError('Invalid magic link - missing authentication token');
        setStatus('error');
        redirectToLogin();
        return;
      }

      if (!authRequestId) {
        setError('Invalid magic link - missing auth request ID. Please try logging in again.');
        setStatus('error');
        redirectToLogin();
        return;
      }

      console.log('Verifying magic link with ScaleKit...');
      setStatus('verifying');

      // Call backend to verify magic link with ScaleKit
      const response = await fetch(`${API_BASE_URL}/auth/verify/magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          linkToken: linkToken, 
          authRequestId: authRequestId 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Magic link verification failed');
      }

      const result = await response.json();

      // Handle successful verification
      console.log('Magic link verified successfully');
      setStatus('success');

      // Store authentication token
      localStorage.setItem('authToken', result.token);
      
      // Call parent login handler to update app state
      onLogin(result.user, result.token);

      // Clean up stored auth request ID
      localStorage.removeItem('authRequestId');

      // Brief delay to show success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('Magic link verification error:', error);
      setError(error.message || 'Magic link verification failed');
      setStatus('error');
      
      // Clean up stored auth request ID on error
      localStorage.removeItem('authRequestId');
      
      redirectToLogin();
    }
  };

  // Function to redirect to login with delay
  const redirectToLogin = () => {
    setTimeout(() => {
      navigate('/login');
    }, 5000);
  };

  // Manual redirect function
  const goToLogin = () => {
    navigate('/login');
  };

  // Render different states based on verification status
  if (status === 'processing' || status === 'verifying') {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.spinner}></div>
          <h2 style={styles.title}>Verifying Magic Link</h2>
          <p style={styles.message}>Please wait while we verify your magic link...</p>
          <div style={styles.steps}>
            <p>✓ Magic link clicked</p>
            <p>⏳ Verifying with ScaleKit...</p>
            <p>⏳ Creating your session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div style={styles.container}>
        <div style={{...styles.content, ...styles.successContent}}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.title}>Magic Link Verified!</h2>
          <p style={styles.message}>Welcome! You have been successfully authenticated.</p>
          <p style={styles.subMessage}>Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={styles.container}>
        <div style={{...styles.content, ...styles.errorContent}}>
          <div style={styles.errorIcon}>⚠</div>
          <h2 style={styles.title}>Magic Link Verification Failed</h2>
          <p style={styles.message}>{error}</p>
          
          <div style={styles.errorDetails}>
            <h4>Possible reasons:</h4>
            <ul>
              <li>The magic link has expired (valid for 10 minutes)</li>
              <li>The magic link has already been used</li>
              <li>The magic link is invalid or corrupted</li>
              <li>You may need to request a new magic link</li>
              <li>The auth request session has expired</li>
            </ul>
          </div>
          
          <div style={styles.troubleshooting}>
            <h4>What to do next:</h4>
            <ol>
              <li>Go back to the login page</li>
              <li>Enter your email address again</li>
              <li>Request a new magic link</li>
              <li>Check your email and click the new link quickly</li>
            </ol>
          </div>
          
          <p style={styles.redirectMessage}>Redirecting to login page in 5 seconds...</p>
          <button 
            onClick={goToLogin} 
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

// Inline styles for the component
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
    maxWidth: '600px',
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
    animation: 'spin 1s linear infinite',
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
  },
  errorDetails: {
    textAlign: 'left',
    margin: '20px 0',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  troubleshooting: {
    textAlign: 'left',
    margin: '20px 0',
    padding: '20px',
    backgroundColor: '#e7f3ff',
    borderRadius: '8px',
    borderLeft: '4px solid #007bff',
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

export default VerifyMagicLink;