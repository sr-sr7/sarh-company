import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 })
  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('value')
    .eq('key', 'maintenance')
    .single()
  const val = (data?.value ?? {}) as { active?: boolean; reason?: string }
  return NextResponse.json({ active: val.active ?? false, reason: val.reason ?? '' })
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 })
  const { enable, reason } = await req.json()
  await supabaseAdmin
    .from('site_settings')
    .upsert({ key: 'maintenance', value: { active: !!enable, reason: reason || '' } })
  return NextResponse.json({ success: true })
}
