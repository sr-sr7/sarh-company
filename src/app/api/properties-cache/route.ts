import { NextResponse } from 'next/server'
import data from '@/data/properties-cache.json'

export const dynamic = 'force-static'

export function GET() {
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  })
}
