// server/src/routes/auth.js
// Authentication routes handling all ScaleKit authentication methods
const express = require('express');
const scalekit = require('../services/scalekit');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { 
  findOrganization, 
  createOrganization, 
  findUser, 
  createUser 
} = require('../services/supabase');

const router = express.Router();

// Helper function to extract domain from email
const getDomainFromEmail = (email) => {
  return email.split('@')[1];
};

// Helper function to create or find organization and user
// server/src/routes/auth.js

const createUserSession = async (scalekitUser) => {
  try {
    // Extract email
    const email = scalekitUser.email;
    if (!email) {
      throw new Error('No email found in Scalekit user data');
    }
    console.log('✅ Email:', email);
    
    // Extract organization information
    const domain = getDomainFromEmail(email);
    console.log('✅ Domain:', domain);
    
    const orgName = scalekitUser.organization?.name || 
                   scalekitUser.organizationName || 
                   `${domain} Organization`;
    console.log('✅ Org Name:', orgName);
    
    const scalekitOrgId = scalekitUser.organization?.id || 
                         scalekitUser.organizationId || 
                         scalekitUser.org_id;
    console.log('✅ Scalekit Org ID:', scalekitOrgId);
    
    // Find or create organization
    console.log('\n🔍 Looking for organization...');
    let organization = await findOrganization(scalekitOrgId, domain);
    
    if (!organization) {
      console.log('📝 Organization not found, creating new one...');
      try {
        organization = await createOrganization({
          name: orgName,
          domain: domain,
          scalekit_org_id: scalekitOrgId
        });
        console.log('Created organization:', organization);
      } catch (orgError) {
        console.error('Failed to create organization:', orgError);
        throw new Error(`Failed to create organization: ${orgError.message}`);
      }
    } else {
      console.log('Found existing organization:', organization.name);
    }
    
    // Find or create user
    console.log('\n🔍 Looking for user...');
    let user = await findUser(email);
    
    if (!user) {
      console.log('📝 User not found, creating new one...');
      try {
        const userData = {
          email: email,
          first_name: scalekitUser.given_name || 
                     scalekitUser.firstName || 
                     scalekitUser.givenName ||
                     email.split('@')[0],
          last_name: scalekitUser.family_name || 
                    scalekitUser.lastName || 
                    scalekitUser.familyName ||
                    '',
          organization_id: organization.id,
          scalekit_user_id: scalekitUser.id || scalekitUser.sub || scalekitUser.user_id,
          role: 'user'
        };
        
        console.log('User data to create:', userData);
        
        user = await createUser(userData);
        console.log('✅ Created user:', user);
      } catch (userError) {
        console.error('❌ Failed to create user:', userError);
        throw new Error(`Failed to create user: ${userError.message}`);
      }
    } else {
      console.log('✅ Found existing user:', user.email);
    }
    
    // Generate JWT token
    console.log('\n🔑 Generating JWT token...');
    try {
      const token = generateToken({
        userId: user.id,
        email: user.email,
        organizationId: organization.id,
        organizationName: organization.name,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      });
      console.log('✅ Token generated successfully');
      console.log('========================================\n');
      
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          organizationId: organization.id,
          organizationName: organization.name
        }
      };
    } catch (tokenError) {
      console.error('❌ Failed to generate token:', tokenError);
      throw new Error(`Failed to generate token: ${tokenError.message}`);
    }
    
  } catch (error) {
    console.error('\n❌ CREATE USER SESSION FAILED');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('========================================\n');
    throw error;
  }
};

// Route 1: Magic Link Login (FSA)
router.post('/login/magic-link', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    console.log('📧 Initiating login for:', email);
    
    // Generate Scalekit authorization URL
    const authUrl = scalekit.getAuthorizationUrl(
      `${process.env.SERVER_URL}/api/auth/callback`,
      {
        loginHint: email,
        state: JSON.stringify({ 
          method: 'magic-link',
          email: email,
          timestamp: Date.now()
        })
      }
    );
    
    console.log('✅ Generated auth URL');
    
    res.json({
      success: true,
      authUrl: authUrl,
      message: 'Redirecting to login...'
    });
    
  } catch (error) {
    console.error('❌ Magic link error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to initiate login',
      code: 'LOGIN_FAILED'
    });
  }
});

// Route 2: OTP Login (FSA)
router.post('/login/otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    console.log('📧 Initiating OTP login for:', email);
    
    const authUrl = scalekit.getAuthorizationUrl(
      `${process.env.SERVER_URL}/api/auth/callback`,
      {
        loginHint: email,
        state: JSON.stringify({ 
          method: 'otp',
          email: email,
          timestamp: Date.now()
        })
      }
    );
    
    res.json({
      success: true,
      authUrl: authUrl,
      message: 'Redirecting to login...'
    });
    
  } catch (error) {
    console.error('❌ OTP login error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to initiate login',
      code: 'LOGIN_FAILED'
    });
  }
});

// Route 3: Google OAuth Login (FSA)
router.post('/login/google', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    console.log('🔍 Initiating Google login for:', email);
    
    const authUrl = scalekit.getAuthorizationUrl(
      `${process.env.SERVER_URL}/api/auth/callback`,
      {
        loginHint: email,
        provider: 'google',
        state: JSON.stringify({ 
          method: 'google',
          email: email,
          timestamp: Date.now()
        })
      }
    );
    
    res.json({ authUrl });
    
  } catch (error) {
    console.error('❌ Google login error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to initiate Google login',
      code: 'GOOGLE_LOGIN_FAILED'
    });
  }
});

// Route 4: Microsoft OAuth Login (FSA)
router.post('/login/microsoft', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    console.log('🔍 Initiating Microsoft login for:', email);
    
    const authUrl = scalekit.getAuthorizationUrl(
      `${process.env.SERVER_URL}/api/auth/callback`,
      {
        loginHint: email,
        provider: 'microsoft',
        state: JSON.stringify({ 
          method: 'microsoft',
          email: email,
          timestamp: Date.now()
        })
      }
    );
    
    res.json({ authUrl });
    
  } catch (error) {
    console.error('❌ Microsoft login error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to initiate Microsoft login',
      code: 'MICROSOFT_LOGIN_FAILED'
    });
  }
});

// Route 5: OAuth Callback (handles all FSA authentication)
router.get('/callback', async (req, res) => {
  try {
    const { code, error, state } = req.query;
    
    if (error) {
      console.error('Auth error:', error);
      return res.redirect(
        `${process.env.CLIENT_URL}/login?error=${encodeURIComponent(error)}`
      );
    }
    
    if (!code) {
      return res.redirect(
        `${process.env.CLIENT_URL}/login?error=missing_code`
      );
    }
    
    console.log('✅ Processing authentication callback...');
    
    // Exchange code for user info
    const result = await scalekit.authenticateWithCode(
      code,
      `${process.env.SERVER_URL}/api/auth/callback`
    );
    
    console.log('✅ Authentication successful');
    
    // Get user information
    const userInfo = result.user || result;
    
    // Create application session
    const session = await createUserSession(userInfo);
    
    // Redirect to frontend with token
    res.redirect(
      `${process.env.CLIENT_URL}/auth/success?token=${session.token}`
    );
  } catch (error) {
    console.error('❌ Callback error:', error);
    res.redirect(
      `${process.env.CLIENT_URL}/login?error=${encodeURIComponent(error.message)}`
    );
  }
});

// Logout - clear session and redirect to Scalekit logout
router.post('/logout', (req, res) => {
  res.json({ success: true });
});

// Route 7: Get current user (protected)
router.get('/me', require('../middleware/auth').authenticateToken, (req, res) => {
  res.json({
    user: req.user,
    authenticated: true
  });
});

module.exports = router;