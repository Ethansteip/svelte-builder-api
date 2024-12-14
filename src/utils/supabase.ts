import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  config();
}

console.log('supabase', process.env.SUPABASE_URL);
console.log('supabase service role key', process.env.SUPABASE_SERVICE_ROLE_KEY);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
