import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { COOKIE_NAME } from '@/lib/auth'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Use service role key in middleware to bypass RLS — anon key blocked SELECT on inquiries
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ── Maintenance mode cache (30 seconds TTL) ───────────────────
let maintCache: { active: boolean; expiresAt: number } = { active: false, expiresAt: 0 }

async function isMaintenance(): Promise<boolean> {
  if (Date.now() < maintCache.expiresAt) return maintCache.active
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/inquiries?type=eq.__maintenance__&status=eq.on&select=id&limit=1`,
      { headers: { apikey: SB_KEY, authorization: `Bearer ${SB_KEY}` } }
    )
    const data = res.ok ? await res.json() : []
    maintCache = { active: Array.isArray(data) && data.length > 0, expiresAt: Date.now() + 30_000 }
  } catch {
    maintCache.expiresAt = Date.now() + 10_000 // retry sooner on error
  }
  return maintCache.active
}

// ── Rate limiter for login ────────────────────────────────────
const loginAttempts = new Map<string, { count: number; resetAt: number }>()
function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = loginAttempts.get(ip)
  if (!entry || now > entry.resetAt) { loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 }); return false }
  entry.count++
  return entry.count > 10
}

// ── Verify signed session cookie (Edge-compatible) ───────────
async function verifySession(cookieValue: string, secret: string): Promise<boolean> {
  const [b64, sig] = cookieValue.split('.')
  if (!b64 || !sig) return false
  try {
    const enc = new TextEncoder().encode(b64 + secret + 'sarh_session_2026')
    const buf = await crypto.subtle.digest('SHA-256', enc)
    const expected = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
    if (expected !== sig) return false
    // Decode and check expiry
    const std = b64.replace(/-/g, '+').replace(/_/g, '/')
    const padded = std + '==='.slice(0, (4 - std.length % 4) % 4)
    const data = JSON.parse(atob(padded))
    return data.exp > Date.now()
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Rate-limit login ─────────────────────────────────────
  if (pathname === '/api/admin/login' && request.method === 'POST') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'محاولات كثيرة — حاول بعد 15 دقيقة' }, { status: 429 })
    }
  }

  // ── Protect /admin routes ────────────────────────────────
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const cookie = request.cookies.get(COOKIE_NAME)
    const secret = process.env.ADMIN_PASSWORD || ''
    if (!cookie || !(await verifySession(cookie.value, secret))) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  // ── Always allow ─────────────────────────────────────────
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

  // ── Admin bypass for maintenance mode (signed session required) ─
  const bypassCookie = request.cookies.get(COOKIE_NAME)
  if (bypassCookie && (await verifySession(bypassCookie.value, process.env.ADMIN_PASSWORD || ''))) {
    return NextResponse.next()
  }

  // ── Maintenance check (cached 30s) ───────────────────────────
  if (await isMaintenance()) {
    return NextResponse.rewrite(new URL('/maintenance', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
