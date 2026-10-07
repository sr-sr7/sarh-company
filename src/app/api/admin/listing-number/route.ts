import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export async function POST() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 })
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
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
