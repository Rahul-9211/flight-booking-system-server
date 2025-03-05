import { Controller, Get, Post, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
import { BookingService } from '../services/booking.service';
import { Booking, BookingWithDetails, CreateBookingDTO } from '../types/database.types';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('bookings')
@UseGuards(SupabaseAuthGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  async createBooking(
    @Request() req,
    @Body() createBookingDto: CreateBookingDTO
  ): Promise<Booking> {
    console.log('Creating booking for user:', req.user.id);
    return this.bookingService.createBooking(req.user.id, createBookingDto);
  }

  @Get()
  async getUserBookings(@Request() req): Promise<BookingWithDetails[]> {
    console.log('Getting bookings for user:', req.user.id);
    return this.bookingService.getUserBookings(req.user.id);
  }

  @Get(':id')
  async getBookingById(@Param('id') id: string): Promise<BookingWithDetails> {
    console.log('Getting booking details for booking:', id);
    return this.bookingService.getBookingById(id);
  }

  @Put(':id/cancel')
  async cancelBooking(@Param('id') id: string): Promise<void> {
    console.log('Cancelling booking:', id);
    return this.bookingService.cancelBooking(id);
  }

  @Put(':id/confirm')
  async confirmBooking(@Param('id') id: string): Promise<void> {
    console.log('Confirming booking:', id);
    return this.bookingService.confirmBooking(id);
  }
} 