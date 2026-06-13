import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export async function POST() {
  if (!isAuthenticated()) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 })
  try {
    const { data: usedData } = await supabaseAdmin
      .from('used_listing_numbers')
      .select('number')
      .limit(100000)
    const usedSet = new Set<number>((usedData || []).map((r: any) => r.number))

    let digits = 3
    while (true) {
      const min = Math.pow(10, digits - 1)
      const max = Math.pow(10, digits) - 1
      const range = max - min + 1
      let usedInRange = 0
      usedSet.forEach(n => { if (n >= min && n <= max) usedInRange++ })
      if (usedInRange >= range) { digits++; continue }
      const free: number[] = []
      for (let n = min; n <= max; n++) {
        if (!usedSet.has(n)) free.push(n)
      }
      const num = free[Math.floor(Math.random() * free.length)]
      await supabaseAdmin.from('used_listing_numbers').insert({ number: num })
      return NextResponse.json({ number: num })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
