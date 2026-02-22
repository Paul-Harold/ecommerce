import { createClient } from '@supabase/supabase-js';

// Pulling your secret keys from the .env.local file you made earlier
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create and export the database client so any page can use it
export const supabase = createClient(supabaseUrl, supabaseKey);