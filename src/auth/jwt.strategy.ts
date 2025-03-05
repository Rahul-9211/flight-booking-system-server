import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // For Supabase tokens, we don't need to verify them with a secret
      // They're already verified by Supabase
      secretOrKey: 'supabase-jwt', // Dummy secret, not actually used for verification
    });
  }

  async validate(payload: any) {
    // Supabase JWT payload has 'sub' as the user ID
    return { 
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };
  }
} 