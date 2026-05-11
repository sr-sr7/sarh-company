import { cookies } from 'next/headers'

const COOKIE_NAME = 'sarh_admin'

export function isAuthenticated(): boolean {
  const value = cookies().get(COOKIE_NAME)?.value
  const expected = process.env.ADMIN_PASSWORD
  if (!value || !expected) return false
  return value === expected
}

export { COOKIE_NAME }
