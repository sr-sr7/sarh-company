import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: Request) {
  if (!isAuthenticated()) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 })
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'لم يتم اختيار ملف' }, { status: 400 })
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase()
    const fileName = Date.now() + '-' + Math.random().toString(36).slice(2, 9) + '.' + ext
    const path = 'properties/' + fileName
    const buffer = Buffer.from(await file.arrayBuffer())
    const { error } = await supabaseAdmin.storage.from('property-media').upload(path, buffer, { contentType: file.type, upsert: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const { data } = supabaseAdmin.storage.from('property-media').getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'فشل الرفع' }, { status: 500 })
  }
}
