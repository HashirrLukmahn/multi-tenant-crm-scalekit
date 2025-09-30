// server/src/server.js
// Main Express server setup with ScaleKit authentication integration

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import route handlers
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');
const usersRoutes = require('./routes/users')

// Import middleware
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS middleware - allows cross-origin requests from frontend
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Security middleware - adds various HTTP headers for security
app.use(helmet());

// Logging middleware - logs HTTP requests for debugging
app.use(morgan('combined'));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Body parsing middleware - parses JSON request bodies
app.use(express.json({  })); //limit: '10mb' include inside for optimization if necessary
app.use(express.urlencoded({ extended: true }));

// Health check endpoint - verifies server is running
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Authentication routes - handles ScaleKit login flows
app.use('/api/auth', authRoutes);

// User routes - handles admin and members as well as show Multi-tenancy:
app.use('/api/users', usersRoutes);

// Protected routes - require valid JWT token
app.use('/api/contacts', authenticateToken, contactRoutes);

// Error handling middleware - catches and formats errors
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler - handles requests to non-existent endpoints
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server - begins listening for requests
app.listen(PORT, () => {
  console.log(`\nServer running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  
  // Verify required environment variables
  const required = [
    'SCALEKIT_ENVIRONMENT_URL',
    'SCALEKIT_CLIENT_ID',
    'SCALEKIT_CLIENT_SECRET',
    'SUPABASE_URL',
    'JWT_SECRET'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn('\n  Missing environment variables:', missing.join(', '));
  } else {
    console.log('Required environment variables: OK\n');
  }
});

// More permissive CORS for development
if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: '*', // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: '*'
  }));
} else {
  // Strict CORS for production
  app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
}

// Graceful shutdown handling - properly closes server on termination signals
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down');
  process.exit(0);
});

module.exports = app;