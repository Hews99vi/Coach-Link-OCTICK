// Simple test script to verify API endpoints

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing Coach-Link API...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const health = await axios.get('http://localhost:5000/health');
    console.log('✓ Health check:', health.data.message);

    // Test 2: Get all drivers
    console.log('\n2️⃣ Testing GET /drivers...');
    const drivers = await axios.get(`${BASE_URL}/drivers`);
    console.log(`✓ Found ${drivers.data.count} drivers`);

    // Test 3: Get all vehicles
    console.log('\n3️⃣ Testing GET /vehicles...');
    const vehicles = await axios.get(`${BASE_URL}/vehicles`);
    console.log(`✓ Found ${vehicles.data.count} vehicles`);

    // Test 4: Create a service request
    console.log('\n4️⃣ Testing POST /requests...');
    const newRequest = {
      customer_name: 'Test Customer',
      phone: '555-1234',
      pickup_location: '123 Main St',
      dropoff_location: '456 Oak Ave',
      pickup_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      passengers: 2,
      notes: 'Test request from API test script',
    };
    const createResponse = await axios.post(`${BASE_URL}/requests`, newRequest);
    console.log(`✓ Created request ID: ${createResponse.data.data.id}`);
    const requestId = createResponse.data.data.id;

    // Test 5: Get all requests
    console.log('\n5️⃣ Testing GET /requests...');
    const requests = await axios.get(`${BASE_URL}/requests`);
    console.log(`✓ Found ${requests.data.pagination.total} total requests`);
    console.log(`  - Page: ${requests.data.pagination.page}/${requests.data.pagination.totalPages}`);

    // Test 6: Get single request
    console.log('\n6️⃣ Testing GET /requests/:id...');
    const singleRequest = await axios.get(`${BASE_URL}/requests/${requestId}`);
    console.log(`✓ Retrieved request: ${singleRequest.data.data.customer_name}`);

    // Test 7: Update request to approved
    console.log('\n7️⃣ Testing PUT /requests/:id (approve)...');
    const approveResponse = await axios.put(`${BASE_URL}/requests/${requestId}`, {
      status: 'approved',
    });
    console.log(`✓ Status updated to: ${approveResponse.data.data.status}`);

    // Test 8: Schedule the request
    console.log('\n8️⃣ Testing PUT /requests/:id (schedule)...');
    const scheduleResponse = await axios.put(`${BASE_URL}/requests/${requestId}`, {
      status: 'scheduled',
      driver_id: 1,
      vehicle_id: 1,
      scheduled_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
    console.log(`✓ Request scheduled with driver and vehicle`);

    // Test 9: Get analytics - daily
    console.log('\n9️⃣ Testing GET /analytics/daily...');
    const analytics = await axios.get(`${BASE_URL}/analytics/daily`);
    console.log(`✓ Daily analytics for last 7 days:`);
    console.log(`  - Total requests: ${analytics.data.summary.totalRequests}`);
    console.log(`  - Average per day: ${analytics.data.summary.averagePerDay}`);

    // Test 10: Get analytics - status
    console.log('\n🔟 Testing GET /analytics/status...');
    const statusAnalytics = await axios.get(`${BASE_URL}/analytics/status`);
    console.log(`✓ Status breakdown:`, statusAnalytics.data.data);

    // Test 11: Get analytics - overview
    console.log('\n1️⃣1️⃣ Testing GET /analytics/overview...');
    const overview = await axios.get(`${BASE_URL}/analytics/overview`);
    console.log(`✓ Overview:`, overview.data.data);

    // Test 12: Search requests
    console.log('\n1️⃣2️⃣ Testing GET /requests with search...');
    const searchResults = await axios.get(`${BASE_URL}/requests?search=Test`);
    console.log(`✓ Found ${searchResults.data.pagination.total} requests matching "Test"`);

    // Test 13: Filter by status
    console.log('\n1️⃣3️⃣ Testing GET /requests with status filter...');
    const filteredResults = await axios.get(`${BASE_URL}/requests?status=scheduled`);
    console.log(`✓ Found ${filteredResults.data.pagination.total} scheduled requests`);

    console.log('\n✅ All tests passed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

// Run tests
testAPI();
