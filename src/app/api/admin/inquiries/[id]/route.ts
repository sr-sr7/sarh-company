import { NextRequest, NextResponse } from 'next/server'
import { requirePerm } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requirePerm('manage_reviews'))) return NextResponse.json({ error: 'غير مصرّح' }, { status: 403 })
  const { id } = await params
  try {
    const { status } = await req.json()
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'حالة غير صالحة' }, { status: 400 })
    }
    const { error } = await supabaseAdmin.from('inquiries').update({ status }).eq('id', id)
    if (error) return NextResponse.json({ error: 'تعذّر تنفيذ العملية' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requirePerm('manage_reviews'))) return NextResponse.json({ error: 'غير مصرّح' }, { status: 403 })
  const { id } = await params
  try {
    const { error } = await supabaseAdmin.from('inquiries').delete().eq('id', id)
    if (error) return NextResponse.json({ error: 'تعذّر تنفيذ العملية' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
