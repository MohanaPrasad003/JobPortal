import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Use Vite's import.meta.env instead of process.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'set' : 'missing',
    key: supabaseAnonKey ? 'set' : 'missing'
  });
  throw new Error('Missing required Supabase configuration');
}

// Validate URL before creating client
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(`Invalid Supabase URL: ${supabaseUrl}`);
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  // Add realtime config
  realtime: {
    enabled: true,
    params: {
      eventsPerSecond: 10
    }
  }
});

// Add error handling for failed requests
supabase.handleError = (error: any) => {
  console.error('Supabase error:', error);
  if (error.code === 'PGRST204') {
    throw new Error('Database schema mismatch. Please check your table structure.');
  }
  throw error;
};

// Add development logging
if (import.meta.env.DEV) {
  // Log all database queries
  supabase.channel('custom-all-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'jobs'
      },
      (payload) => {
        console.log('Change received!', payload);
      }
    )
    .subscribe((status) => {
      console.log('Subscription status:', status);
    });
}

// Add connection status logging
supabase.channel('system')
  .subscribe((status) => {
    console.log('Supabase connection status:', status);
  });