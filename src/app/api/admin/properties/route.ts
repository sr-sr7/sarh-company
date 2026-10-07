import { NextResponse } from 'next/server'
import { requirePerm } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sanitizeProperty } from '@/lib/sanitize'
import cacheData from '@/data/properties-cache.json'

export const runtime = 'nodejs'

export async function GET() {
  if (!(await requirePerm('view_properties'))) return NextResponse.json({ error: 'غير مصرّح' }, { status: 403 })
  const { data, error } = await supabaseAdmin
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    // Supabase restricted — serve local cache so admin stays functional
    const sorted = [...(cacheData as any[])].sort(
      (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    )
    return NextResponse.json({ data: sorted, _source: 'cache' })
  }
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  if (!(await requirePerm('add_property'))) return NextResponse.json({ error: 'غير مصرّح' }, { status: 403 })
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
    if (error) return NextResponse.json({ error: 'فشل حفظ العقار' }, { status: 400 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 })
  }
}
