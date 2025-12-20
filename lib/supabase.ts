import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 1. Client Standar (Untuk publik/frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 2. Client Admin (KHUSUS untuk Server Action / API Route)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)