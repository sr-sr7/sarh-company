'use client'
import { useEffect, useState } from 'react'
import { supabase, type Property } from '@/lib/supabase'
import PropertyCard from './PropertyCard'

export default function PropertiesGrid() {
  const [items, setItems] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    let cancelled = false
    supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(12)
      .then(({ data }) => {
        if (cancelled) return
        setItems((data as Property[]) || [])
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
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => (<div key={i} className="bg-white rounded-2xl h-80 border border-ink/10 animate-pulse" />))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-moss-500">
          <div className="text-5xl mb-4 opacity-20">🏠</div>
          <p className="text-sm">لا توجد عقارات حالياً</p>
          <a href="/admin" className="mt-4 inline-block bg-ink text-sand px-6 py-2 rounded-md text-sm font-medium">لوحة التحكم</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {items.map(p => (<PropertyCard key={p.id} property={p} />))}
        </div>
      )}
    </section>
  )
}
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
