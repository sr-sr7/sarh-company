import { createClient } from '@supabase/supabase-js'
import { SB_URL, SB_KEY } from './supabase'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || SB_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SB_KEY

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})
