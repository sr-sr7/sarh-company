import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET() {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 })
  return NextResponse.json({
    id: session.id,
    username: session.username,
    role: session.role,
    permissions: session.permissions,
  })
}
