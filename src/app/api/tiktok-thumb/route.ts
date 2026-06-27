import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'no url' }, { status: 400 })
  try {
    const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`)
    if (!res.ok) throw new Error('failed')
    const data = await res.json()
    return NextResponse.json({
      thumbnail: data.thumbnail_url,
      title: data.title,
      author: data.author_name,
    })
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
