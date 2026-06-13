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

    const buffer   = Buffer.from(await file.arrayBuffer())

    // Validate magic bytes (prevent MIME/extension spoofing)
    const magic = buffer.slice(0, 12)
    const isJpeg = magic[0] === 0xFF && magic[1] === 0xD8 && magic[2] === 0xFF
    const isPng  = magic[0] === 0x89 && magic[1] === 0x50 && magic[2] === 0x4E && magic[3] === 0x47
    const isGif  = magic[0] === 0x47 && magic[1] === 0x49 && magic[2] === 0x46 && magic[3] === 0x38
    const isWebp = magic[0] === 0x52 && magic[1] === 0x49 && magic[2] === 0x46 && magic[3] === 0x46 &&
                   magic[8] === 0x57 && magic[9] === 0x45 && magic[10] === 0x42 && magic[11] === 0x50
    const isMp4  = magic[4] === 0x66 && magic[5] === 0x74 && magic[6] === 0x79 && magic[7] === 0x70
    const isMov  = isMp4 // MOV and MP4 share the ftyp box structure
    const isImage = isJpeg || isPng || isGif || isWebp
    const isVideo = isMp4 || isMov
    if (!isImage && !isVideo) {
      return NextResponse.json({ error: 'محتوى الملف لا يتطابق مع نوعه — تلاعب محتمل' }, { status: 400 })
    }
    // Cross-check: image bytes must match image MIME and vice versa
    if (isImage && file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'نوع الملف لا يتطابق مع محتواه' }, { status: 400 })
    }
    if (isVideo && file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'نوع الملف لا يتطابق مع محتواه' }, { status: 400 })
    }

    const fileName = Date.now() + '-' + Math.random().toString(36).slice(2, 9) + '.' + ext
    const path     = 'properties/' + fileName

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
