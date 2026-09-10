import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase environment variables are missing.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Keep the refresh token on the device so a signed-in user can return via
    // the app lock instead of entering a password on every launch.
    persistSession: true,
    autoRefreshToken: true,
  },
});
