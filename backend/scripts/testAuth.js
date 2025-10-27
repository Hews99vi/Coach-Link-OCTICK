// Test script for authentication endpoints

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test credentials
const TEST_CREDENTIALS = {
  username: 'coordinator',
  password: 'admin123', // Make sure this matches your .env COORDINATOR_PASSWORD
};

let authToken = null;

async function testLogin() {
  console.log('\n🔐 Testing Login...');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, TEST_CREDENTIALS);
    
    console.log('✅ Login successful!');
    console.log('Token:', response.data.token.substring(0, 50) + '...');
    console.log('User:', response.data.user);
    
    authToken = response.data.token;
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testInvalidLogin() {
  console.log('\n🔐 Testing Invalid Login...');
  
  try {
    await axios.post(`${BASE_URL}/auth/login`, {
      username: 'coordinator',
      password: 'wrongpassword',
    });
    
    console.error('❌ Should have failed but succeeded');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Invalid login correctly rejected');
      return true;
    }
    console.error('❌ Unexpected error:', error.response?.data || error.message);
    return false;
  }
}

async function testVerifyToken() {
  console.log('\n🔍 Testing Token Verification...');
  
  if (!authToken) {
    console.error('❌ No token available');
    return false;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    
    console.log('✅ Token verified successfully');
    console.log('User:', response.data.user);
    return true;
  } catch (error) {
    console.error('❌ Token verification failed:', error.response?.data || error.message);
    return false;
  }
}

async function testProtectedRoute() {
  console.log('\n🛡️ Testing Protected Route (GET /requests)...');
  
  if (!authToken) {
    console.error('❌ No token available');
    return false;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/requests`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    
    console.log('✅ Protected route accessed successfully');
    console.log('Requests count:', response.data.data.length);
    return true;
  } catch (error) {
    console.error('❌ Protected route access failed:', error.response?.data || error.message);
    return false;
  }
}

async function testUnauthorizedAccess() {
  console.log('\n🚫 Testing Unauthorized Access...');
  
  try {
    await axios.get(`${BASE_URL}/requests`);
    
    console.error('❌ Should have been blocked but succeeded');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Unauthorized access correctly blocked');
      return true;
    }
    console.error('❌ Unexpected error:', error.response?.data || error.message);
    return false;
  }
}

async function testPublicRoute() {
  console.log('\n📝 Testing Public Route (POST /requests)...');
  
  try {
    const response = await axios.post(`${BASE_URL}/requests`, {
      customer_name: 'Test Customer',
      phone: '555-9999',
      pickup_location: 'Downtown',
      dropoff_location: 'Airport',
      pickup_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      passengers: 3,
      notes: 'Test request from auth test',
    });
    
    console.log('✅ Public route accessible');
    console.log('Created request ID:', response.data.data.id);
    return true;
  } catch (error) {
    console.error('❌ Public route failed:', error.response?.data || error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 Running Authentication Tests...\n');
  console.log('=' . repeat(50));
  
  const results = {
    login: await testLogin(),
    invalidLogin: await testInvalidLogin(),
    verifyToken: await testVerifyToken(),
    protectedRoute: await testProtectedRoute(),
    unauthorizedAccess: await testUnauthorizedAccess(),
    publicRoute: await testPublicRoute(),
  };
  
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Results:');
  console.log('='.repeat(50));
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`);
  });
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r).length;
  
  console.log('\n' + '='.repeat(50));
  console.log(`\n📈 Summary: ${passedTests}/${totalTests} tests passed`);
  console.log('='.repeat(50) + '\n');
  
  process.exit(passedTests === totalTests ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
