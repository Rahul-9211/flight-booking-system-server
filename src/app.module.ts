import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FlightController } from './controllers/flight.controller';
import { BookingController } from './controllers/booking.controller';
import { AuthController } from './controllers/auth.controller';
import { FlightService } from './services/flight.service';
import { BookingService } from './services/booking.service';
import { AuthService } from './services/auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [FlightController, BookingController, AuthController],
  providers: [FlightService, BookingService, AuthService],
})
export class AppModule {}
