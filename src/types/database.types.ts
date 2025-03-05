export type UserRole = 'admin' | 'user';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type FlightStatus = 'scheduled' | 'delayed' | 'cancelled' | 'completed';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Flight {
  id: string;
  flight_number: string;
  airline: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  total_seats: number;
  available_seats: number;
  status: FlightStatus;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  flight_id: string;
  booking_reference: string;
  number_of_seats: number;
  total_amount: number;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: string;
  transaction_id?: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface FlightSearchParams {
  origin?: string;
  destination?: string;
  departure_date?: string;
  min_price?: number;
  max_price?: number;
  available_seats?: number;
}

export interface CreateBookingDTO {
  flight_id: string;
  number_of_seats: number;
  payment_method: string;
}

export interface BookingWithDetails extends Booking {
  flight: Flight;
} 