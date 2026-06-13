import { NextResponse } from 'next/server'
import { COOKIE_NAME, makeSessionToken } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { password } = await req.json()
    const expected = process.env.ADMIN_PASSWORD
    if (!expected) {
      return NextResponse.json({ error: 'لم يتم ضبط كلمة سر المسؤول على الخادم' }, { status: 500 })
    }
    if (!password || password !== expected) {
      return NextResponse.json({ error: 'كلمة السر غير صحيحة' }, { status: 401 })
    }
    const res = NextResponse.json({ ok: true })
    res.cookies.set(COOKIE_NAME, makeSessionToken(expected), {
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
