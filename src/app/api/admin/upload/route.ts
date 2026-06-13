import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const maxDuration = 60

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime'])
const ALLOWED_EXTS  = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov'])
const MAX_SIZE_MB    = 50

export async function POST(req: Request) {
  if (!isAuthenticated()) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 })
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'لم يتم اختيار ملف' }, { status: 400 })

    // Validate file size
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json({ error: `حجم الملف يتجاوز ${MAX_SIZE_MB}MB` }, { status: 400 })
    }

    // Validate MIME type
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'نوع الملف غير مسموح — صور وفيديو فقط' }, { status: 400 })
    }

    // Validate extension (double-check against MIME spoofing)
    const ext = (file.name.split('.').pop() || '').toLowerCase()
    if (!ALLOWED_EXTS.has(ext)) {
      return NextResponse.json({ error: 'امتداد الملف غير مسموح' }, { status: 400 })
    }

    const fileName = Date.now() + '-' + Math.random().toString(36).slice(2, 9) + '.' + ext
    const path     = 'properties/' + fileName
    const buffer   = Buffer.from(await file.arrayBuffer())

    const { error } = await supabaseAdmin.storage
      .from('property-media')
      .upload(path, buffer, { contentType: file.type, upsert: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data } = supabaseAdmin.storage.from('property-media').getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'فشل الرفع' }, { status: 500 })
  }
}
