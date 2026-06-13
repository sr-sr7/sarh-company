import { cookies } from 'next/headers'
import { createHash } from 'crypto'

export const COOKIE_NAME = 'sarh_admin'

export type SessionData = {
  id: string
  username: string
  role: 'admin' | 'user'
  permissions: Record<string, boolean>
  exp: number
}

function signingSecret(): string {
  return (process.env.ADMIN_PASSWORD || '') + 'sarh_session_2026'
}

// ── Build signed cookie value ─────────────────────────────────
export function makeSessionCookie(user: Omit<SessionData, 'exp'>): string {
  const data: SessionData = { ...user, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }
  const b64 = Buffer.from(JSON.stringify(data)).toString('base64url')
  const sig = createHash('sha256').update(b64 + signingSecret()).digest('hex')
  return b64 + '.' + sig
}

// ── Verify and decode cookie (Node.js) ───────────────────────
export function getSession(): SessionData | null {
  try {
    const value = cookies().get(COOKIE_NAME)?.value
    if (!value) return null
    const [b64, sig] = value.split('.')
    if (!b64 || !sig) return null
    const expected = createHash('sha256').update(b64 + signingSecret()).digest('hex')
    if (expected !== sig) return null
    const data: SessionData = JSON.parse(Buffer.from(b64, 'base64url').toString())
    if (data.exp < Date.now()) return null
    return data
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null
}

// ── Permission check ──────────────────────────────────────────
export function can(session: SessionData | null, perm: string): boolean {
  if (!session) return false
  if (session.role === 'admin') return true
  return session.permissions?.all === true || session.permissions?.[perm] === true
}
