import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Server-side Supabase client with service role key
// This bypasses RLS - only use on the backend, NEVER expose to client
export const supabase = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export const testSupabaseConnection = async (): Promise<void> => {
  try {
    const { error } = await supabase.from('profiles').select('count').limit(1);
    if (error && error.code !== 'PGRST116') {
      // PGRST116 = table doesn't exist yet (that's fine in Phase 1 before schema is run)
      console.warn('⚠️  Supabase connection warning:', error.message);
    } else {
      console.log('✅ Supabase connected');
    }
  } catch (err) {
    console.warn('⚠️  Could not verify Supabase connection:', err);
  }
};
