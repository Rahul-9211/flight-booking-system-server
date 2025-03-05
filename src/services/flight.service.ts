import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getSupabaseClient } from '../config/supabase';
import { Flight, FlightSearchParams } from '../types/database.types';

@Injectable()
export class FlightService {
  constructor(private configService: ConfigService) {}

  private get supabase() {
    return getSupabaseClient(this.configService);
  }

  async searchFlights(params: FlightSearchParams): Promise<Flight[]> {
    let query = this.supabase
      .from('flights')
      .select('*')
      .eq('status', 'scheduled');

    if (params.origin) {
      query = query.ilike('origin', `%${params.origin}%`);
    }

    if (params.destination) {
      query = query.ilike('destination', `%${params.destination}%`);
    }

    if (params.departure_date) {
      const startDate = new Date(params.departure_date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      query = query.gte('departure_time', startDate.toISOString())
                  .lt('departure_time', endDate.toISOString());
    }

    if (params.min_price !== undefined) {
      query = query.gte('price', params.min_price);
    }

    if (params.max_price !== undefined) {
      query = query.lte('price', params.max_price);
    }

    if (params.available_seats !== undefined) {
      query = query.gte('available_seats', params.available_seats);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data as unknown) as Flight[];
  }

  async getFlightById(id: string): Promise<Flight> {
    const { data, error } = await this.supabase
      .from('flights')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return (data as unknown) as Flight;
  }

  async updateFlightStatus(id: string, status: Flight['status']) {
    const { error } = await this.supabase
      .from('flights')
      .update({ status })
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  // Method to setup SSE for flight status updates
  subscribeToFlightUpdates(flightId: string, onUpdate: (payload: any) => void) {
    const channel = this.supabase
      .channel(`flight_status_${flightId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'flights',
          filter: `id=eq.${flightId}`,
        },
        (payload) => onUpdate(payload.new)
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }
} 