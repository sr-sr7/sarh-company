import { cookies } from 'next/headers'
import { createHash } from 'crypto'

export const COOKIE_NAME = 'sarh_admin'

// Store a hash of the password in the cookie, not the plaintext
function hashPassword(pw: string): string {
  return createHash('sha256').update(pw + 'sarh_salt_2026').digest('hex')
}

export function isAuthenticated(): boolean {
  const value    = cookies().get(COOKIE_NAME)?.value
  const expected = process.env.ADMIN_PASSWORD
  if (!value || !expected) return false
  return value === hashPassword(expected)
}

export function makeSessionToken(password: string): string {
  return hashPassword(password)
}
