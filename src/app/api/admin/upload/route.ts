import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { createHash, createHmac } from 'crypto'

export const runtime = 'nodejs'
export const maxDuration = 60

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime'])
const ALLOWED_EXTS  = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov'])
const MAX_SIZE_MB    = 50

const R2_ACCOUNT_ID  = process.env.R2_ACCOUNT_ID!
const R2_ACCESS_KEY  = process.env.R2_ACCESS_KEY!
const R2_SECRET_KEY  = process.env.R2_SECRET_KEY!
const R2_BUCKET      = process.env.R2_BUCKET || 'sarh-images'
const R2_PUBLIC_BASE = process.env.R2_PUBLIC_BASE || 'https://pub-9fd49e65bec14455ac774162129b9545.r2.dev'

function sign(key: Buffer | string, msg: string): Buffer {
  return createHmac('sha256', key).update(msg).digest()
}
function sha256hex(data: Buffer | string): string {
  return createHash('sha256').update(data).digest('hex')
}

async function r2Put(key: string, body: Buffer, contentType: string): Promise<void> {
  const now     = new Date()
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, 15) + 'Z'
  const date    = amzDate.slice(0, 8)
  const region  = 'auto'
  const service = 's3'
  const host    = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  const url     = `https://${host}/${R2_BUCKET}/${key}`
  const bodyHash = sha256hex(body)

  const headers: Record<string, string> = {
    'host':                 host,
    'x-amz-date':           amzDate,
    'x-amz-content-sha256': bodyHash,
    'content-type':         contentType,
  }

  const sortedKeys       = Object.keys(headers).sort()
  const canonicalHeaders = sortedKeys.map(h => `${h}:${headers[h]}`).join('\n') + '\n'
  const signedHeaders    = sortedKeys.join(';')
  const canonicalRequest = ['PUT', `/${R2_BUCKET}/${key}`, '', canonicalHeaders, signedHeaders, bodyHash].join('\n')
  const credScope        = `${date}/${region}/${service}/aws4_request`
  const strToSign        = `AWS4-HMAC-SHA256\n${amzDate}\n${credScope}\n${sha256hex(canonicalRequest)}`

  const kDate    = sign('AWS4' + R2_SECRET_KEY, date)
  const kRegion  = sign(kDate, region)
  const kService = sign(kRegion, service)
  const kSigning = sign(kService, 'aws4_request')
  const signature = createHmac('sha256', kSigning).update(strToSign).digest('hex')

  const authHeader = `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY}/${credScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

  const res = await fetch(url, {
    method:  'PUT',
    headers: { ...headers, Authorization: authHeader },
    body: new Uint8Array(body),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`R2 error ${res.status}: ${txt}`)
  }
}

export async function POST(req: Request) {
  if (!isAuthenticated()) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 })
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'لم يتم اختيار ملف' }, { status: 400 })

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json({ error: `حجم الملف يتجاوز ${MAX_SIZE_MB}MB` }, { status: 400 })
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'نوع الملف غير مسموح — صور وفيديو فقط' }, { status: 400 })
    }

    const ext = (file.name.split('.').pop() || '').toLowerCase()
    if (!ALLOWED_EXTS.has(ext)) {
      return NextResponse.json({ error: 'امتداد الملف غير مسموح' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const magic  = buffer.slice(0, 12)
    const isJpeg = magic[0] === 0xFF && magic[1] === 0xD8 && magic[2] === 0xFF
    const isPng  = magic[0] === 0x89 && magic[1] === 0x50 && magic[2] === 0x4E && magic[3] === 0x47
    const isGif  = magic[0] === 0x47 && magic[1] === 0x49 && magic[2] === 0x46 && magic[3] === 0x38
    const isWebp = magic[0] === 0x52 && magic[1] === 0x49 && magic[2] === 0x46 && magic[3] === 0x46 &&
                   magic[8] === 0x57 && magic[9] === 0x45 && magic[10] === 0x42 && magic[11] === 0x50
    const isMp4  = magic[4] === 0x66 && magic[5] === 0x74 && magic[6] === 0x79 && magic[7] === 0x70
    const isImage = isJpeg || isPng || isGif || isWebp
    const isVideo = isMp4
    if (!isImage && !isVideo) {
      return NextResponse.json({ error: 'محتوى الملف لا يتطابق مع نوعه — تلاعب محتمل' }, { status: 400 })
    }
    if (isImage && file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'نوع الملف لا يتطابق مع محتواه' }, { status: 400 })
    }
    if (isVideo && file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'نوع الملف لا يتطابق مع محتواه' }, { status: 400 })
    }

    const fileName = Date.now() + '-' + Math.random().toString(36).slice(2, 9) + '.' + ext
    const r2Key    = 'properties/' + fileName

    await r2Put(r2Key, buffer, file.type)

    return NextResponse.json({ url: `${R2_PUBLIC_BASE}/${r2Key}` })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'فشل الرفع' }, { status: 500 })
  }
}
