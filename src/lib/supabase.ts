import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export type Property = {
  id: string
  created_at: string
  updated_at?: string
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
  main_image: string | null
  images: string[] | null
  video_url: string | null
  is_featured: boolean
  is_new: boolean
  whatsapp: string
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
