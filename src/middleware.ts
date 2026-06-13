import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { COOKIE_NAME } from '@/lib/auth'

const SB_URL = 'https://mhawrjypmydnpcalnjlf.supabase.co'
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oYXdyanlwbXlkbnBjYWxuamxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNDg2NDksImV4cCI6MjA5MzYyNDY0OX0.jisZ21dv5M3wmTT8RbOnLT-2W4hxlwTo5Mf_qqROzkY'

// ── Simple in-memory rate limiter for /api/admin/login ──
const loginAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 10
const WINDOW_MS    = 15 * 60 * 1000   // 15 minutes

function isRateLimited(ip: string): boolean {
  const now  = Date.now()
  const entry = loginAttempts.get(ip)
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > MAX_ATTEMPTS
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Rate-limit admin login endpoint ──
  if (pathname === '/api/admin/login' && request.method === 'POST') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'محاولات كثيرة — حاول بعد 15 دقيقة' },
        { status: 429 }
      )
    }
  }

  // ── Protect /admin routes — redirect to login if not authenticated ──
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const cookie = request.cookies.get(COOKIE_NAME)
    const expected = process.env.ADMIN_PASSWORD
    if (!cookie || !expected || cookie.value !== expected) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  // ── Always allow: static assets, API, maintenance ──
  if (
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/maintenance') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json' ||
    /\.[a-z0-9]+$/i.test(pathname)
  ) {
    return NextResponse.next()
  }

  // ── Admin bypass cookie — الأدمن يتصفح الموقع حتى في وضع الصيانة ──
  if (request.cookies.get('sarh_admin_bypass')?.value === '1') {
    return NextResponse.next()
  }

  // ── Check maintenance flag from Supabase ──
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/inquiries?type=eq.__maintenance__&status=eq.on&select=id&limit=1`,
      { headers: { apikey: SB_KEY, authorization: `Bearer ${SB_KEY}` } }
    )
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        return NextResponse.rewrite(new URL('/maintenance', request.url))
      }
    }
  } catch {
    // Supabase unreachable → site stays UP
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
