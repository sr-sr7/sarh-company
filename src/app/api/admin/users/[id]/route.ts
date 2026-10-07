import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'غير مصرّح' }, { status: 403 })
  const { id } = await params
  try {
    const body = await req.json()
    const update: Record<string, any> = {}
    if (body.permissions !== undefined) update.permissions = body.permissions
    if (body.role !== undefined) {
      if (body.role !== 'admin' && body.role !== 'user') return NextResponse.json({ error: 'دور غير صالح' }, { status: 400 })
      update.role = body.role
    }
    if (body.password) update.password_hash = await bcrypt.hash(body.password, 12)
    const { error } = await supabaseAdmin.from('admin_users').update(update).eq('id', id)
    if (error) return NextResponse.json({ error: 'تعذّر تنفيذ العملية' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'غير مصرّح' }, { status: 403 })
  const { id } = await params
  const { error } = await supabaseAdmin.from('admin_users').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'تعذّر تنفيذ العملية' }, { status: 500 })
  return NextResponse.json({ success: true })
}
