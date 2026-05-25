'use client'
import { useEffect, useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Property, SB_URL, SB_HEADERS } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// Leaflet requires browser APIs — load only on client
const PropertyMap = dynamic(() => import('@/components/PropertyMap'), {
  ssr: false,
  loading: () => (
    <div style={{ height:500, background:'#d3e2dc', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:16 }}>
      <span style={{ color:'#41646d', fontFamily:'Tajawal' }}>جاري تحميل الخريطة...</span>
    </div>
  ),
})

export default function MapPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading]       = useState(true)
  const [filters, setFilters]       = useState({ operation:'', type:'', city:'' })

  async function load() {
    setLoading(true)
    let url = `${SB_URL}/rest/v1/properties?select=*&status=eq.active&order=is_featured.desc`
    if (filters.operation) url += `&operation=eq.${encodeURIComponent(filters.operation)}`
    if (filters.type)      url += `&type=eq.${encodeURIComponent(filters.type)}`
    if (filters.city)      url += `&city=eq.${encodeURIComponent(filters.city)}`
    const res  = await fetch(url, { headers: SB_HEADERS, cache:'no-store' })
    const data = res.ok ? await res.json() : []
    setProperties(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filters])

  const sel: React.CSSProperties = {
    background:'#fff', border:'1.5px solid rgba(39,66,62,0.15)', borderRadius:8,
    padding:'8px 12px', fontSize:'0.85rem', fontFamily:"'Tajawal','Cairo',sans-serif",
    color:'#1e3a34', outline:'none', cursor:'pointer',
  }

  return (
    <main style={{ fontFamily:"'Tajawal','Cairo',sans-serif", direction:'rtl', minHeight:'100vh', background:'#faf8f5' }}>
      <Navbar />

      {/* Header */}
      <div style={{ paddingTop:96, paddingBottom:32, padding:'96px 5% 32px', background:'linear-gradient(160deg,#27423e,#41646d)' }}>
        <p style={{ fontSize:'0.78rem', color:'rgba(211,226,220,0.6)', marginBottom:8 }}>الرئيسية › خريطة العقارات</p>
        <h1 style={{ fontWeight:800, fontSize:'clamp(1.8rem,3vw,2.4rem)', color:'#fff', margin:'0 0 8px' }}>
          🗺️ خريطة <span style={{ color:'#b8986a' }}>العقارات</span>
        </h1>
        <p style={{ fontSize:'0.9rem', color:'rgba(211,226,220,0.75)', margin:'8px 0 0' }}>
          {loading ? '...' : `${properties.length} عقار على الخريطة`}
        </p>
      </div>

      {/* Filters bar */}
      <div style={{ background:'#fff', borderBottom:'1px solid rgba(39,66,62,0.08)', padding:'14px 5%', display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
        <select value={filters.operation} onChange={e => setFilters(f => ({ ...f, operation:e.target.value }))} style={sel}>
          <option value="">كل العمليات</option>
          {['للبيع','للإيجار','إيجار يومي','استثماري'].map(o => <option key={o}>{o}</option>)}
        </select>
        <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type:e.target.value }))} style={sel}>
          <option value="">كل الأنواع</option>
          {['فيلا','أرض','شقة','استراحة','دبلكس','محل تجاري','مستودع','مزرعة','قصر'].map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={filters.city} onChange={e => setFilters(f => ({ ...f, city:e.target.value }))} style={sel}>
          <option value="">كل المدن</option>
          {['الرياض','جدة','مكة المكرمة','المدينة المنورة','الدمام','الخبر','بريدة','عنيزة','الرس','حائل','تبوك','أبها','ينبع','نجران','جازان'].map(c => <option key={c}>{c}</option>)}
        </select>
        {(filters.operation || filters.type || filters.city) && (
          <button onClick={() => setFilters({ operation:'', type:'', city:'' })}
            style={{ background:'none', border:'none', color:'#b8986a', fontWeight:700, cursor:'pointer', fontSize:'0.82rem', fontFamily:"'Tajawal','Cairo',sans-serif" }}>
            مسح ✕
          </button>
        )}
      </div>

      {/* Map */}
      <div style={{ maxWidth:1400, margin:'0 auto', padding:'24px 24px 60px' }}>
        {loading ? (
          <div style={{ height:560, background:'#d3e2dc', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ color:'#41646d' }}>⏳ جاري التحميل...</span>
          </div>
        ) : (
          <PropertyMap properties={properties} />
        )}

        {/* List below map */}
        {!loading && properties.length > 0 && (
          <div style={{ marginTop:32 }}>
            <h2 style={{ fontSize:'1rem', fontWeight:800, color:'#1e3a34', marginBottom:16 }}>
              العقارات على الخريطة ({properties.length})
            </h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12 }}>
              {properties.map(p => (
                <a key={p.id} href={`/properties/${p.id}`}
                  style={{ background:'#fff', borderRadius:12, padding:'12px 14px', textDecoration:'none', border:'1px solid rgba(39,66,62,0.1)', display:'flex', gap:12, alignItems:'center', transition:'box-shadow 0.2s' }}
                  onMouseOver={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(39,66,62,0.15)')}
                  onMouseOut={e  => (e.currentTarget.style.boxShadow = 'none')}
                >
                  {p.main_image
                    ? <img src={p.main_image} alt="" style={{ width:52, height:52, borderRadius:8, objectFit:'cover', flexShrink:0 }} />
                    : <div style={{ width:52, height:52, background:'#d3e2dc', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0 }}>🏠</div>
                  }
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:'0.8rem', fontWeight:700, color:'#1e3a34', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</p>
                    <p style={{ fontSize:'0.7rem', color:'#7a9188', margin:'0 0 2px' }}>📍 {p.city}</p>
                    <p style={{ fontSize:'0.78rem', fontWeight:800, color:'#b8986a', margin:0 }}>
                      {new Intl.NumberFormat('ar-SA').format(p.price)} <span style={{ fontSize:'0.62rem', fontWeight:400, color:'#9aada7' }}>{p.price_unit}</span>
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
