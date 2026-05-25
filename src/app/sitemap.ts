import { MetadataRoute } from 'next'
import { SB_URL, SB_HEADERS } from '@/lib/supabase'

const BASE = 'https://sarh-company.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const statics: MetadataRoute.Sitemap = [
    { url: BASE,               lastModified: new Date(), changeFrequency: 'daily',   priority: 1 },
    { url: `${BASE}/properties`, lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/map`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/favorites`, lastModified: new Date(), changeFrequency: 'never',   priority: 0.3 },
  ]

  // Dynamic property pages
  try {
    const res  = await fetch(`${SB_URL}/rest/v1/properties?select=id,created_at&status=eq.active`, {
      headers: SB_HEADERS, next: { revalidate: 3600 }
    })
    const data: { id: string; created_at: string }[] = res.ok ? await res.json() : []
    const dynamic: MetadataRoute.Sitemap = data.map(p => ({
      url:             `${BASE}/properties/${p.id}`,
      lastModified:    new Date(p.created_at),
      changeFrequency: 'weekly',
      priority:        0.8,
    }))
    return [...statics, ...dynamic]
  } catch {
    return statics
  }
}
