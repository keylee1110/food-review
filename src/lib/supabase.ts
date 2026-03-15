import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'

// Use the service role key for API routes to bypass RLS and securely write to the DB.
// DONT expose this key to the frontend.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
