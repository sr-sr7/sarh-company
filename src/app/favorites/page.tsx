'use client'
import { useEffect, useState } from 'react'
import { Property, SB_URL, SB_HEADERS } from '@/lib/supabase'
import { useFavorites } from '@/lib/favorites'
import Navbar from '@/components/Navbar'
import PropertyCard from '@/components/PropertyCard'
import Footer from '@/components/Footer'

export default function FavoritesPage() {
  const { ids, toggle } = useFavorites()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (ids.length === 0) { setProperties([]); setLoading(false); return }
    fetch(`${SB_URL}/rest/v1/properties?id=in.(${ids.join(',')})&select=*`, { headers: SB_HEADERS, cache: 'no-store' })
      .then(r => r.ok ? r.json() : [])
      .then(data => { setProperties(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [ids.join(',')])

  return (
    <main style={{ fontFamily:"'Tajawal','Cairo',sans-serif", direction:'rtl', minHeight:'100vh', background:'#faf8f5' }}>
      <Navbar />

      {/* Header */}
      <div style={{ paddingTop:96, paddingBottom:40, padding:'96px 5% 40px', background:'linear-gradient(160deg,#27423e,#41646d)' }}>
        <p style={{ fontSize:'0.78rem', color:'rgba(211,226,220,0.6)', marginBottom:8 }}>الرئيسية › المفضلة</p>
        <h1 style={{ fontWeight:800, fontSize:'clamp(1.8rem,3vw,2.4rem)', color:'#fff', margin:'0 0 8px' }}>
          ❤️ <span style={{ color:'#b8986a' }}>المفضلة</span>
        </h1>
        <p style={{ fontSize:'0.9rem', color:'rgba(211,226,220,0.75)', margin:'8px 0 0' }}>
          {ids.length === 0 ? 'لا توجد عقارات محفوظة بعد' : `${ids.length} عقار محفوظ`}
        </p>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'40px 24px 80px' }}>
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20 }}>
            {[...Array(3)].map((_,i) => (
              <div key={i} style={{ background:'#e8e0d8', height:280, borderRadius:20, animation:'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : ids.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ fontSize:'5rem', opacity:0.12, marginBottom:20 }}>🤍</div>
            <p style={{ color:'#7a9188', fontSize:'1.1rem', marginBottom:24 }}>لم تُضف أي عقار للمفضلة بعد</p>
            <a href="/properties"
              style={{ background:'#27423e', color:'#fff', borderRadius:10, padding:'12px 32px', fontWeight:700, textDecoration:'none', fontSize:'0.95rem' }}>
              تصفح العقارات
            </a>
          </div>
        ) : (
          <>
            <div style={{ display:'flex', justifyContent:'flex-start', marginBottom:20 }}>
              <button
                onClick={() => { ids.forEach(id => toggle(id)) }}
                style={{ background:'none', border:'1px solid rgba(39,66,62,0.2)', color:'#526266', borderRadius:8, padding:'8px 18px', fontSize:'0.82rem', fontWeight:700, cursor:'pointer', fontFamily:"'Tajawal','Cairo',sans-serif" }}>
                ✕ مسح الكل
              </button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20 }}>
              {properties.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          </>
        )}
      </div>

      <Footer />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </main>
  )
}
