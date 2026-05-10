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
  {
    id: '1',
    created_at: '2026-05-03T09:00:00Z',
    title: 'فيلا سكنية واسعة خلف حي الرفيعة',
    description: 'فيلا سكنية واسعة بواجهة شمالية على شارع 15م. البناء على الكود السعودي مع تأمين 10 سنوات. تقبل جميع البنوك.',
    type: 'فيلا',
    operation: 'للبيع',
    status: 'active',
    city: 'بريدة',
    district: 'خلف حي الرفيعة شرق بريدة',
    price: 880000,
    price_unit: 'ريال',
    area: 365,
    bedrooms: 5,
    bathrooms: 4,
    has_pool: false,
    has_parking: true,
    has_garden: false,
    main_image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80',
    images: null,
    is_featured: true,
    is_new: true,
    whatsapp: '966500000000',
  },
  {
    id: '2',
    created_at: '2026-04-29T05:07:00Z',
    title: 'دور علوي نظام دبلكس تشطيب فاخر',
    description: 'دور علوي بتشطيب فاخر — واجهة شرقية غربية على شارع 15م. 4 غرف نوم (واحدة ماستر)، مجلس، صالة، مطبخ مع مستودع، 4 دورات مياه، سطح. بالقرب من الملك عبدالله والدائري الشمالي. تقبل جميع البنوك.',
    type: 'دور علوي',
    operation: 'للبيع',
    status: 'active',
    city: 'بريدة',
    district: 'حي الفاروق (الأزدهار) شمال بريدة',
    price: 515000,
    price_unit: 'ريال',
    area: 249,
    bedrooms: 4,
    bathrooms: 4,
    has_pool: false,
    has_parking: true,
    has_garden: false,
    main_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    images: null,
    is_featured: false,
    is_new: true,
    whatsapp: '966500000000',
  },
  {
    id: '3',
    created_at: '2026-04-29T11:00:00Z',
    title: 'فيلا مفصولة مودرن (زاوية)',
    description: 'فيلا مفصولة بتصميم مودرن على الزاوية. الواجهة جنوبية غربية على شارع 15م. مساحة الأرض 362م، مسطح البناء 474م. البناء على الكود السعودي — تأمين 10 سنوات — إشراف هندسي مع تصوير مراحل البناء. تقبل جميع البنوك.',
    type: 'فيلا',
    operation: 'للبيع',
    status: 'active',
    city: 'بريدة',
    district: 'حي البساتين شرق بريدة',
    price: 960000,
    price_unit: 'ريال',
    area: 362,
    bedrooms: 5,
    bathrooms: 5,
    has_pool: false,
    has_parking: true,
    has_garden: false,
    main_image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80',
    images: null,
    is_featured: true,
    is_new: true,
    whatsapp: '966500000000',
  },
  {
    id: '4',
    created_at: '2026-04-29T10:00:00Z',
    title: 'فيلا مفصولة مودرن (شارع واحد)',
    description: 'فيلا مفصولة بتصميم مودرن — الواجهة جنوبية غربية على شارع 15م. مساحة الأرض 329م، مسطح البناء 474م. البناء على الكود السعودي — تأمين 10 سنوات — إشراف هندسي. تقبل جميع البنوك.',
    type: 'فيلا',
    operation: 'للبيع',
    status: 'active',
    city: 'بريدة',
    district: 'حي البساتين شرق بريدة',
    price: 950000,
    price_unit: 'ريال',
    area: 329,
    bedrooms: 5,
    bathrooms: 5,
    has_pool: false,
    has_parking: true,
    has_garden: false,
    main_image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
    images: null,
    is_featured: false,
    is_new: true,
    whatsapp: '966500000000',
  },
  {
    id: '5',
    created_at: '2026-04-27T09:15:00Z',
    title: 'شالية مؤثثة زاوية استثماري',
    description: 'شالية مؤثثة بموقع مميز بالقرب من الدائري، مناسب للاستثمار في وسط الشاليهات. صك مشاع، شارع 20م على الزاوية. المكونات: مسبح 5×3 عمق 130، مسطحات خضراء، صالة، جلسة جانبية، غرفة نوم، مطبخ مؤثث، ملحق مشب، 2 دورات مياه، مظلة خارجية بأبواب شراعية متحركة، عدادات كهرباء وماء مستقلة. السعر: على السوم.',
    type: 'استراحة',
    operation: 'للبيع',
    status: 'active',
    city: 'بريدة',
    district: 'حي الرمال شرق مدينة بريدة',
    price: 0,
    price_unit: 'على السوم',
    area: 300,
    bedrooms: 1,
    bathrooms: 2,
    has_pool: true,
    has_parking: true,
    has_garden: true,
    main_image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80',
    images: null,
    is_featured: true,
    is_new: false,
    whatsapp: '966500000000',
  },
]
