import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Updated service key for new project - you must replace this with your actual service role key
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZXRpcGhzYnRmYWhxbnBoZ2JlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDc5NDc5NSwiZXhwIjoyMDU2MzcwNzk1fQ.Z7cUIZ9INpa1t81uOBTq-6mV3qPegPBoybmM1r4AVXY';

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a regular client for authenticated user operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Create an admin client with service role permissions that bypasses RLS
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        // Adding these headers to ensure the service role is properly recognized
        'X-Client-Info': 'admin-dashboard',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    }
  }
);

// Helper function to log detailed errors from Supabase
export const logSupabaseError = (operation: string, error: any) => {
  console.error(`Supabase ${operation} error:`, error);
  
  // Log additional details if available
  if (error.message) console.error(`Error message: ${error.message}`);
  if (error.details) console.error('Error details:', error.details);
  if (error.hint) console.error(`Error hint: ${error.hint}`);
  if (error.code) console.error(`Error code: ${error.code}`);
  
  return error;
};