import { NextResponse } from 'next/server'
import { COOKIE_NAME, makeSessionCookie } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createHash } from 'crypto'

export const runtime = 'nodejs'

function sha256(s: string) {
  return createHash('sha256').update(s).digest('hex')
}

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()
    if (!username || !password) {
      return NextResponse.json({ error: 'أدخل اسم المستخدم وكلمة المرور' }, { status: 400 })
    }

    let session: { id: string; username: string; role: 'admin' | 'user'; permissions: Record<string, boolean> } | null = null

    // ── Owner login via env var ──────────────────────────────
    if (username.trim() === 'admin') {
      const expected = process.env.ADMIN_PASSWORD
      if (expected && password === expected) {
        session = { id: 'owner', username: 'admin', role: 'admin', permissions: {} }
      }
    }

    // ── DB user login ────────────────────────────────────────
    if (!session) {
      const hash = sha256(password)
      const { data } = await supabaseAdmin
        .from('admin_users')
        .select('id, username, role, permissions')
        .eq('username', username.trim())
        .eq('password_hash', hash)
        .single()
      if (data) {
        session = { id: data.id, username: data.username, role: data.role, permissions: data.permissions || {} }
      }
    }

    if (!session) {
      return NextResponse.json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, { status: 401 })
    }

    const res = NextResponse.json({ ok: true, username: session.username, role: session.role })
    res.cookies.set(COOKIE_NAME, makeSessionCookie(session), {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path:     '/',
      maxAge:   60 * 60 * 24 * 7,
    })
    return res
  } catch {
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 })
  }
}
