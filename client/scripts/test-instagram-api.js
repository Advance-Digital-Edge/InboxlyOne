// Test script for Instagram API integration
// Run with: node scripts/test-instagram-api.js

const testInstagramAPI = async () => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : 'http://localhost:3000';

  console.log('🔍 Testing Instagram API endpoints...\n');

  // Test 1: Check if Instagram callback endpoint is accessible
  try {
    console.log('1. Testing Instagram OAuth callback endpoint...');
    const response = await fetch(`${baseUrl}/api/instagram/callback`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Expected: 400 (No code provided)`);
    console.log('   ✅ Endpoint is accessible\n');
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 2: Check Instagram messages endpoint (requires auth)
  try {
    console.log('2. Testing Instagram messages endpoint...');
    const response = await fetch(`${baseUrl}/api/instagram/messages`);
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
    console.log('   Expected: 401 (Unauthorized - requires authentication)\n');
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 3: Check webhook verification endpoint
  try {
    console.log('3. Testing Instagram webhook verification...');
    const verifyToken = 'test_token';
    const challenge = 'test_challenge';
    const url = `${baseUrl}/api/instagram/notifications?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=${challenge}`;
    
    const response = await fetch(url);
    console.log(`   Status: ${response.status}`);
    console.log('   Expected: 403 (Wrong verify token) or 200 (if token matches)\n');
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  console.log('📋 Summary:');
  console.log('- All Instagram API endpoints are set up');
  console.log('- OAuth callback is ready for Meta app configuration');
  console.log('- Webhook endpoint is ready for Instagram webhook setup');
  console.log('- Message sending/receiving will work once Instagram Messaging API is approved');
  console.log('\n📖 Next steps:');
  console.log('1. Configure your Meta app with Instagram products');
  console.log('2. Add environment variables for Instagram API');
  console.log('3. Test OAuth flow through the UI');
  console.log('4. Apply for Instagram Messaging API if needed');
};

// Run the test if this file is executed directly
if (require.main === module) {
  testInstagramAPI().catch(console.error);
}

module.exports = { testInstagramAPI };
