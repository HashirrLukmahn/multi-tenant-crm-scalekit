// Create this as a separate file: test-scalekit.js
// Run with: node test-scalekit.js

require('dotenv').config();
const { ScalekitClient } = require('@scalekit-sdk/node');

console.log('🔍 Testing ScaleKit Configuration');
console.log('================================');

// Check environment variables
console.log('Environment Variables:');
console.log('SCALEKIT_ENVIRONMENT_URL:', process.env.SCALEKIT_ENVIRONMENT_URL);
console.log('SCALEKIT_CLIENT_ID:', process.env.SCALEKIT_CLIENT_ID);
console.log('SCALEKIT_CLIENT_SECRET:', process.env.SCALEKIT_CLIENT_SECRET ? 'SET' : 'MISSING');
console.log('');

// Check if all required variables are set
const requiredVars = ['SCALEKIT_ENVIRONMENT_URL', 'SCALEKIT_CLIENT_ID', 'SCALEKIT_CLIENT_SECRET'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  process.exit(1);
}

// Create ScaleKit client
let scalekit;
try {
  scalekit = new ScalekitClient(
    process.env.SCALEKIT_ENVIRONMENT_URL,
    process.env.SCALEKIT_CLIENT_ID,
    process.env.SCALEKIT_CLIENT_SECRET
  );
  console.log('✅ ScaleKit client created successfully');
} catch (error) {
  console.error('❌ Failed to create ScaleKit client:', error.message);
  process.exit(1);
}

// Check available methods
console.log('Available ScaleKit methods:', Object.keys(scalekit));
console.log('Passwordless available:', !!scalekit.passwordless);

if (scalekit.passwordless) {
  console.log('Passwordless methods:', Object.keys(scalekit.passwordless));
  
  if (scalekit.passwordless.magicLink) {
    console.log('Magic Link methods:', Object.keys(scalekit.passwordless.magicLink));
  }
  
  if (scalekit.passwordless.otp) {
    console.log('OTP methods:', Object.keys(scalekit.passwordless.otp));
  }
} else {
  console.log('❌ Passwordless authentication not available');
  console.log('This might indicate:');
  console.log('1. Your ScaleKit SDK version doesn\'t support passwordless');
  console.log('2. Your ScaleKit account doesn\'t have passwordless enabled');
  console.log('3. Configuration issue with your ScaleKit setup');
}

// Test basic authorization URL generation
try {
  const testAuthUrl = scalekit.getAuthorizationUrl(
    'http://localhost:3001/api/auth/callback',
    { state: 'test' }
  );
  console.log('✅ Basic authorization URL generation works');
  console.log('Sample auth URL:', testAuthUrl);
} catch (error) {
  console.error('❌ Authorization URL generation failed:', error.message);
}

console.log('');
console.log('Next steps:');
console.log('1. If passwordless is not available, check your ScaleKit dashboard settings');
console.log('2. Ensure passwordless authentication is enabled in your ScaleKit project');
console.log('3. Try updating your ScaleKit SDK: npm update @scalekit-sdk/node');
console.log('4. Check ScaleKit documentation for your specific plan/configuration');