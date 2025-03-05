import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as readline from 'readline';
import axios from 'axios';

dotenv.config();

const API_URL = 'http://localhost:3000';
let accessToken = '';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function signIn() {
  try {
    console.log('🔑 Signing in with test user...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'testuser@example.com',
      password: 'Test123456!'
    });
    
    if (error) throw error;
    
    accessToken = data.session?.access_token || '';
    console.log('✅ Signed in successfully');
    console.log(`Access Token: ${accessToken.substring(0, 20)}...`);
    
    return accessToken;
  } catch (error) {
    console.error('❌ Sign in failed:', error);
    throw error;
  }
}

async function testFlightSearch() {
  try {
    console.log('\n🔍 Testing flight search...');
    
    const response = await axios.get(`${API_URL}/flights`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      params: {
        origin: 'NYC',
        destination: 'LAX'
      }
    });
    
    console.log('✅ Flight search successful');
    console.log(`Found ${response.data.length} flights`);
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Flight search failed:', error.response?.data || error.message);
    return [];
  }
}

async function testGetUserProfile() {
  try {
    console.log('\n👤 Testing get user profile...');
    
    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    console.log('✅ Get user profile successful');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Get user profile failed:', error.response?.data || error.message);
  }
}

async function testGetUserBookings() {
  try {
    console.log('\n🎫 Testing get user bookings...');
    
    const response = await axios.get(`${API_URL}/bookings`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    console.log('✅ Get user bookings successful');
    console.log(`Found ${response.data.length} bookings`);
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Get user bookings failed:', error.response?.data || error.message);
  }
}

async function testCreateBooking(flightId: string) {
  try {
    console.log('\n✈️ Testing create booking...');
    
    const response = await axios.post(
      `${API_URL}/bookings`,
      {
        flight_id: flightId,
        number_of_seats: 1,
        payment_method: 'credit_card'
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Create booking successful');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Create booking failed:', error.response?.data || error.message);
    return null;
  }
}

async function runTests() {
  try {
    console.log('🧪 Starting API tests...');
    
    await signIn();
    await testGetUserProfile();
    const flights = await testFlightSearch();
    
    if (flights && flights.length > 0) {
      const flightId = flights[0].id;
      await testCreateBooking(flightId);
    }
    
    await testGetUserBookings();
    
    console.log('\n✅ All tests completed');
  } catch (error) {
    console.error('❌ Tests failed:', error);
  } finally {
    rl.close();
  }
}

console.log(`
==========================================================
API TESTING TOOL
==========================================================

This tool will test the flight booking API endpoints.
Make sure your NestJS server is running on ${API_URL}

==========================================================
`);

rl.question('Press Enter to start testing...', () => {
  runTests();
}); 