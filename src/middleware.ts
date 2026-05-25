import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SB_URL = 'https://mhawrjypmydnpcalnjlf.supabase.co'
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oYXdyanlwbXlkbnBjYWxuamxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNDg2NDksImV4cCI6MjA5MzYyNDY0OX0.jisZ21dv5M3wmTT8RbOnLT-2W4hxlwTo5Mf_qqROzkY'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Always allow: admin panel, maintenance page itself, static assets ──
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/maintenance') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json' ||
    /\.[a-z0-9]+$/i.test(pathname)       // any file with extension
  ) {
    return NextResponse.next()
  }

  // ── Admin bypass cookie — الأدمن يمكنه تصفح الموقع حتى في وضع الصيانة ──
  if (request.cookies.get('sarh_admin_bypass')?.value === '1') {
    return NextResponse.next()
  }

  // ── Check maintenance flag from Supabase ──
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/inquiries?type=eq.__maintenance__&status=eq.on&select=id&limit=1`,
      {
        headers: {
          'apikey':        SB_KEY,
          'authorization': `Bearer ${SB_KEY}`,
        },
      }
    )
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        return NextResponse.rewrite(new URL('/maintenance', request.url))
      }
    }
  } catch {
    // If Supabase is unreachable → default to site UP (safe fallback)
  }

  return NextResponse.next()
}

export const config = {
  // Run on all routes except static files handled above
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
