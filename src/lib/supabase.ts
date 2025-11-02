import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Export types that will be used in your components
export type { PostgrestError } from '@supabase/supabase-js';
export type { BlogPost } from '../types/supabase';
