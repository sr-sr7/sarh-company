import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

// ── Rate limiter: max 5 reviews per IP per hour ───────────────
const limiter = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = limiter.get(ip)
  if (!entry || now > entry.resetAt) {
    limiter.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return false
  }
  entry.count++
  return entry.count > 5
}

function sanitize(v: unknown, max = 500): string {
  if (typeof v !== 'string') return ''
  return v.replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').trim().slice(0, max)
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'لقد تجاوزت الحد المسموح، حاول لاحقاً' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const name       = sanitize(body.client_name, 100)
    const rating     = Math.min(5, Math.max(1, parseInt(body.rating) || 5))
    const message    = sanitize(body.message, 1000)
    const propertyId = sanitize(body.property_id, 50)

    if (!name || name.length < 2)    return NextResponse.json({ error: 'الاسم غير صالح' }, { status: 400 })
    if (!message || message.length < 5) return NextResponse.json({ error: 'التعليق قصير جداً' }, { status: 400 })

    // Verify property exists
    if (propertyId) {
      const { data } = await supabaseAdmin
        .from('properties')
        .select('id')
        .eq('id', propertyId)
        .eq('status', 'active')
        .single()
      if (!data) return NextResponse.json({ error: 'العقار غير موجود' }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from('inquiries').insert({
      client_name:  name,
      client_phone: String(rating),
      client_email: '',
      message,
      type:         'review',
      status:       'pending',
      property_id:  propertyId || null,
    })

    if (error) return NextResponse.json({ error: 'حدث خطأ، حاول مرة أخرى' }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 })
  }
}
