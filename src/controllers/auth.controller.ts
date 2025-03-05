import { Controller, Post, Body, Get, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(
    @Body() body: { email: string; password: string; full_name?: string; phone_number?: string }
  ) {
    try {
      return await this.authService.signUp(body.email, body.password, {
        full_name: body.full_name,
        phone_number: body.phone_number,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create user',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('signin')
  async signIn(@Body() body: { email: string; password: string }) {
    try {
      return await this.authService.signIn(body.email, body.password);
    } catch (error) {
      throw new HttpException(
        'Invalid credentials',
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Request() req) {
    try {
      return await this.authService.getProfile(req.user.id);
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve profile',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 