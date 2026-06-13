import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

// ── In-memory rate limiter: max 3 submissions per IP per hour ──
const limiter = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = limiter.get(ip)
  if (!entry || now > entry.resetAt) {
    limiter.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return false
  }
  entry.count++
  return entry.count > 3
}

function sanitize(v: unknown, max = 200): string {
  if (typeof v !== 'string') return ''
  return v.replace(/<[^>]*>/g, '').replace(/[^؀-ۿ\w\s\-.,@+()]/g, '').trim().slice(0, max)
}

function isValidPhone(p: string): boolean {
  return /^(05\d{8}|9665\d{8}|\+9665\d{8})$/.test(p.replace(/\s/g, ''))
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'لقد تجاوزت الحد المسموح به، حاول لاحقاً' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const name  = sanitize(body.name, 100)
    const phone = sanitize(body.phone, 20).replace(/\s/g, '')
    const type  = sanitize(body.property_type, 50)

    if (!name || name.length < 2)  return NextResponse.json({ error: 'الاسم غير صالح' }, { status: 400 })
    if (!isValidPhone(phone))       return NextResponse.json({ error: 'رقم الجوال غير صحيح' }, { status: 400 })
    if (!type)                      return NextResponse.json({ error: 'نوع العقار مطلوب' }, { status: 400 })

    const allowed = ['فيلا','أرض','شقة','استراحة','دبلكس','مستودع','مزرعة','قصر','تجاري','أخرى']
    if (!allowed.includes(type))    return NextResponse.json({ error: 'نوع العقار غير صالح' }, { status: 400 })

    const { error } = await supabaseAdmin
      .from('promo_leads')
      .insert({ name, phone, property_type: type })

    if (error) return NextResponse.json({ error: 'حدث خطأ، حاول مرة أخرى' }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 })
  }
}
