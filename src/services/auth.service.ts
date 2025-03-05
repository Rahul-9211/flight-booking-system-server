import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getSupabaseClient } from '../config/supabase';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

  private get supabase() {
    return getSupabaseClient(this.configService);
  }

  async signUp(email: string, password: string, userData: { full_name?: string; phone_number?: string }) {
    try {
      // Create a service role client to bypass restrictions
      const serviceRoleClient = createClient(
        this.configService.get<string>('SUPABASE_URL')!,
        this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      // First check if the user already exists in the users table
      const { data: existingUser } = await serviceRoleClient
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create the user with auth using service role
      const { data: authData, error: signUpError } = await serviceRoleClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

      if (signUpError) {
        console.error('Auth signup error:', signUpError);
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('No user data returned from auth signup');
      }

      // Create user profile
      const { error: profileError } = await serviceRoleClient
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          full_name: userData.full_name,
          phone_number: userData.phone_number,
          role: 'user'
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        throw profileError;
      }

      return authData;
    } catch (error) {
      console.error('SignUp error:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async getProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }
} 