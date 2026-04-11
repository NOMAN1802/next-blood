import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mpkkyoxyrvfvzcnnkhby.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wa2t5b3h5cnZmdnpjbm5raGJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MDExNzYsImV4cCI6MjA5MDk3NzE3Nn0.6h4T91xQi8Kws9w71WpMIlcUneRakDNgyM4FpFFkfOQ';

// PASTE YOUR SERVICE ROLE KEY HERE (Supabase → Project Settings → API → service_role)
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wa2t5b3h5cnZmdnpjbm5raGJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQwMTE3NiwiZXhwIjoyMDkwOTc3MTc2fQ.iYQ6dcSqZ9RgW1YK4l960ZlFijg9rUfrK9p-Q7SMb4s';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Admin client — uses service role key, bypasses RLS. Used only in admin dashboard.
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export default customSupabaseClient;

export {
  customSupabaseClient,
  customSupabaseClient as supabase,
  supabaseAdmin,
};
