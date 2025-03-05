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
  
  const flights = [
    {
      flight_number: 'FL001',
      airline: 'SkyWings',
      origin: 'NYC',
      destination: 'LAX',
      departure_time: new Date('2024-03-20T10:00:00Z').toISOString(),
      arrival_time: new Date('2024-03-20T13:00:00Z').toISOString(),
      price: 299.99,
      total_seats: 180,
      available_seats: 180,
      status: 'scheduled'
    },
    {
      flight_number: 'FL002',
      airline: 'SkyWings',
      origin: 'LAX',
      destination: 'NYC',
      departure_time: new Date('2024-03-21T14:00:00Z').toISOString(),
      arrival_time: new Date('2024-03-21T17:00:00Z').toISOString(),
      price: 349.99,
      total_seats: 180,
      available_seats: 180,
      status: 'scheduled'
    },
    {
      flight_number: 'FL003',
      airline: 'OceanAir',
      origin: 'SFO',
      destination: 'MIA',
      departure_time: new Date('2024-03-22T09:00:00Z').toISOString(),
      arrival_time: new Date('2024-03-22T17:30:00Z').toISOString(),
      price: 499.99,
      total_seats: 220,
      available_seats: 220,
      status: 'scheduled'
    },
    {
      flight_number: 'FL004',
      airline: 'MountainJet',
      origin: 'DEN',
      destination: 'SEA',
      departure_time: new Date('2024-03-23T11:00:00Z').toISOString(),
      arrival_time: new Date('2024-03-23T13:30:00Z').toISOString(),
      price: 199.99,
      total_seats: 150,
      available_seats: 150,
      status: 'scheduled'
    }
  ];

  try {
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