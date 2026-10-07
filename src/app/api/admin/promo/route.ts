import { NextResponse } from 'next/server'
import { requirePerm } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export async function GET() {
  if (!(await requirePerm('view_promo'))) return NextResponse.json({ error: 'غير مصرّح' }, { status: 403 })
  const { data, error } = await supabaseAdmin
    .from('promo_leads')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'فشل جلب البيانات' }, { status: 500 })
  return NextResponse.json({ data })
}
