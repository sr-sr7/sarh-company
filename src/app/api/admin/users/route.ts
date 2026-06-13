import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createHash } from 'crypto'

export const runtime = 'nodejs'

export async function GET() {
  const session = getSession()
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 })
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .select('id, username, role, permissions, created_at')
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const session = getSession()
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 })
  try {
    const { username, password, role, permissions } = await req.json()
    if (!username?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'اسم المستخدم وكلمة المرور مطلوبان' }, { status: 400 })
    }
    if (username.trim() === 'admin') {
      return NextResponse.json({ error: 'اسم المستخدم "admin" محجوز' }, { status: 400 })
    }
    const hash = createHash('sha256').update(password).digest('hex')
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .insert({ username: username.trim(), password_hash: hash, role: role || 'user', permissions: permissions || {} })
      .select('id, username, role, permissions, created_at')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 })
  }
}
