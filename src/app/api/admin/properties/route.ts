import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sanitizeProperty } from '@/lib/sanitize'

export const runtime = 'nodejs'

export async function GET() {
  if (!isAuthenticated()) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 })
  const { data, error } = await supabaseAdmin
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  if (!isAuthenticated()) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 })
  try {
    const raw  = await req.json()
    const body = sanitizeProperty(raw)
    if (!body.title || !body.type || !body.city || !body.price) {
      return NextResponse.json({ error: 'حقول مطلوبة ناقصة' }, { status: 400 })
    }
    const { data, error } = await supabaseAdmin
      .from('properties')
      .insert(body)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 })
  }
}
