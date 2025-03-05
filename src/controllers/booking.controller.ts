import { Controller, Get, Post, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
import { BookingService } from '../services/booking.service';
import { Booking, BookingWithDetails, CreateBookingDTO } from '../types/database.types';
import { AuthGuard } from '@nestjs/passport';

@Controller('bookings')
@UseGuards(AuthGuard('jwt'))
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  async createBooking(
    @Request() req,
    @Body() createBookingDto: CreateBookingDTO
  ): Promise<Booking> {
    return this.bookingService.createBooking(req.user.id, createBookingDto);
  }

  @Get()
  async getUserBookings(@Request() req): Promise<BookingWithDetails[]> {
    return this.bookingService.getUserBookings(req.user.id);
  }

  @Get(':id')
  async getBookingById(@Param('id') id: string): Promise<BookingWithDetails> {
    return this.bookingService.getBookingById(id);
  }

  @Put(':id/cancel')
  async cancelBooking(@Param('id') id: string): Promise<void> {
    return this.bookingService.cancelBooking(id);
  }

  @Put(':id/confirm')
  async confirmBooking(@Param('id') id: string): Promise<void> {
    return this.bookingService.confirmBooking(id);
  }
} 