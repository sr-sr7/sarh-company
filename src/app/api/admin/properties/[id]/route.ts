import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 })
  try {
    const body = await req.json()
    body.updated_at = new Date().toISOString()
    const { data, error } = await supabaseAdmin
      .from('properties')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 })
  const { error } = await supabaseAdmin.from('properties').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
