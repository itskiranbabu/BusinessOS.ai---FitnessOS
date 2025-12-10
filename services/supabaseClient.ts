import { createClient } from '@supabase/supabase-js';

// Access environment variables safely via the injected process.env polyfill
// Prioritize VITE_ prefix, fallback to NEXT_PUBLIC_ for backward compatibility
const supabaseUrl = 
  process.env.VITE_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.SUPABASE_URL;

const supabaseAnonKey = 
  process.env.VITE_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.SUPABASE_ANON_KEY;

// Create the client only if keys are present
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const isSupabaseConfigured = () => {
    const hasConfig = !!supabase;
    if (!hasConfig) {
        console.warn(
          "Supabase is not configured. Missing environment variables.",
          "\nExpected: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY",
          "\nReceived URL:", supabaseUrl ? "✓" : "✗",
          "\nReceived Key:", supabaseAnonKey ? "✓" : "✗"
        );
    }
    return hasConfig;
};