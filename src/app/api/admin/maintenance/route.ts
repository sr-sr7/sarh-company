import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export async function GET() {
  if (!isAuthenticated()) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 })
  const { data } = await supabaseAdmin
    .from('inquiries')
    .select('id')
    .eq('type', '__maintenance__')
    .eq('status', 'on')
    .limit(1)
  return NextResponse.json({ active: Array.isArray(data) && data.length > 0 })
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated()) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 })
  const { enable } = await req.json()
  if (enable) {
    await supabaseAdmin.from('inquiries').insert({
      client_name: '__SYSTEM__',
      client_phone: 'maintenance',
      message: 'maintenance_mode_active',
      type: '__maintenance__',
      status: 'on',
    })
  } else {
    await supabaseAdmin.from('inquiries').delete().eq('type', '__maintenance__')
  }
  return NextResponse.json({ success: true })
}
