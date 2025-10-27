const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Test data
const testRequest = {
  customer_name: 'John Doe',
  phone: '555-1234',
  pickup_location: '123 Main St',
  dropoff_location: '456 Oak Ave',
  pickup_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
  passengers: 3,
  notes: 'Test request from automated flow test'
};

const coordinatorLogin = {
  username: 'coordinator',
  password: 'password'
};

async function testCompleteFlow() {
  console.log('\n🧪 Starting Complete Application Flow Test\n');
  console.log('='.repeat(50));

  try {
    // Test 1: Health Check
    console.log('\n1️⃣  Testing Health Endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    // Test 2: Submit Customer Request (Public)
    console.log('\n2️⃣  Testing Customer Request Submission...');
    const requestResponse = await axios.post(`${BASE_URL}/requests`, testRequest);
    console.log('✅ Request created:', {
      id: requestResponse.data.data.id,
      customer_name: requestResponse.data.data.customer_name,
      status: requestResponse.data.data.status
    });
    const requestId = requestResponse.data.data.id;

    // Test 3: Admin Login
    console.log('\n3️⃣  Testing Admin Authentication...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, coordinatorLogin);
    authToken = loginResponse.data.token;
    console.log('✅ Login successful, token received');

    // Test 4: Verify Token
    console.log('\n4️⃣  Testing Token Verification...');
    const verifyResponse = await axios.get(`${BASE_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Token verified:', verifyResponse.data.user);

    // Test 5: Get All Requests (Protected)
    console.log('\n5️⃣  Testing Get All Requests...');
    const allRequestsResponse = await axios.get(`${BASE_URL}/requests`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Requests fetched:', {
      total: allRequestsResponse.data.pagination.total,
      page: allRequestsResponse.data.pagination.page,
      limit: allRequestsResponse.data.pagination.limit
    });

    // Test 6: Search Requests
    console.log('\n6️⃣  Testing Search Functionality...');
    const searchResponse = await axios.get(`${BASE_URL}/requests?search=John`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Search results:', searchResponse.data.pagination.total, 'requests found');

    // Test 7: Filter by Status
    console.log('\n7️⃣  Testing Status Filter...');
    const filterResponse = await axios.get(`${BASE_URL}/requests?status=pending`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Pending requests:', filterResponse.data.pagination.total);

    // Test 8: Approve Request
    console.log('\n8️⃣  Testing Request Approval...');
    const approveResponse = await axios.put(
      `${BASE_URL}/requests/${requestId}`,
      { status: 'approved' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('✅ Request approved:', approveResponse.data.data.status);

    // Test 9: Get Drivers
    console.log('\n9️⃣  Testing Get Drivers...');
    const driversResponse = await axios.get(`${BASE_URL}/drivers`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Drivers fetched:', driversResponse.data.data.length, 'drivers available');
    const driverId = driversResponse.data.data[0].id;

    // Test 10: Get Vehicles
    console.log('\n🔟 Testing Get Vehicles...');
    const vehiclesResponse = await axios.get(`${BASE_URL}/vehicles`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Vehicles fetched:', vehiclesResponse.data.data.length, 'vehicles available');
    const vehicleId = vehiclesResponse.data.data[0].id;

    // Test 11: Schedule Assignment
    console.log('\n1️⃣1️⃣  Testing Schedule/Assignment...');
    const scheduleResponse = await axios.put(
      `${BASE_URL}/requests/${requestId}`,
      {
        status: 'scheduled',
        driver_id: driverId,
        vehicle_id: vehicleId
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('✅ Request scheduled:', {
      status: scheduleResponse.data.data.status,
      assignment: scheduleResponse.data.data.Assignment
    });

    // Test 12: Analytics
    console.log('\n1️⃣2️⃣  Testing Analytics Endpoint...');
    const analyticsResponse = await axios.get(`${BASE_URL}/analytics/daily`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Analytics data:', {
      days: analyticsResponse.data.data.length,
      sample: analyticsResponse.data.data[0]
    });

    // Test 13: Delete Request
    console.log('\n1️⃣3️⃣  Testing Delete Request...');
    const deleteResponse = await axios.delete(`${BASE_URL}/requests/${requestId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Request deleted:', deleteResponse.data.message);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('🎉 ALL TESTS PASSED! Application flow verified successfully!');
    console.log('='.repeat(50));
    console.log('\n✨ Test Summary:');
    console.log('   ✅ Health check');
    console.log('   ✅ Customer request submission (public)');
    console.log('   ✅ Admin authentication (JWT)');
    console.log('   ✅ Token verification');
    console.log('   ✅ Protected endpoints access');
    console.log('   ✅ Search functionality');
    console.log('   ✅ Status filtering');
    console.log('   ✅ Request approval');
    console.log('   ✅ Driver/Vehicle fetching');
    console.log('   ✅ Scheduling/Assignment');
    console.log('   ✅ Analytics data');
    console.log('   ✅ Request deletion');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    process.exit(1);
  }
}

// Run the tests
testCompleteFlow();
