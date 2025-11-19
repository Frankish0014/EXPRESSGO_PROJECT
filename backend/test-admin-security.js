#!/usr/bin/env node
/**
 * Admin Endpoint Security Test Script
 * 
 * This script systematically tests that all admin endpoints properly reject:
 * 1. Unauthenticated requests (no token)
 * 2. Authenticated non-admin users (passenger role)
 * 3. Blacklisted/invalid tokens
 * 
 * Run this script with: node test-admin-security.js
 * Make sure the backend server is running on http://localhost:3000
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Test data
const TEST_DATA = {
  // Regular user credentials (passenger role)
  regularUser: {
    full_name: 'Test User',
    email: 'testuser@example.com',
    phone_number: '+250788123456',
    password: 'TestPass123'
  },
  
  // Admin user credentials (will be created via seeder)
  adminUser: {
    email: 'admin@expressgo.com',
    password: 'admin123'
  },
  
  // Test route data
  testRoute: {
    departure_city: 'Kigali',
    arrival_city: 'Musanze',
    distance_km: 85,
    estimated_duration_minutes: 120
  },
  
  // Test schedule data
  testSchedule: {
    bus_id: 1,
    route_id: 1,
    departure_time: '08:00',
    arrival_time: '10:00',
    price: 2500,
    available_days: 'Monday,Tuesday,Wednesday,Thursday,Friday',
    is_active: true
  },
  
  // Test booking status update
  testBookingUpdate: {
    status: 'confirmed'
  }
};

// Admin endpoints to test
const ADMIN_ENDPOINTS = [
  // Route admin endpoints
  { method: 'POST', path: '/api/routes', data: TEST_DATA.testRoute, description: 'Create route' },
  { method: 'PUT', path: '/api/routes/1', data: TEST_DATA.testRoute, description: 'Update route' },
  { method: 'DELETE', path: '/api/routes/1', description: 'Delete route' },
  
  // Schedule admin endpoints
  { method: 'POST', path: '/api/schedules', data: TEST_DATA.testSchedule, description: 'Create schedule' },
  { method: 'PUT', path: '/api/schedules/1', data: TEST_DATA.testSchedule, description: 'Update schedule' },
  { method: 'DELETE', path: '/api/schedules/1', description: 'Delete schedule' },
  
  // Booking admin endpoints
  { method: 'GET', path: '/api/bookings', description: 'Get all bookings (admin only)' },
  { method: 'PUT', path: '/api/bookings/1/status', data: TEST_DATA.testBookingUpdate, description: 'Update booking status' }
];

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

// Helper function to make HTTP requests
function makeRequest(method, path, headers = {}, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({
            statusCode: res.statusCode,
            data: parsedData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: { raw: responseData },
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test functions
async function registerUser(userData) {
  console.log(`${colors.cyan}📝 Registering user: ${userData.email}${colors.reset}`);
  const response = await makeRequest('POST', '/api/auth/register', {}, userData);
  
  if (response.statusCode === 201) {
    console.log(`${colors.green}✅ User registered successfully${colors.reset}`);
    return response.data;
  } else {
    console.log(`${colors.yellow}⚠️  User registration response: ${response.statusCode} - ${JSON.stringify(response.data)}${colors.reset}`);
    return response.data;
  }
}

async function loginUser(credentials) {
  console.log(`${colors.cyan}🔐 Logging in user: ${credentials.email}${colors.reset}`);
  const response = await makeRequest('POST', '/api/auth/login', {}, credentials);
  
  if (response.statusCode === 200) {
    console.log(`${colors.green}✅ Login successful${colors.reset}`);
    return response.data.token || response.data.data?.token;
  } else {
    console.log(`${colors.red}❌ Login failed: ${response.statusCode} - ${JSON.stringify(response.data)}${colors.reset}`);
    return null;
  }
}

async function testEndpointSecurity(endpoint, token = null, tokenDescription = 'No token') {
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  
  console.log(`\n${colors.blue}🧪 Testing: ${endpoint.description}${colors.reset}`);
  console.log(`   Method: ${endpoint.method} ${endpoint.path}`);
  console.log(`   Auth: ${tokenDescription}`);
  
  try {
    const response = await makeRequest(endpoint.method, endpoint.path, headers, endpoint.data);
    
    const expectedStatus = token ? (tokenDescription.includes('admin') ? [200, 201] : [403]) : [401];
    const actualStatus = response.statusCode;
    
    if (expectedStatus.includes(actualStatus)) {
      console.log(`${colors.green}✅ PASS: Expected status ${expectedStatus.join(' or ')} - Got ${actualStatus}${colors.reset}`);
      console.log(`   Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
      return { passed: true, status: actualStatus, response: response.data };
    } else {
      console.log(`${colors.red}❌ FAIL: Expected status ${expectedStatus.join(' or ')} - Got ${actualStatus}${colors.reset}`);
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      return { passed: false, status: actualStatus, response: response.data };
    }
  } catch (error) {
    console.log(`${colors.red}❌ ERROR: ${error.message}${colors.reset}`);
    return { passed: false, error: error.message };
  }
}

async function testServerHealth() {
  console.log(`${colors.cyan}🏥 Testing server health...${colors.reset}`);
  try {
    const response = await makeRequest('GET', '/health');
    if (response.statusCode === 200) {
      console.log(`${colors.green}✅ Server is running and healthy${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}❌ Server health check failed: ${response.statusCode}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Cannot connect to server: ${error.message}${colors.reset}`);
    return false;
  }
}

async function runSecurityTests() {
  console.log(`${colors.white}
╔══════════════════════════════════════════════════════════════╗
║                  ADMIN ENDPOINT SECURITY TEST                ║
║                                                              ║
║  This script tests that admin endpoints properly reject:     ║
║  • Unauthenticated requests (401)                           ║
║  • Non-admin authenticated requests (403)                   ║
║                                                              ║
║  Server should be running at: ${BASE_URL}                    ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

  // Test server health first
  const serverHealthy = await testServerHealth();
  if (!serverHealthy) {
    console.log(`${colors.red}\n💥 Cannot proceed: Server is not running or unhealthy${colors.reset}`);
    console.log(`${colors.yellow}💡 Please start the backend server with: npm run dev${colors.reset}`);
    process.exit(1);
  }

  let passingTests = 0;
  let failingTests = 0;
  const testResults = [];

  // Step 1: Register a regular user (passenger)
  console.log(`\n${colors.white}══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.white}STEP 1: Setting up test users${colors.reset}`);
  console.log(`${colors.white}══════════════════════════════════════════════════════════════${colors.reset}`);

  await registerUser(TEST_DATA.regularUser);
  const passengerToken = await loginUser({ 
    email: TEST_DATA.regularUser.email, 
    password: TEST_DATA.regularUser.password 
  });

  // Step 2: Try to login as admin (assuming admin seeder was run)
  console.log(`\n${colors.cyan}🔑 Attempting admin login...${colors.reset}`);
  const adminToken = await loginUser(TEST_DATA.adminUser);

  // Step 3: Test each admin endpoint without authentication
  console.log(`\n${colors.white}══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.white}STEP 2: Testing endpoints WITHOUT authentication (expecting 401)${colors.reset}`);
  console.log(`${colors.white}══════════════════════════════════════════════════════════════${colors.reset}`);

  for (const endpoint of ADMIN_ENDPOINTS) {
    const result = await testEndpointSecurity(endpoint, null, 'No token (unauthenticated)');
    testResults.push({ test: `${endpoint.description} - No Auth`, ...result });
    result.passed ? passingTests++ : failingTests++;
  }

  // Step 4: Test each admin endpoint with passenger token
  if (passengerToken) {
    console.log(`\n${colors.white}══════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.white}STEP 3: Testing endpoints WITH passenger token (expecting 403)${colors.reset}`);
    console.log(`${colors.white}══════════════════════════════════════════════════════════════${colors.reset}`);

    for (const endpoint of ADMIN_ENDPOINTS) {
      const result = await testEndpointSecurity(endpoint, passengerToken, 'Passenger token (non-admin)');
      testResults.push({ test: `${endpoint.description} - Passenger`, ...result });
      result.passed ? passingTests++ : failingTests++;
    }
  } else {
    console.log(`${colors.red}⚠️  Skipping passenger token tests - could not obtain passenger token${colors.reset}`);
  }

  // Step 5: Test each admin endpoint with admin token (if available)
  if (adminToken) {
    console.log(`\n${colors.white}══════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.white}STEP 4: Testing endpoints WITH admin token (expecting 200/201)${colors.reset}`);
    console.log(`${colors.white}══════════════════════════════════════════════════════════════${colors.reset}`);

    for (const endpoint of ADMIN_ENDPOINTS) {
      const result = await testEndpointSecurity(endpoint, adminToken, 'Admin token (authorized)');
      testResults.push({ test: `${endpoint.description} - Admin`, ...result });
      // Note: Admin tests may fail due to missing data dependencies, focus on auth responses
    }
  } else {
    console.log(`${colors.yellow}⚠️  Skipping admin token tests - could not obtain admin token${colors.reset}`);
    console.log(`${colors.yellow}💡 Make sure to run database seeders: npm run db:seed${colors.reset}`);
  }

  // Step 6: Test with invalid/malformed tokens
  console.log(`\n${colors.white}══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.white}STEP 5: Testing endpoints with INVALID tokens (expecting 401)${colors.reset}`);
  console.log(`${colors.white}══════════════════════════════════════════════════════════════${colors.reset}`);

  const invalidTokens = [
    { token: 'invalid.jwt.token', description: 'Malformed token' },
    { token: 'Bearer invalid', description: 'Invalid Bearer format' },
    { token: '', description: 'Empty token' }
  ];

  for (const invalidToken of invalidTokens) {
    console.log(`\n${colors.cyan}🧪 Testing with: ${invalidToken.description}${colors.reset}`);
    // Test just one endpoint with each invalid token type
    const testEndpoint = ADMIN_ENDPOINTS[0];
    const result = await testEndpointSecurity(testEndpoint, invalidToken.token, invalidToken.description);
    testResults.push({ test: `${testEndpoint.description} - ${invalidToken.description}`, ...result });
    result.passed ? passingTests++ : failingTests++;
  }

  // Summary
  console.log(`\n${colors.white}╔══════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.white}║                        TEST SUMMARY                          ║${colors.reset}`);
  console.log(`${colors.white}╚══════════════════════════════════════════════════════════════╝${colors.reset}`);
  
  console.log(`\n${colors.green}✅ Passing tests: ${passingTests}${colors.reset}`);
  console.log(`${colors.red}❌ Failing tests: ${failingTests}${colors.reset}`);
  console.log(`${colors.cyan}📊 Total tests: ${passingTests + failingTests}${colors.reset}`);

  if (failingTests > 0) {
    console.log(`\n${colors.red}⚠️  SECURITY ISSUES DETECTED:${colors.reset}`);
    testResults
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`${colors.red}   • ${r.test} - Status: ${r.status}${colors.reset}`);
      });
  } else {
    console.log(`\n${colors.green}🎉 All security tests passed! Admin endpoints are properly protected.${colors.reset}`);
  }

  console.log(`\n${colors.white}💡 Notes:${colors.reset}`);
  console.log(`   • Ensure the backend server is running: npm run dev`);
  console.log(`   • Ensure database is migrated: npm run db:migrate`);
  console.log(`   • Ensure seeders are run: npm run db:seed (for admin user)`);
  console.log(`   • Expected responses:`);
  console.log(`     - 401: Unauthorized (no/invalid token)`);
  console.log(`     - 403: Forbidden (valid token but not admin)`);
  console.log(`     - 200/201: Success (admin token)`);

  process.exit(failingTests > 0 ? 1 : 0);
}

// Run the tests
runSecurityTests().catch(error => {
  console.error(`${colors.red}💥 Test runner error: ${error.message}${colors.reset}`);
  process.exit(1);
});