import { NextResponse } from 'next/server'
import { requirePerm } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export async function GET() {
  if (!(await requirePerm('view_reviews'))) return NextResponse.json({ error: 'غير مصرّح' }, { status: 403 })
  const { data, error } = await supabaseAdmin
    .from('inquiries')
    .select('*, properties(title)')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ data: [], _source: 'cache' })
  return NextResponse.json({ data })
}
