import { Controller, Get, Param, Query, Sse, UseGuards } from '@nestjs/common';
import { FlightService } from '../services/flight.service';
import { Flight, FlightSearchParams } from '../types/database.types';
import { Observable } from 'rxjs';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('flights')
@UseGuards(SupabaseAuthGuard)
export class FlightController {
  constructor(private readonly flightService: FlightService) {}

  @Get()
  async searchFlights(@Query() params: FlightSearchParams): Promise<Flight[]> {
    console.log('Searching flights with params:', params);
    return this.flightService.searchFlights(params);
  }

  @Get(':id')
  async getFlightById(@Param('id') id: string): Promise<Flight> {
    console.log('Getting flight details for flight:', id);
    return this.flightService.getFlightById(id);
  }

  @Sse(':id/status')
  subscribeToFlightStatus(@Param('id') id: string): Observable<MessageEvent> {
    console.log('Subscribing to flight status updates for flight:', id);
    return new Observable(observer => {
      const unsubscribe = this.flightService.subscribeToFlightUpdates(
        id,
        (flight) => {
          observer.next({ data: flight } as MessageEvent);
        }
      );

      return () => {
        unsubscribe();
      };
    });
  }
} 