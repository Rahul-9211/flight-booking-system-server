import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FlightController } from './controllers/flight.controller';
import { BookingController } from './controllers/booking.controller';
import { AuthController } from './controllers/auth.controller';
import { FlightService } from './services/flight.service';
import { BookingService } from './services/booking.service';
import { AuthService } from './services/auth.service';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthModule,
  ],
  controllers: [FlightController, BookingController, AuthController],
  providers: [FlightService, BookingService, AuthService],
})
export class AppModule {}
