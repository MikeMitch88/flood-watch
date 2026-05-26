import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('  Supabase environment variables not configured');
    console.warn(' Email verification will not work until you add:');
    console.warn('   - VITE_SUPABASE_URL');
    console.warn('   - VITE_SUPABASE_ANON_KEY');
    console.warn('See supabase_setup_guide.md for instructions');
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
    return !!(supabaseUrl && supabaseAnonKey && 
              supabaseUrl !== 'https://placeholder.supabase.co' && 
              supabaseAnonKey !== 'placeholder-key');
};
