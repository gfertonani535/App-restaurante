import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const isConfigured =
  Boolean(supabaseUrl?.startsWith('https://')) &&
  Boolean(supabasePublishableKey?.length > 20);

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null;

export { isConfigured };