import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { SB_URL } from './supabase'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || SB_URL

function getAdminClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// Lazy singleton — created on first use, not at build time
let _client: SupabaseClient | null = null

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_client) _client = getAdminClient()
    return (_client as any)[prop]
  },
})
