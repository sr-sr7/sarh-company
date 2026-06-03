import { Metadata } from 'next'
import { SB_URL, SB_HEADERS, Property } from '@/lib/supabase'
import PropertyDetail from './PropertyDetail'

const BASE = 'https://sarh-company.com'

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/properties?id=eq.${params.id}&select=title,description,type,operation,city,district,price,price_unit,main_image`,
      { headers: SB_HEADERS, cache: 'no-store' }
    )
    const data: Partial<Property>[] = res.ok ? await res.json() : []
    if (!data.length) return { title: 'عقار | صرح العقارية' }

    const p = data[0]
    const price = new Intl.NumberFormat('ar-SA').format(p.price ?? 0)
    const desc  = p.description?.slice(0, 160) ||
      `${p.type} ${p.operation} في ${p.city}${p.district ? ' — ' + p.district : ''} — السعر: ${price} ${p.price_unit}`

    return {
      title:       `${p.title} | صرح العقارية`,
      description: desc,
      openGraph: {
        title:       p.title,
        description: desc,
        url:         `${BASE}/properties/${params.id}`,
        siteName:    'صرح العقارية',
        locale:      'ar_SA',
        type:        'website',
        images:      p.main_image ? [{ url: p.main_image, width: 1200, height: 630, alt: p.title }] : [],
      },
      twitter: {
        card:        'summary_large_image',
        title:       p.title,
        description: desc,
        images:      p.main_image ? [p.main_image] : [],
      },
      alternates: {
        canonical: `${BASE}/properties/${params.id}`,
      },
    }
  } catch {
    return { title: 'عقار | صرح العقارية' }
  }
}

export default function PropertyPage({ params }: { params: { id: string } }) {
  return <PropertyDetail id={params.id} />
}

export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/properties?select=id`,
      { headers: SB_HEADERS }
    )
    const data: { id: string }[] = res.ok ? await res.json() : []
    return data.map(p => ({ id: p.id }))
  } catch {
    return []
  }
}
