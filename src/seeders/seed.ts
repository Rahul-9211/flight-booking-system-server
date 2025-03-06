import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';

dotenv.config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables. Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
}

// Create admin client with service_role key to bypass RLS
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  }
);

async function checkTablesExist() {
  try {
    // Check if flights table exists
    const { data, error } = await supabase
      .from('flights')
      .select('id')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log(`
==========================================================
ERROR: Tables do not exist. Please run the SQL schema first
==========================================================

1. Run: npm run init-db
2. Follow the instructions to execute the schema in Supabase SQL Editor
3. Then run: npm run seed

==========================================================
`);
      process.exit(1);
    }
    
    return true;
  } catch (error) {
    console.error('Error checking tables:', error);
    return false;
  }
}

async function clearExistingData() {
  console.log('🧹 Clearing existing data...');
  
  try {
    // Delete all records using a simpler approach
    const { error: paymentsError } = await supabase.from('payments').delete().gte('created_at', '2000-01-01');
    if (paymentsError) throw paymentsError;

    const { error: bookingsError } = await supabase.from('bookings').delete().gte('created_at', '2000-01-01');
    if (bookingsError) throw bookingsError;

    const { error: flightsError } = await supabase.from('flights').delete().gte('created_at', '2000-01-01');
    if (flightsError) throw flightsError;

    console.log('✅ Existing data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}

async function seedFlights() {
  console.log('🛫 Seeding flights...');
  
  // Helper function to generate a date in the future with more readable formatting
  const futureDate = (days, hours = 0, minutes = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(date.getHours() + hours);
    date.setMinutes(date.getMinutes() + minutes);
    
    // Log the created date for visibility during seeding
    const readableDate = date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return {
      iso: date.toISOString(),
      readable: readableDate
    };
  };
  
  // Get current date components for more readable logging
  const today = new Date();
  const currentMonth = today.toLocaleString('en-US', { month: 'long' });
  const currentYear = today.getFullYear();
  
  console.log(`🗓️ Creating flights for upcoming dates (current: ${currentMonth} ${currentYear})`);
  
  const flights = [
    // Today's flights
    {
      flight_number: 'TD101',
      airline: 'SkyWings',
      origin: 'JFK',
      destination: 'BOS',
      departure_time: futureDate(0, 3).iso, // Today, 3 hours from now
      arrival_time: futureDate(0, 4, 15).iso, // 1h15m flight
      price: 149.99,
      total_seats: 120,
      available_seats: 35,
      status: 'scheduled'
    },
    {
      flight_number: 'TD102',
      airline: 'SkyWings',
      origin: 'BOS',
      destination: 'JFK',
      departure_time: futureDate(0, 6).iso, // Today, 6 hours from now
      arrival_time: futureDate(0, 7, 15).iso, // 1h15m flight
      price: 159.99,
      total_seats: 120,
      available_seats: 42,
      status: 'scheduled'
    },
    
    // Tomorrow's flights
    {
      flight_number: 'TM201',
      airline: 'OceanAir',
      origin: 'LAX',
      destination: 'SFO',
      departure_time: futureDate(1, 8).iso, // Tomorrow morning
      arrival_time: futureDate(1, 9, 30).iso, // 1h30m flight
      price: 179.99,
      total_seats: 150,
      available_seats: 98,
      status: 'scheduled'
    },
    {
      flight_number: 'TM202',
      airline: 'OceanAir',
      origin: 'SFO',
      destination: 'LAX',
      departure_time: futureDate(1, 14).iso, // Tomorrow afternoon
      arrival_time: futureDate(1, 15, 30).iso, // 1h30m flight
      price: 189.99,
      total_seats: 150,
      available_seats: 112,
      status: 'scheduled'
    },
    {
      flight_number: 'TM203',
      airline: 'MountainJet',
      origin: 'DEN',
      destination: 'PHX',
      departure_time: futureDate(1, 10).iso, // Tomorrow morning
      arrival_time: futureDate(1, 11, 45).iso, // 1h45m flight
      price: 199.99,
      total_seats: 130,
      available_seats: 130,
      status: 'scheduled'
    },
    
    // This weekend (next 3-4 days)
    {
      flight_number: 'WK301',
      airline: 'SkyWings',
      origin: 'NYC',
      destination: 'MIA',
      departure_time: futureDate(3, 9).iso, // Weekend morning
      arrival_time: futureDate(3, 12).iso, // 3h flight
      price: 249.99,
      total_seats: 180,
      available_seats: 120,
      status: 'scheduled'
    },
    {
      flight_number: 'WK302',
      airline: 'SkyWings',
      origin: 'MIA',
      destination: 'NYC',
      departure_time: futureDate(4, 16).iso, // Weekend evening
      arrival_time: futureDate(4, 19).iso, // 3h flight
      price: 269.99,
      total_seats: 180,
      available_seats: 145,
      status: 'scheduled'
    },
    {
      flight_number: 'WK303',
      airline: 'EconoFly',
      origin: 'ATL',
      destination: 'ORD',
      departure_time: futureDate(3, 11).iso, // Weekend
      arrival_time: futureDate(3, 12, 30).iso, // 1h30m flight
      price: 129.99,
      total_seats: 160,
      available_seats: 160,
      status: 'scheduled'
    },
    {
      flight_number: 'WK304',
      airline: 'EconoFly',
      origin: 'ORD',
      destination: 'ATL',
      departure_time: futureDate(4, 15).iso, // Weekend
      arrival_time: futureDate(4, 16, 30).iso, // 1h30m flight
      price: 139.99,
      total_seats: 160,
      available_seats: 160,
      status: 'scheduled'
    },
    
    // Next week (5-7 days from now)
    {
      flight_number: 'NW401',
      airline: 'GlobalAir',
      origin: 'JFK',
      destination: 'LHR', // London
      departure_time: futureDate(5, 20).iso, // Next week evening
      arrival_time: futureDate(6, 4).iso, // 8h flight
      price: 799.99,
      total_seats: 300,
      available_seats: 245,
      status: 'scheduled'
    },
    {
      flight_number: 'NW402',
      airline: 'GlobalAir',
      origin: 'LHR',
      destination: 'JFK',
      departure_time: futureDate(7, 10).iso, // Next week morning
      arrival_time: futureDate(7, 18).iso, // 8h flight
      price: 849.99,
      total_seats: 300,
      available_seats: 268,
      status: 'scheduled'
    },
    {
      flight_number: 'NW403',
      airline: 'LuxuryJet',
      origin: 'SFO',
      destination: 'JFK',
      departure_time: futureDate(6, 9).iso, // Next week
      arrival_time: futureDate(6, 17).iso, // 8h flight
      price: 899.99,
      total_seats: 120,
      available_seats: 85,
      status: 'scheduled'
    },
    
    // Next month (15-30 days from now)
    {
      flight_number: 'NM501',
      airline: 'AsiaConnect',
      origin: 'LAX',
      destination: 'NRT', // Tokyo
      departure_time: futureDate(15, 23).iso, // Next month
      arrival_time: futureDate(16, 10).iso, // 11h flight
      price: 1099.99,
      total_seats: 280,
      available_seats: 280,
      status: 'scheduled'
    },
    {
      flight_number: 'NM502',
      airline: 'AsiaConnect',
      origin: 'NRT',
      destination: 'LAX',
      departure_time: futureDate(20, 12).iso, // Next month
      arrival_time: futureDate(20, 23).iso, // 11h flight
      price: 1149.99,
      total_seats: 280,
      available_seats: 280,
      status: 'scheduled'
    },
    {
      flight_number: 'NM503',
      airline: 'OceanAir',
      origin: 'MIA',
      destination: 'CUN', // Cancun
      departure_time: futureDate(25, 8).iso, // Next month
      arrival_time: futureDate(25, 9, 30).iso, // 1h30m flight
      price: 349.99,
      total_seats: 150,
      available_seats: 150,
      status: 'scheduled'
    },
    
    // Special status flights
    {
      flight_number: 'SS601',
      airline: 'SkyWings',
      origin: 'ORD', // Chicago
      destination: 'DFW', // Dallas
      departure_time: futureDate(1, 13).iso, // Tomorrow
      arrival_time: futureDate(1, 15).iso, // 2h flight
      price: 249.99,
      total_seats: 180,
      available_seats: 10, // Almost full
      status: 'scheduled'
    },
    {
      flight_number: 'SS602',
      airline: 'SkyWings',
      origin: 'DFW',
      destination: 'ORD',
      departure_time: futureDate(1, 18).iso, // Tomorrow
      arrival_time: futureDate(1, 20).iso, // 2h flight
      price: 259.99,
      total_seats: 180,
      available_seats: 0, // Fully booked
      status: 'scheduled'
    },
    {
      flight_number: 'SS603',
      airline: 'OceanAir',
      origin: 'ATL', // Atlanta
      destination: 'MCO', // Orlando
      departure_time: futureDate(2, 8).iso, // Day after tomorrow
      arrival_time: futureDate(2, 9).iso, // 1h flight
      price: 179.99,
      total_seats: 150,
      available_seats: 150,
      status: 'delayed'
    },
    {
      flight_number: 'SS604',
      airline: 'MountainJet',
      origin: 'PHX', // Phoenix
      destination: 'SEA', // Seattle
      departure_time: futureDate(0, 10).iso, // Today
      arrival_time: futureDate(0, 13).iso, // 3h flight
      price: 229.99,
      total_seats: 140,
      available_seats: 140,
      status: 'cancelled'
    }
  ];

  try {
    // Log some sample flights for visibility
    console.log(`📋 Sample upcoming flights:`);
    console.log(`  • Today: ${flights[0].flight_number} (${flights[0].origin} → ${flights[0].destination})`);
    console.log(`  • Tomorrow: ${flights[3].flight_number} (${flights[3].origin} → ${flights[3].destination})`);
    console.log(`  • Weekend: ${flights[6].flight_number} (${flights[6].origin} → ${flights[6].destination})`);
    console.log(`  • Next week: ${flights[10].flight_number} (${flights[10].origin} → ${flights[10].destination})`);
    console.log(`  • Next month: ${flights[14].flight_number} (${flights[14].origin} → ${flights[14].destination})`);
    
    const { data, error } = await supabase.from('flights').insert(flights).select();
    if (error) throw error;
    
    console.log(`✅ Seeded ${data.length} flights successfully`);
    return data;
  } catch (error) {
    console.error('Error seeding flights:', error);
    throw error;
  }
}

async function seedTestUser() {
  console.log('👤 Creating test user...');
  
  // Use a real email format that will pass validation
  const testEmail = 'test.user@gmail.com';
  const testPassword = 'Test123456!';
  
  try {
    // First check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', testEmail)
      .single();

    if (existingUser) {
      console.log('ℹ️ Test user already exists, skipping creation');
      return existingUser.id;
    }

    // Try to create user directly in the users table first with a generated UUID
    const userId = crypto.randomUUID();
    
    try {
      const { error: directInsertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: testEmail,
          full_name: 'Test User',
          phone_number: '+1234567890',
          role: 'user'
        });
      
      if (!directInsertError) {
        console.log('✅ Test user created directly in database');
        return userId;
      }
    } catch (directError) {
      console.log('Direct insert failed, trying auth signup...');
    }

    // Fallback to auth signup if direct insert fails
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
          phone_number: '+1234567890'
        }
      }
    });

    if (signUpError) {
      console.error('Auth signup error:', signUpError);
      throw signUpError;
    }
    
    if (!authData.user) {
      throw new Error('No user data returned from auth signup');
    }

    // Wait a moment for the auth user to be created
    console.log('Waiting for auth user to be created...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create user profile
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      email: testEmail,
      full_name: 'Test User',
      phone_number: '+1234567890',
      role: 'user'
    });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      
      // If the error is about the user already existing, try to get the user
      if (profileError.message && profileError.message.includes('duplicate key')) {
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('email', testEmail)
          .single();
          
        if (user) {
          console.log('✅ Found existing user profile');
          return user.id;
        }
      }
      
      throw profileError;
    }

    console.log('✅ Test user created successfully');
    return authData.user.id;
  } catch (error) {
    console.error('Error in seedTestUser:', error);
    throw error;
  }
}

async function seedTestBookings(userId: string, flights: any[]) {
  console.log('🎫 Creating test booking...');
  
  try {
    const flight = flights[0];
    if (!flight) {
      throw new Error('No flights available for booking');
    }

    const booking = {
      user_id: userId,
      flight_id: flight.id,
      booking_reference: `BK${Date.now()}`,
      number_of_seats: 2,
      total_amount: flight.price * 2,
      status: 'confirmed'
    };

    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single();

    if (bookingError || !bookingData) {
      throw bookingError || new Error('No booking data returned');
    }

    const payment = {
      booking_id: bookingData.id,
      amount: bookingData.total_amount,
      payment_method: 'credit_card',
      transaction_id: `TX${Date.now()}`,
      status: 'completed'
    };

    const { error: paymentError } = await supabase
      .from('payments')
      .insert(payment);

    if (paymentError) throw paymentError;

    console.log('✅ Test booking and payment created successfully');
  } catch (error) {
    console.error('Error in seedTestBookings:', error);
    throw error;
  }
}

async function seedAll() {
  try {
    console.log('🌱 Starting seeding...');
    
    // Check if tables exist
    const tablesExist = await checkTablesExist();
    if (!tablesExist) {
      console.log('❌ Tables do not exist. Please run init-db script first.');
      process.exit(1);
    }
    
    await clearExistingData();
    const flights = await seedFlights();
    const userId = await seedTestUser();
    if (userId && flights) {
      await seedTestBookings(userId, flights);
    }
    
    console.log('✅ Seeding completed successfully');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedAll(); 