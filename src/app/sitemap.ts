import { MetadataRoute } from 'next'
import { SB_URL, SB_HEADERS } from '@/lib/supabase'

const BASE = 'https://sarh-company.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statics: MetadataRoute.Sitemap = [
    { url: BASE,                 lastModified: new Date(), changeFrequency: 'daily',  priority: 1.0 },
    { url: `${BASE}/properties`, lastModified: new Date(), changeFrequency: 'daily',  priority: 0.9 },
  ]

  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/properties?select=id,updated_at&status=in.(active,sold)&order=updated_at.desc`,
      { headers: SB_HEADERS, next: { revalidate: 3600 } }
    )
    const data: { id: string; updated_at: string }[] = res.ok ? await res.json() : []
    const dynamic: MetadataRoute.Sitemap = data.map(p => ({
      url:             `${BASE}/properties/${p.id}`,
      lastModified:    new Date(p.updated_at),
      changeFrequency: 'weekly',
      priority:        0.8,
    }))
    return [...statics, ...dynamic]
  } catch {
    return statics
  }
}
