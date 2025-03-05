import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Payment, PaymentStatus } from '../types/database.types';

@Injectable()
export class PaymentService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials in environment variables');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    console.log(`Getting payments for user: ${userId}`);
    
    const { data, error } = await this.supabase
      .from('payments')
      .select(`
        *,
        bookings!inner (
          user_id
        )
      `)
      .eq('bookings.user_id', userId);

    if (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }

    return data.map(item => ({
      ...item,
      booking_id: item.booking_id,
    }));
  }

  async getPaymentByBookingId(bookingId: string): Promise<Payment> {
    console.log(`Getting payment for booking: ${bookingId}`);
    
    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .single();

    if (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }

    return data;
  }

  async updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<Payment> {
    console.log(`Updating payment ${paymentId} status to: ${status}`);
    
    const { data, error } = await this.supabase
      .from('payments')
      .update({ status })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }

    return data;
  }

  async processPayment(paymentId: string): Promise<Payment> {
    console.log(`Processing payment: ${paymentId}`);
    
    // In a real application, this would integrate with a payment gateway
    // For now, we'll simulate a successful payment by updating the status
    
    // Generate a mock transaction ID
    const transactionId = `txn_${Math.random().toString(36).substring(2, 15)}`;
    
    const { data, error } = await this.supabase
      .from('payments')
      .update({ 
        status: 'completed', 
        transaction_id: transactionId,
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) {
      console.error('Error processing payment:', error);
      throw error;
    }

    return data;
  }

  async refundPayment(paymentId: string): Promise<Payment> {
    console.log(`Refunding payment: ${paymentId}`);
    
    // In a real application, this would integrate with a payment gateway
    // For now, we'll simulate a successful refund by updating the status
    
    const { data, error } = await this.supabase
      .from('payments')
      .update({ status: 'refunded' })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) {
      console.error('Error refunding payment:', error);
      throw error;
    }

    return data;
  }
} 