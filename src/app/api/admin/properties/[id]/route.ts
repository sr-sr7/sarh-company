import { NextRequest, NextResponse } from 'next/server'
import { requirePerm } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sanitizePropertyPartial } from '@/lib/sanitize'

export const runtime = 'nodejs'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requirePerm('edit_property'))) return NextResponse.json({ error: 'غير مصرّح' }, { status: 403 })
  const { id } = await params
  try {
    const raw  = await req.json()
    const body = sanitizePropertyPartial(raw)
    const { error } = await supabaseAdmin.from('properties').update(body).eq('id', id)
    if (error) return NextResponse.json({ error: 'فشل تحديث العقار' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requirePerm('delete_property'))) return NextResponse.json({ error: 'غير مصرّح' }, { status: 403 })
  const { id } = await params
  try {
    const { error } = await supabaseAdmin.from('properties').delete().eq('id', id)
    if (error) return NextResponse.json({ error: 'فشل حذف العقار' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
