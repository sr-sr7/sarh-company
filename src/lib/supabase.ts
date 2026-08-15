// ── Supabase config — single source of truth ──────────────────
export const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
export const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const SB_HEADERS = { 'apikey': SB_KEY, 'authorization': `Bearer ${SB_KEY}` }

export async function sbFetch(path: string, opts: RequestInit = {}) {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
      headers: SB_HEADERS,
      cache: 'no-store',
      ...opts,
    })
    return r.ok ? r.json() : []
  } catch {
    return []
  }
}

// ── Types ──────────────────────────────────────────────────────
export type Property = {
  id: string
  created_at: string
  title: string
  description: string | null
  type: string
  operation: string
  status: string
  city: string
  district: string | null
  price: number
  price_unit: string
  area: number | null
  bedrooms: number
  bathrooms: number
  has_pool: boolean
  has_parking: boolean
  has_garden: boolean
  images: string[]
  main_image: string | null
  is_featured: boolean
  is_new: boolean
  whatsapp: string
  video_url: string | null
  listing_number: number | null
  map_url: string | null
  maid_rooms: number | null
  kitchens: number | null
  has_annex: boolean
  bid_price: number | null
  north_len: number | null
  south_len: number | null
  east_len: number | null
  west_len: number | null
  built_area: number | null
  facade: string | null
  street_width: number | null
  property_age: string | null
  deed_type: string | null
  bank_finance: boolean
  price_per_meter: number | null
  lat: number | null
  lng: number | null
}

export type Inquiry = {
  id: string
  created_at: string
  property_id: string | null
  client_name: string
  client_phone: string
  client_email: string | null
  message: string | null
  type: string
  status: string
}
