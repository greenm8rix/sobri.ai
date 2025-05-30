import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// These values should be replaced with your actual Supabase project details
// You should use environment variables in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rcpqtgtuuqkkrhzbmksu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjcHF0Z3R1dXFra3JoemJta3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NDczMjUsImV4cCI6MjA2NDAyMzMyNX0.TBiu0kMe-tiMsEUuE9rEVdd3__xyD7ICZaH-rzq0ZRs';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export types for better TypeScript support
export type { User, Session } from '@supabase/supabase-js';