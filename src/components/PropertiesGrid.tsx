'use client'
import { useEffect, useState } from 'react'
import { supabase, SAMPLE_PROPERTIES, type Property } from '@/lib/supabase'
import PropertyCard from './PropertyCard'

export default function PropertiesGrid() {
  const [items, setItems] = useState<Property[]>(SAMPLE_PROPERTIES)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!supabase) return
    let cancelled = false
    setLoading(true)
    supabase.from('properties').select('*').eq('status', 'active').order('is_featured', { ascending: false }).order('created_at', { ascending: false }).limit(12).then(({ data }) => {
      if (cancelled) return
      if (data && data.length > 0) setItems(data as Property[])
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  return (
    <section id="properties" className="container-x py-14 md:py-20">
      <div className="flex justify-between items-end flex-wrap gap-3 mb-8">
        <div>
          <div className="text-xs text-moss-600 tracking-[3px] mb-2 uppercase">— أحدث الإعلانات</div>
          <h2 className="font-amiri text-3xl md:text-4xl text-ink font-medium">عقارات <span className="text-moss-600">مميزة</span></h2>
        </div>
        <a href="/properties" className="text-sm text-ink-700 hover:underline">عرض الكل ←</a>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => (<div key={i} className="bg-white rounded-2xl h-80 border border-ink/10 animate-pulse" />))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {items.map(p => (<PropertyCard key={p.id} property={p} />))}
        </div>
      )}
    </section>
  )
}
