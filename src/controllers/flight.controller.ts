import { Controller, Get, Param, Query, Sse } from '@nestjs/common';
import { FlightService } from '../services/flight.service';
import { Flight, FlightSearchParams } from '../types/database.types';
import { Observable } from 'rxjs';

@Controller('flights')
export class FlightController {
  constructor(private readonly flightService: FlightService) {}

  @Get()
  async searchFlights(@Query() params: FlightSearchParams): Promise<Flight[]> {
    return this.flightService.searchFlights(params);
  }

  @Get(':id')
  async getFlightById(@Param('id') id: string): Promise<Flight> {
    return this.flightService.getFlightById(id);
  }

  @Sse(':id/status')
  subscribeToFlightStatus(@Param('id') id: string): Observable<MessageEvent> {
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