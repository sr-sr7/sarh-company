'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Property, SB_URL, SB_HEADERS } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import PropertyCard from '@/components/PropertyCard'
import Footer from '@/components/Footer'

const H = SB_HEADERS

function PropertiesInner() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading]       = useState(true)
  const [filters, setFilters]       = useState({
    operation: searchParams.get('operation') || '',
    type:      searchParams.get('type')      || '',
    city:      searchParams.get('city')      || '',
    search:    searchParams.get('search')    || '',
    minPrice:  searchParams.get('minPrice')  || '',
    maxPrice:  searchParams.get('maxPrice')  || '',
    bedrooms:  searchParams.get('bedrooms')  || '',
  })

  useEffect(() => { loadProperties() }, [filters])

  async function loadProperties() {
    setLoading(true)
    let url = `${SB_URL}/rest/v1/properties?select=*&status=eq.active&order=is_featured.desc,created_at.desc`
    if (filters.operation) url += `&operation=eq.${encodeURIComponent(filters.operation)}`
    if (filters.type)      url += `&type=eq.${encodeURIComponent(filters.type)}`
    if (filters.city)      url += `&city=eq.${encodeURIComponent(filters.city)}`
    if (filters.search)    url += `&title=ilike.${encodeURIComponent('%' + filters.search + '%')}`
    if (filters.minPrice)  url += `&price=gte.${filters.minPrice}`
    if (filters.maxPrice)  url += `&price=lte.${filters.maxPrice}`
    if (filters.bedrooms)  url += `&bedrooms=gte.${filters.bedrooms}`
    const res = await fetch(url, { headers: H, cache: 'no-store' })
    const data = res.ok ? await res.json() : []
    setProperties(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  function setF(k: string, v: string) {
    setFilters(p => ({ ...p, [k]: v }))
  }

  function resetFilters() {
    setFilters({ operation:'', type:'', city:'', search:'', minPrice:'', maxPrice:'', bedrooms:'' })
    router.replace('/properties')
  }

  const hasFilters = Object.values(filters).some(v => v !== '')

  const inputCls: React.CSSProperties = { width:'100%', background:'#faf8f5', border:'1.5px solid rgba(39,66,62,0.15)', borderRadius:10, padding:'9px 12px', fontSize:'0.88rem', outline:'none', fontFamily:"'Tajawal','Cairo',sans-serif", boxSizing:'border-box' }
  const selectCls: React.CSSProperties = { ...inputCls, cursor:'pointer' }
  const labelCls: React.CSSProperties = { display:'block', fontSize:'0.72rem', color:'#526266', fontWeight:700, marginBottom:6, letterSpacing:0.5 }

  return (
    <main style={{ fontFamily:"'Tajawal','Cairo',sans-serif", direction:'rtl', minHeight:'100vh', background:'#faf8f5' }}>
      <Navbar />

      {/* ── Page header ── */}
      <div style={{ paddingTop:96, paddingBottom:40, padding:'96px 5% 40px', background:'linear-gradient(160deg,#27423e,#41646d)', direction:'rtl' }}>
        <div style={{ marginBottom:16 }}>
          <a href="/" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', color:'#d3e2dc', borderRadius:10, padding:'8px 16px', fontSize:'0.85rem', fontWeight:700, textDecoration:'none', fontFamily:"'Tajawal','Cairo',sans-serif", transition:'all 0.2s' }}>
            &#8594; العودة للرئيسية
          </a>
        </div>
        <p style={{ fontSize:'0.78rem', color:'rgba(211,226,220,0.6)', marginBottom:8 }}>الرئيسية › جميع العقارات</p>
        <h1 style={{ fontWeight:800, fontSize:'clamp(1.8rem,3vw,2.6rem)', color:'#fff', marginBottom:8, margin:'0 0 8px' }}>
          تصفح <span style={{ color:'#b8986a' }}>العقارات</span>
        </h1>
        <p style={{ fontSize:'0.9rem', color:'rgba(211,226,220,0.75)', marginTop:8, marginBottom:16 }}>اعثر على العقار المناسب في منطقة القصيم</p>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', padding:'6px 18px', borderRadius:50, fontSize:'0.8rem', color:'#d3e2dc', fontWeight:600 }}>
          <span style={{ width:7, height:7, background:'#b8986a', borderRadius:'50%', display:'inline-block' }} />
          {loading ? '...' : properties.length} عقار متاح
        </div>
      </div>

      <div style={{ display:'flex', minHeight:'80vh', direction:'rtl' }}>

        {/* ── Sidebar ── */}
        <aside style={{ width:270, background:'#fff', borderLeft:'1px solid rgba(39,66,62,0.08)', padding:'28px 20px', flexShrink:0, position:'sticky', top:0, height:'100vh', overflowY:'auto' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
            <h3 style={{ fontWeight:800, fontSize:'1rem', color:'#1e3a34', margin:0 }}>🔍 فلترة النتائج</h3>
            {hasFilters && (
              <button onClick={resetFilters} style={{ background:'none', border:'none', color:'#b8986a', fontSize:'0.78rem', fontWeight:700, cursor:'pointer', fontFamily:"'Tajawal','Cairo',sans-serif" }}>
                مسح الكل ✕
              </button>
            )}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

            {/* Search */}
            <div>
              <label style={labelCls}>🔤 بحث نصي</label>
              <input value={filters.search} onChange={e=>setF('search',e.target.value)}
                style={inputCls} placeholder="ابحث بالعنوان..." />
            </div>

            {/* Operation */}
            <div>
              <label style={labelCls}>🔄 نوع العملية</label>
              <select value={filters.operation} onChange={e=>setF('operation',e.target.value)} style={selectCls}>
                <option value="">الكل</option>
                {['للبيع','للإيجار','إيجار يومي','استثماري'].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>

            {/* Type */}
            <div>
              <label style={labelCls}>🏠 نوع العقار</label>
              <select value={filters.type} onChange={e=>setF('type',e.target.value)} style={selectCls}>
                <option value="">الكل</option>
                {['فيلا','أرض','شقة','استراحة','دبلكس','محل تجاري','مستودع','مزرعة','قصر'].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>

            {/* City */}
            <div>
              <label style={labelCls}>📍 المدينة</label>
              <select value={filters.city} onChange={e=>setF('city',e.target.value)} style={selectCls}>
                <option value="">كل المدن</option>
                {['الرياض','جدة','مكة المكرمة','المدينة المنورة','الدمام','الخبر','الظهران','القطيف','الأحساء','الطائف','تبوك','أبها','خميس مشيط','بريدة','عنيزة','الرس','البكيرية','المذنب','حائل','ينبع','نجران','جازان','الباحة','عرعر','سكاكا','الخرج','الدوادمي'].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Price range */}
            <div>
              <label style={labelCls}>💰 نطاق السعر (ريال)</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                <input type="number" value={filters.minPrice} onChange={e=>setF('minPrice',e.target.value)}
                  style={inputCls} placeholder="من" />
                <input type="number" value={filters.maxPrice} onChange={e=>setF('maxPrice',e.target.value)}
                  style={inputCls} placeholder="إلى" />
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <label style={labelCls}>🛏️ عدد الغرف (الحد الأدنى)</label>
              <select value={filters.bedrooms} onChange={e=>setF('bedrooms',e.target.value)} style={selectCls}>
                <option value="">الكل</option>
                {['1','2','3','4','5','6'].map(n=><option key={n} value={n}>{n}+ غرف</option>)}
              </select>
            </div>

            {/* Active filters chips */}
            {hasFilters && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, paddingTop:4 }}>
                {Object.entries(filters).filter(([,v])=>v).map(([k,v]) => (
                  <span key={k} onClick={() => setF(k,'')} style={{ background:'#d3e2dc', color:'#27423e', fontSize:'0.72rem', fontWeight:700, padding:'4px 10px', borderRadius:50, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                    {v} <span style={{ fontWeight:900 }}>×</span>
                  </span>
                ))}
              </div>
            )}

          </div>
        </aside>

        {/* ── Grid ── */}
        <div style={{ flex:1, padding:'28px 24px 64px', minWidth:0 }}>

          {/* Results count */}
          {!loading && (
            <p style={{ fontSize:'0.82rem', color:'#7a9188', marginBottom:20 }}>
              {properties.length === 0 ? 'لا توجد نتائج' : `${properties.length} عقار`}
              {hasFilters && ' — حسب الفلاتر المحددة'}
            </p>
          )}

          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20 }}>
              {[...Array(6)].map((_,i) => (
                <div key={i} style={{ background:'#e8e0d8', height:288, borderRadius:20, animation:'pulse 1.5s infinite', border:'1px solid rgba(39,66,62,0.1)' }} />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 0', color:'#7a9188' }}>
              <div style={{ fontSize:'4rem', opacity:0.15, marginBottom:20 }}>🔍</div>
              <p style={{ fontSize:'1.1rem', marginBottom:24 }}>لا توجد نتائج — جرّب تغيير الفلاتر</p>
              <button onClick={resetFilters} style={{ background:'#27423e', color:'#fff', border:'none', borderRadius:10, padding:'12px 28px', fontSize:'0.9rem', fontWeight:700, cursor:'pointer', fontFamily:"'Tajawal','Cairo',sans-serif" }}>
                عرض جميع العقارات
              </button>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20 }}>
              {properties.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          )}
        </div>
      </div>

      <Footer />

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </main>
  )
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'#faf8f5', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Tajawal' }}>
        <span style={{ color:'#41646d' }}>جاري التحميل...</span>
      </div>
    }>
      <PropertiesInner />
    </Suspense>
  )
}
