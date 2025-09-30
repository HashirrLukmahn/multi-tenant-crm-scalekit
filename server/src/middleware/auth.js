// server/src/middleware/auth.js
// JWT authentication middleware for protecting API routes

const jwt = require('jsonwebtoken');
const { setRLSContext } = require('../services/supabase');

// Middleware to authenticate JWT tokens and set user context
const authenticateToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
    
    // Check if token is provided
    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }
    
    // Verify and decode JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          error: 'Invalid token',
          code: 'TOKEN_INVALID'
        });
      } else {
        throw jwtError;
      }
    }
    
    // Validate required token fields
    if (!decoded.userId || !decoded.organizationId) {
      return res.status(401).json({ 
        error: 'Invalid token structure',
        code: 'TOKEN_MALFORMED'
      });
    }
    
    // Set user context in request object for route handlers
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      organizationId: decoded.organizationId,
      role: decoded.role || 'user',
      firstName: decoded.firstName,
      lastName: decoded.lastName
    };
  
    // Add debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Authenticated user:', {
        id: req.user.id,
        email: req.user.email,
        organizationId: req.user.organizationId,
        role: req.user.role
      });
    }
    
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ 
      error: 'Authentication service error',
      code: 'AUTH_SERVICE_ERROR'
    });
  }
};

// Middleware to check if user has admin role
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Admin access required',
      code: 'ADMIN_REQUIRED'
    });
  }
  
  next();
};

// Middleware to validate organization access
const validateOrganizationAccess = (req, res, next) => {
  const { organizationId } = req.params;
  
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }
  
  // Check if user is trying to access their own organization data
  if (organizationId && organizationId !== req.user.organizationId) {
    return res.status(403).json({ 
      error: 'Access denied to organization data',
      code: 'ORG_ACCESS_DENIED'
    });
  }
  
  next();
};

// Helper function to generate JWT tokens
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: 'multi-tenant-crm',
    audience: 'crm-users'
  });
};

// Helper function to decode token without verification (for debugging)
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  validateOrganizationAccess,
  generateToken,
  decodeToken
};