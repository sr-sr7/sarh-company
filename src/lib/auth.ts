import { cookies } from 'next/headers'
import { createHash, timingSafeEqual } from 'crypto'
import { supabaseAdmin } from './supabase-admin'

export const COOKIE_NAME = 'sarh_admin'

export type SessionData = {
  id: string
  username: string
  role: 'admin' | 'user'
  permissions: Record<string, boolean>
  pv?: string
  exp: number
}

function signingSecret(): string {
  return process.env.SESSION_SECRET || (process.env.ADMIN_PASSWORD || '') + 'sarh_session_2026'
}

function sign(b64: string): string {
  return createHash('sha256').update(b64 + signingSecret()).digest('hex')
}

// Changes whenever the user's password changes, so old cookies stop working
export function passwordVersion(passwordHash: string): string {
  return createHash('sha256').update(passwordHash).digest('hex').slice(0, 16)
}

// ── Build signed cookie value ─────────────────────────────────
export function makeSessionCookie(user: Omit<SessionData, 'exp'>): string {
  const data: SessionData = { ...user, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }
  const b64 = Buffer.from(JSON.stringify(data)).toString('base64url')
  return b64 + '.' + sign(b64)
}

// ── Verify cookie, then reload role/permissions from DB ──────
export async function getSession(): Promise<SessionData | null> {
  try {
    const jar = await cookies()
    const value = jar.get(COOKIE_NAME)?.value
    if (!value) return null
    const [b64, sig] = value.split('.')
    if (!b64 || !sig) return null
    const a = Buffer.from(sign(b64))
    const b = Buffer.from(sig)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null
    const data: SessionData = JSON.parse(Buffer.from(b64, 'base64url').toString())
    if (data.exp < Date.now()) return null
    if (data.id === 'owner') return data

    const { data: user } = await supabaseAdmin
      .from('admin_users')
      .select('id, username, role, permissions, password_hash')
      .eq('id', data.id)
      .single()
    if (!user || !data.pv || passwordVersion(user.password_hash) !== data.pv) return null
    return { ...data, username: user.username, role: user.role, permissions: user.permissions || {} }
  } catch {
    return null
  }
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getSession()) !== null
}

// ── Permission check ──────────────────────────────────────────
export function can(session: SessionData | null, perm: string): boolean {
  if (!session) return false
  if (session.role === 'admin') return true
  return session.permissions?.all === true || session.permissions?.[perm] === true
}

// Returns the session if it holds any of the given permissions, else null
export async function requirePerm(...perms: string[]): Promise<SessionData | null> {
  const session = await getSession()
  if (!session) return null
  return perms.some(p => can(session, p)) ? session : null
}

export async function requireAdmin(): Promise<SessionData | null> {
  const session = await getSession()
  return session?.role === 'admin' ? session : null
}
