import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createHash } from 'crypto'

export const runtime = 'nodejs'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession()
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 })
  try {
    const body = await req.json()
    const update: Record<string, any> = {}
    if (body.permissions !== undefined) update.permissions = body.permissions
    if (body.role !== undefined) update.role = body.role
    if (body.password) update.password_hash = createHash('sha256').update(body.password).digest('hex')
    const { error } = await supabaseAdmin.from('admin_users').update(update).eq('id', params.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession()
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 })
  const { error } = await supabaseAdmin.from('admin_users').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
