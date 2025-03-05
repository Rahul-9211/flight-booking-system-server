import { Controller, Get, Post, Param, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { Payment } from '../types/database.types';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('payments')
@UseGuards(SupabaseAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  async getUserPayments(@Request() req): Promise<Payment[]> {
    console.log(`Getting payments for user: ${req.user.id}`);
    try {
      return await this.paymentService.getPaymentsByUserId(req.user.id);
    } catch (error) {
      console.error('Error getting user payments:', error);
      throw new HttpException(
        error.message || 'Failed to get payments',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('booking/:bookingId')
  async getPaymentByBookingId(@Param('bookingId') bookingId: string): Promise<Payment> {
    console.log(`Getting payment for booking: ${bookingId}`);
    try {
      return await this.paymentService.getPaymentByBookingId(bookingId);
    } catch (error) {
      console.error('Error getting payment by booking ID:', error);
      throw new HttpException(
        error.message || 'Failed to get payment',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(':paymentId/process')
  async processPayment(@Param('paymentId') paymentId: string): Promise<Payment> {
    console.log(`Processing payment: ${paymentId}`);
    try {
      return await this.paymentService.processPayment(paymentId);
    } catch (error) {
      console.error('Error processing payment:', error);
      throw new HttpException(
        error.message || 'Failed to process payment',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(':paymentId/refund')
  async refundPayment(@Param('paymentId') paymentId: string): Promise<Payment> {
    console.log(`Refunding payment: ${paymentId}`);
    try {
      return await this.paymentService.refundPayment(paymentId);
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw new HttpException(
        error.message || 'Failed to refund payment',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 