const { ScalekitClient } = require('@scalekit-sdk/node');

console.log('🔍 ScaleKit Environment Variables:');
console.log('SCALEKIT_ENVIRONMENT_URL:', process.env.SCALEKIT_ENVIRONMENT_URL);
console.log('SCALEKIT_CLIENT_ID:', process.env.SCALEKIT_CLIENT_ID);
console.log('SCALEKIT_CLIENT_SECRET:', process.env.SCALEKIT_CLIENT_SECRET ? 'SET' : 'MISSING');

// Create ScaleKit client
const scalekit = new ScalekitClient(
  process.env.SCALEKIT_ENVIRONMENT_URL,
  process.env.SCALEKIT_CLIENT_ID,
  process.env.SCALEKIT_CLIENT_SECRET
);

console.log('✅ ScaleKit client created:', !!scalekit);
console.log('✅ ScaleKit type:', scalekit.constructor.name);

// Check if passwordless is available
if (scalekit.passwordless) {
  console.log('✅ Passwordless authentication available');
  console.log('✅ Available passwordless methods:', Object.keys(scalekit.passwordless));
} else {
  console.log('❌ Passwordless authentication not available');
  console.log('Available methods:', Object.keys(scalekit));
}

module.exports = scalekit;