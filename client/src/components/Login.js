// client/src/components/Login.js
import React, { useState } from 'react';
import {
  sendMagicLink,
  sendOTP,
  loginWithGoogle,
  loginWithMicrosoft
} from '../utils/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSendMagicLink = async (e) => {
  e.preventDefault();
  console.log('=== MAGIC LINK REQUEST ===');
  console.log('Email entered:', email);
  console.log('Current localStorage:', {
    token: localStorage.getItem('authToken') ? 'EXISTS' : 'NONE',
    userData: localStorage.getItem('userData')
  });
  
  if (!isValidEmail(email)) return setError('Please enter a valid email address');
  setLoading(true);
  
  try {
    const response = await sendMagicLink(email);
    console.log('Magic link API response:', response);
  } catch (err) {
    console.error('Magic link error:', err);
    setError(err.message);
    setLoading(false);
  }
};

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await sendOTP(email);
      // Will redirect to Scalekit
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await loginWithGoogle(email);
      // Will redirect to Google
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initiate Google login');
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setError('');
    
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await loginWithMicrosoft(email);
      // Will redirect to Microsoft
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initiate Microsoft login');
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Multi-tenant CRM</h1>
        <p style={styles.subtitle}>Enter your email to sign in</p>

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        <form style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Magic Link</h3>
            <button
              type="button"
              style={styles.button}
              onClick={handleSendMagicLink}
              disabled={loading}
            >
              {loading ? 'Redirecting...' : 'Send Magic Link'}
            </button>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>One-Time Password</h3>
            <button
              type="button"
              style={styles.button}
              onClick={handleSendOTP}
              disabled={loading}
            >
              {loading ? 'Redirecting...' : 'Send OTP Code'}
            </button>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Google</h3>
            <button
              type="button"
              style={{ ...styles.button, ...styles.googleButton }}
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? 'Redirecting...' : 'Login with Google'}
            </button>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Microsoft</h3>
            <button
              type="button"
              style={{ ...styles.button, ...styles.microsoftButton }}
              onClick={handleMicrosoftLogin}
              disabled={loading}
            >
              {loading ? 'Redirecting...' : 'Login with Microsoft'}
            </button>
          </div>
        </form>

        <p style={styles.hint}>
          Tip: Use your real email to receive login links
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    maxWidth: '500px',
    width: '100%',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '30px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
  },
  input: {
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
  },
  section: {
    paddingBottom: '20px',
    borderBottom: '1px solid #eee',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '12px',
  },
  button: {
    padding: '15px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    width: '100%',
  },
  googleButton: {
    backgroundColor: '#dc3545',
  },
  microsoftButton: {
    backgroundColor: '#0078d4',
  },
  errorBox: {
    padding: '12px',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '8px',
    color: '#721c24',
    marginBottom: '20px',
  },
  hint: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
};

export default Login;