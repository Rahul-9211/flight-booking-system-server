import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getSupabaseClient } from '../config/supabase';
import { Booking, BookingWithDetails, CreateBookingDTO, Payment } from '../types/database.types';
import { FlightService } from './flight.service';

@Injectable()
export class BookingService {
  constructor(
    private configService: ConfigService,
    private flightService: FlightService,
  ) {}

  private get supabase() {
    return getSupabaseClient(this.configService);
  }

  async createBooking(userId: string, dto: CreateBookingDTO): Promise<Booking> {
    const flight = await this.flightService.getFlightById(dto.flight_id);

    if (!flight) {
      throw new NotFoundException('Flight not found');
    }

    if (flight.available_seats < dto.number_of_seats) {
      throw new BadRequestException('Not enough seats available');
    }

    const totalAmount = flight.price * dto.number_of_seats;

    // Start a Supabase transaction
    const { data: booking, error: bookingError } = await this.supabase
      .from('bookings')
      .insert({
        user_id: userId,
        flight_id: dto.flight_id,
        booking_reference: `BK${Date.now()}`,
        number_of_seats: dto.number_of_seats,
        total_amount: totalAmount,
        status: 'pending',
      })
      .select()
      .single();

    if (bookingError) {
      throw bookingError;
    }

    const typedBooking = (booking as unknown) as Booking;

    // Create payment record
    const { error: paymentError } = await this.supabase
      .from('payments')
      .insert({
        booking_id: typedBooking.id,
        amount: totalAmount,
        payment_method: dto.payment_method,
        status: 'pending',
      });

    if (paymentError) {
      // If payment creation fails, cancel the booking
      await this.cancelBooking(typedBooking.id);
      throw paymentError;
    }

    return typedBooking;
  }

  async getUserBookings(userId: string): Promise<BookingWithDetails[]> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select('*, flight:flight_id(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data as unknown) as BookingWithDetails[];
  }

  async getBookingById(id: string): Promise<BookingWithDetails> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select('*, flight:flight_id(*)')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return (data as unknown) as BookingWithDetails;
  }

  async cancelBooking(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  async confirmBooking(id: string): Promise<void> {
    const booking = await this.getBookingById(id);
    
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const { error } = await this.supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', id);

    if (error) {
      throw error;
    }
  }
} 