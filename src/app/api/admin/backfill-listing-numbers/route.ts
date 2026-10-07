import { NextResponse } from 'next/server'
import { requirePerm } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export async function POST() {
  if (!(await requirePerm('edit_property'))) return NextResponse.json({ error: 'غير مصرّح' }, { status: 403 })

  // Get all properties without a listing_number
  const { data: properties, error: pErr } = await supabaseAdmin
    .from('properties')
    .select('id, listing_number')
    .is('listing_number', null)

  if (pErr) return NextResponse.json({ error: 'تعذّر تنفيذ العملية' }, { status: 500 })
  if (!properties?.length) return NextResponse.json({ message: 'جميع العقارات لديها أرقام بالفعل', updated: 0 })

  // Get all used numbers
  const { data: usedData } = await supabaseAdmin
    .from('used_listing_numbers')
    .select('number')

  const usedSet = new Set<number>((usedData || []).map((r: any) => r.number))

  // Generate unique numbers starting from 100
  function nextFree(): number {
    let digits = 3
    while (true) {
      const min = Math.pow(10, digits - 1)
      const max = Math.pow(10, digits) - 1
      for (let n = min; n <= max; n++) {
        if (!usedSet.has(n)) return n
      }
      digits++
    }
  }

  const results: { id: string; listing_number: number }[] = []

  for (const prop of properties) {
    const num = nextFree()
    usedSet.add(num)

    await supabaseAdmin
      .from('used_listing_numbers')
      .insert({ number: num })

    const { error: uErr } = await supabaseAdmin
      .from('properties')
      .update({ listing_number: num })
      .eq('id', prop.id)

    if (!uErr) results.push({ id: prop.id, listing_number: num })
  }

  return NextResponse.json({ message: 'تم التحديث', updated: results.length, results })
}
