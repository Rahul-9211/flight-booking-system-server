# Flight Booking System API

A complete backend API for a flight booking system built with NestJS and Supabase. This system allows users to search for flights, make bookings, and process payments.

## Features

- 🔐 **User Authentication**: Secure signup and signin using Supabase Auth
- ✈️ **Flight Management**: Search flights by origin, destination, date, and price
- 🎫 **Booking System**: Create, view, confirm, and cancel bookings
- 💳 **Payment Processing**: Handle payment transactions with different statuses
- 🔄 **Real-time Updates**: Subscribe to flight status changes using Server-Sent Events
- 🛡️ **Row-Level Security**: Database security using Supabase RLS policies

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd flight-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. Get your Supabase URL and API keys from the project dashboard
3. Create a `.env` file in the root directory with the following variables:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NODE_ENV=development
```

### 4. Initialize the database

Run the following command to create all necessary tables, functions, and policies in your Supabase database:

```bash
npm run init-db
```

### 5. Seed the database with test data

```bash
npm run seed
```

This will create:
- A test user (email: test.user@gmail.com, password: Test123456!)
- Sample flights between various cities
- Sample bookings and payments

## Running the Application

Start the development server:

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`.

## API Endpoints

### Authentication

- `POST /auth/signup` - Register a new user
- `POST /auth/signin` - Sign in and get JWT token
- `GET /auth/profile` - Get the current user's profile

### Flights

- `GET /flights` - Get all flights or search with filters
- `GET /flights/:id` - Get details of a specific flight
- `GET /flights/:id/status` - Subscribe to flight status updates (SSE)

### Bookings

- `POST /bookings` - Create a new booking
- `GET /bookings` - Get all bookings for the current user
- `GET /bookings/:id` - Get details of a specific booking
- `PUT /bookings/:id/cancel` - Cancel a booking
- `PUT /bookings/:id/confirm` - Confirm a booking

### Payments

- `GET /payments` - Get all payments for the current user
- `GET /payments/booking/:bookingId` - Get payment details for a specific booking
- `POST /payments/:paymentId/process` - Process a pending payment
- `POST /payments/:paymentId/refund` - Refund a completed payment

## Testing the API

### Using Postman

1. Import the Postman collection from `flight-booking-api.postman_collection.json`
2. The collection includes a pre-configured JWT token for testing
3. Update the `flight_id`, `booking_id`, and `payment_id` variables as needed

### Using the Test Script

Run the automated test script to test all API endpoints:

```bash
bash test-all-apis.sh
```

## Database Schema

### Tables

- **users**: User profiles with roles
- **flights**: Flight details including origin, destination, and availability
- **bookings**: Booking records linking users and flights
- **payments**: Payment transactions for bookings

### Relationships

- A user can have multiple bookings
- A flight can have multiple bookings
- Each booking has one payment

## Authentication Flow

1. User signs up with email and password
2. Supabase creates an auth user and a profile in the users table
3. User signs in to get a JWT token
4. The token is used in the Authorization header for protected endpoints
5. The SupabaseAuthGuard validates the token for each request

## Development

### Adding New Features

1. Create or modify service files in `src/services/`
2. Create or modify controller files in `src/controllers/`
3. Update the app module in `src/app.module.ts`

### Database Migrations

To modify the database schema:

1. Update the SQL script in `src/database/schema.sql`
2. Run the initialization script: `npm run init-db`

## Troubleshooting

### Common Issues

- **Authentication Errors**: Make sure your JWT token is valid and included in the Authorization header
- **Database Connection Issues**: Check your Supabase credentials in the .env file
- **Missing Tables**: Run the initialization script with `npm run init-db`

### Logs

Check the server logs for detailed error messages and debugging information.

## License

[MIT](LICENSE)
