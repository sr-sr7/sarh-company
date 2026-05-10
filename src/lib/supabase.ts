import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

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
  main_image: string | null
  images: string[] | null
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

export const SAMPLE_PROPERTIES: Property[] = [
  { id: '1', created_at: new Date().toISOString(), title: 'فيلا فاخرة بحي النزهة', description: 'فيلا حديثة بتصميم نجدي عصري', type: 'فيلا', operation: 'للبيع', status: 'active', city: 'بريدة', district: 'حي النزهة', price: 1250000, price_unit: 'ريال', area: 400, bedrooms: 5, bathrooms: 4, has_pool: true, has_parking: true, has_garden: true, main_image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80', images: null, is_featured: true, is_new: true, whatsapp: '966500000000' },
  { id: '2', created_at: new Date().toISOString(), title: 'شقة عصرية بحي الصفراء', description: 'شقة بإطلالة مفتوحة', type: 'شقة', operation: 'للإيجار', status: 'active', city: 'عنيزة', district: 'الصفراء', price: 2500, price_unit: 'ريال / شهر', area: 145, bedrooms: 3, bathrooms: 2, has_pool: false, has_parking: true, has_garden: false, main_image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80', images: null, is_featured: false, is_new: true, whatsapp: '966500000000' },
  { id: '3', created_at: new Date().toISOString(), title: 'أرض استثمارية على شارعين', description: 'أرض بموقع استراتيجي', type: 'أرض', operation: 'للبيع', status: 'active', city: 'بريدة', district: 'حي الإسكان', price: 850000, price_unit: 'ريال', area: 625, bedrooms: 0, bathrooms: 0, has_pool: false, has_parking: false, has_garden: false, main_image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80', images: null, is_featured: true, is_new: false, whatsapp: '966500000000' },
  { id: '4', created_at: new Date().toISOString(), title: 'استراحة فاخرة بأطراف بريدة', description: 'استراحة بمسبح وحديقة', type: 'استراحة', operation: 'إيجار يومي', status: 'active', city: 'بريدة', district: 'طريق المدينة', price: 1500, price_unit: 'ريال / يوم', area: 800, bedrooms: 4, bathrooms: 3, has_pool: true, has_parking: true, has_garden: true, main_image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80', images: null, is_featured: true, is_new: false, whatsapp: '966500000000' },
  { id: '5', created_at: new Date().toISOString(), title: 'دبلكس بتصميم معاصر', description: 'دبلكس فاخر بمدخلين', type: 'فيلا', operation: 'للبيع', status: 'active', city: 'الرس', district: 'حي الفيصلية', price: 980000, price_unit: 'ريال', area: 320, bedrooms: 4, bathrooms: 3, has_pool: false, has_parking: true, has_garden: true, main_image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80', images: null, is_featured: false, is_new: true, whatsapp: '966500000000' },
  { id: '6', created_at: new Date().toISOString(), title: 'محل تجاري بموقع مميز', description: 'محل على شارع تجاري نشط', type: 'محل تجاري', operation: 'للإيجار', status: 'active', city: 'بريدة', district: 'شارع الملك عبدالله', price: 4500, price_unit: 'ريال / شهر', area: 80, bedrooms: 0, bathrooms: 1, has_pool: false, has_parking: true, has_garden: false, main_image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80', images: null, is_featured: false, is_new: false, whatsapp: '966500000000' },
]
