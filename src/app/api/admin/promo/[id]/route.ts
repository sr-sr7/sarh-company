import { NextRequest, NextResponse } from 'next/server'
import { requirePerm } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requirePerm('manage_promo'))) return NextResponse.json({ error: 'غير مصرّح' }, { status: 403 })
  const { id } = await params
  try {
    const { error } = await supabaseAdmin.from('promo_leads').delete().eq('id', id)
    if (error) return NextResponse.json({ error: 'تعذّر تنفيذ العملية' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
