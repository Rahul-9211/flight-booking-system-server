import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

let supabase: ReturnType<typeof createClient>;

export const getSupabaseClient = (configService: ConfigService) => {
  if (!supabase) {
    supabase = createClient(
      configService.get<string>('SUPABASE_URL')!,
      configService.get<string>('SUPABASE_ANON_KEY')!,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
        },
      }
    );
  }
  return supabase;
}; 