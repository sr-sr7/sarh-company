import { NextResponse } from 'next/server'
import { requirePerm } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export async function POST() {
  if (!(await requirePerm('add_property'))) return NextResponse.json({ error: 'غير مصرّح' }, { status: 403 })
  try {
    // Use MAX(listing_number)+1 instead of loading all used numbers into memory
    const { data, error } = await supabaseAdmin
      .from('properties')
      .select('listing_number')
      .order('listing_number', { ascending: false })
      .limit(1)
      .single()

    const next = error || !data?.listing_number
      ? 100  // first listing
      : (data.listing_number as number) + 1

    return NextResponse.json({ number: next })
  } catch {
    return NextResponse.json({ error: 'تعذّر تنفيذ العملية' }, { status: 500 })
  }
}
