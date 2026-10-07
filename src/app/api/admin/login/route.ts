import { NextResponse } from 'next/server'
import { COOKIE_NAME, makeSessionCookie, passwordVersion } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createHash, timingSafeEqual } from 'crypto'
import bcrypt from 'bcryptjs'

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

    let session: { id: string; username: string; role: 'admin' | 'user'; permissions: Record<string, boolean>; pv?: string } | null = null

    // ── Owner login via env var ──────────────────────────────
    if (username.trim() === 'admin') {
      const expected = process.env.ADMIN_PASSWORD
      if (expected) {
        const a = Buffer.from(password)
        const b = Buffer.from(expected)
        const match = a.length === b.length && timingSafeEqual(a, b)
        if (match) session = { id: 'owner', username: 'admin', role: 'admin', permissions: {} }
      }
    }

    // ── DB user login ────────────────────────────────────────
    if (!session) {
      const { data } = await supabaseAdmin
        .from('admin_users')
        .select('id, username, role, permissions, password_hash')
        .eq('username', username.trim())
        .single()

      if (data) {
        let hash: string = data.password_hash
        const isBcrypt = hash.startsWith('$2')
        let valid = false

        if (isBcrypt) {
          valid = await bcrypt.compare(password, hash)
        } else {
          // Legacy SHA-256 — verify then migrate to bcrypt on the fly
          valid = hash === sha256(password)
          if (valid) {
            const newHash = await bcrypt.hash(password, 12)
            await supabaseAdmin
              .from('admin_users')
              .update({ password_hash: newHash })
              .eq('id', data.id)
            hash = newHash
          }
        }

        if (valid) {
          session = { id: data.id, username: data.username, role: data.role, permissions: data.permissions || {}, pv: passwordVersion(hash) }
        }
      }
    }

    if (!session) {
      return NextResponse.json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, { status: 401 })
    }

    const res = NextResponse.json({ ok: true, username: session.username, role: session.role })
    res.cookies.set(COOKIE_NAME, makeSessionCookie(session), {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production' || process.env.VERCEL === '1',
      sameSite: 'strict',
      path:     '/',
      maxAge:   60 * 60 * 24 * 7,
    })
    return res
  } catch {
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 })
  }
}
