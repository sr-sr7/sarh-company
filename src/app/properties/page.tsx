'use client'
import { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Property, SB_URL, SB_HEADERS } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import PropertyCard from '@/components/PropertyCard'
import Footer from '@/components/Footer'

const H = SB_HEADERS

function PropertiesInner() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading]       = useState(true)
  const [visible,  setVisible]      = useState(false)
  const [filters, setFilters]       = useState({
    operation:     searchParams.get('operation')     || '',
    type:          searchParams.get('type')          || '',
    city:          searchParams.get('city')          || '',
    search:        searchParams.get('search')        || '',
    minPrice:      searchParams.get('minPrice')      || '',
    maxPrice:      searchParams.get('maxPrice')      || '',
    bedrooms:      searchParams.get('bedrooms')      || '',
    listingNumber: searchParams.get('listingNumber') || '',
  })
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadProperties() }, [filters])

  // trigger 3D entrance after cards mount
  useEffect(() => {
    if (!loading && properties.length > 0) {
      setVisible(false)
      const t = setTimeout(() => setVisible(true), 60)
      return () => clearTimeout(t)
    }
  }, [loading, properties])

  async function loadProperties() {
    setLoading(true)
    setVisible(false)
    try {
      let url = `${SB_URL}/rest/v1/properties?select=*&status=in.(active,sold)&order=is_featured.desc,created_at.desc`
      if (filters.operation) url += `&operation=eq.${encodeURIComponent(filters.operation)}`
      if (filters.type)      url += `&type=eq.${encodeURIComponent(filters.type)}`
      if (filters.city)      url += `&city=eq.${encodeURIComponent(filters.city)}`
      if (filters.search)        url += `&title=ilike.${encodeURIComponent('%' + filters.search + '%')}`
      if (filters.minPrice)      url += `&price=gte.${filters.minPrice}`
      if (filters.maxPrice)      url += `&price=lte.${filters.maxPrice}`
      if (filters.bedrooms)      url += `&bedrooms=gte.${filters.bedrooms}`
      if (filters.listingNumber) url += `&listing_number=eq.${filters.listingNumber}`
      const res  = await fetch(url, { headers: H, cache: 'no-store' })
      const data = res.ok ? await res.json() : []
      setProperties(Array.isArray(data) ? data : [])
    } catch {
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  function setF(k: string, v: string) { setFilters(p => ({ ...p, [k]: v })) }
  function resetFilters() {
    setFilters({ operation:'', type:'', city:'', search:'', minPrice:'', maxPrice:'', bedrooms:'', listingNumber:'' })
    router.replace('/properties')
  }

  const hasFilters = Object.values(filters).some(v => v !== '')

  const inp: React.CSSProperties = {
    width:'100%', background:'rgba(255,255,255,0.07)', border:'1.5px solid rgba(211,226,220,0.2)',
    borderRadius:10, padding:'9px 12px', fontSize:'0.88rem', outline:'none', color:'#f4ede4',
    fontFamily:"'Tajawal','Cairo',sans-serif", boxSizing:'border-box',
  }
  const lbl: React.CSSProperties = {
    display:'block', fontSize:'0.72rem', color:'rgba(211,226,220,0.6)',
    fontWeight:700, marginBottom:6, letterSpacing:0.5,
  }

  return (
    <main style={{ fontFamily:"'Tajawal','Cairo',sans-serif", direction:'rtl', minHeight:'100vh', background:'#f4ede4' }}>
      <Navbar />

      <style>{`
        @keyframes floatIn {
          0%   { opacity:0; transform: perspective(900px) rotateX(30deg) rotateY(-12deg) translateY(60px) scale(0.88); }
          100% { opacity:1; transform: perspective(900px) rotateX(0deg)  rotateY(0deg)   translateY(0px)  scale(1); }
        }
        @keyframes heroSlideDown {
          from { opacity:0; transform:translateY(-30px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
        }
        @keyframes orbit2 {
          from { transform: rotate(90deg) translateX(180px) rotate(-90deg); }
          to   { transform: rotate(450deg) translateX(180px) rotate(-450deg); }
        }
        .prop-card-wrap {
          opacity: 0;
          transform: perspective(900px) rotateX(28deg) rotateY(-10deg) translateY(50px) scale(0.9);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .prop-card-wrap.show {
          opacity: 1;
          transform: perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1);
        }
        .filter-inp::placeholder { color: rgba(211,226,220,0.35); }
        .filter-inp:focus { border-color: rgba(184,152,106,0.5) !important; background: rgba(255,255,255,0.1) !important; }
        select.filter-inp option { background: #1e3a34; color: #fff; }
      `}</style>

      {/* ═══ HERO ═══ */}
      <div style={{
        position:'relative', overflow:'hidden',
        background:'linear-gradient(160deg, #f4ede4 0%, #1e3a34 50%, #2d5a4e 100%)',
        paddingTop:100, paddingBottom:60, paddingRight:'5%', paddingLeft:'5%',
        textAlign:'center', animation:'heroSlideDown 0.7s ease',
      }}>
        {/* floating orbs */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
          {[...Array(6)].map((_,i) => (
            <div key={i} style={{
              position:'absolute',
              width: 8 + (i%3)*6, height: 8 + (i%3)*6,
              borderRadius:'50%',
              background: i%2===0 ? 'rgba(184,152,106,0.18)' : 'rgba(211,226,220,0.08)',
              top: `${10 + i*14}%`,
              left: `${5 + i*16}%`,
              animation: `orbit${i%2===0?'':'2'} ${12+i*4}s linear infinite`,
            }} />
          ))}
        </div>

        <p style={{ fontSize:'0.75rem', color:'rgba(184,152,106,0.8)', fontWeight:700, letterSpacing:3, marginBottom:12, animation:'heroSlideDown 0.6s ease' }}>
          ✦ صرح العقارية
        </p>
        <h1 style={{ fontSize:'clamp(2rem,5vw,3.2rem)', fontWeight:900, color:'#fff', margin:'0 0 12px', lineHeight:1.2 }}>
          جميع <span style={{ color:'#b8986a', textShadow:'0 0 40px rgba(184,152,106,0.4)' }}>العقارات</span>
        </h1>
        <p style={{ color:'rgba(211,226,220,0.65)', fontSize:'0.95rem', marginBottom:28 }}>
          تصفح مجموعتنا الكاملة — اقلب أي كرت لترى التفاصيل
        </p>
        <div style={{
          display:'inline-flex', alignItems:'center', gap:8,
          background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)',
          padding:'8px 22px', borderRadius:50, fontSize:'0.82rem', color:'#f4ede4', fontWeight:700,
        }}>
          <span style={{ width:8, height:8, background:'#b8986a', borderRadius:'50%', display:'inline-block', boxShadow:'0 0 8px #b8986a' }} />
          {loading ? '...' : `${properties.length} عقار متاح`}
        </div>
      </div>

      <style>{`
        .props-layout { display:flex; min-height:80vh; direction:rtl; }
        .props-sidebar { width:260px; background:rgba(30,58,52,0.95); backdrop-filter:blur(12px); border-left:1px solid rgba(211,226,220,0.08); padding:28px 18px; flex-shrink:0; position:sticky; top:0; height:100vh; overflow-y:auto; }
        .props-grid-wrap { flex:1; padding:32px 28px 80px; min-width:0; background:#f4ede4; }
        @media(max-width:700px){
          .props-layout   { flex-direction:column; }
          .props-sidebar  { width:100% !important; height:auto !important; position:static !important; padding:16px !important; border-left:none !important; border-bottom:1px solid rgba(211,226,220,0.08); }
          .props-sidebar .filter-fields { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
          .props-grid-wrap { padding:20px 14px 60px !important; }
        }
      `}</style>

      <div className="props-layout">

        {/* ═══ SIDEBAR ═══ */}
        <aside className="props-sidebar">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
            <h3 style={{ fontWeight:800, fontSize:'0.95rem', color:'#b8986a', margin:0 }}>🔍 فلترة</h3>
            {hasFilters && (
              <button onClick={resetFilters} style={{ background:'none', border:'none', color:'rgba(211,226,220,0.5)', fontSize:'0.75rem', fontWeight:700, cursor:'pointer', fontFamily:"'Tajawal','Cairo',sans-serif" }}>
                مسح ✕
              </button>
            )}
          </div>

          <div className="filter-fields" style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={lbl}># رقم الكود</label>
              <input className="filter-inp" type="number" value={filters.listingNumber} onChange={e=>setF('listingNumber',e.target.value)}
                style={inp} placeholder="أدخل رقم الكود..." />
            </div>
            <div>
              <label style={lbl}>🔤 بحث</label>
              <input className="filter-inp" value={filters.search} onChange={e=>setF('search',e.target.value)}
                style={inp} placeholder="ابحث بالعنوان..." />
            </div>
            <div>
              <label style={lbl}>🔄 نوع العملية</label>
              <select className="filter-inp" value={filters.operation} onChange={e=>setF('operation',e.target.value)} style={inp}>
                <option value="">الكل</option>
                {['للبيع','للإيجار','إيجار يومي','استثماري'].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>🏠 نوع العقار</label>
              <select className="filter-inp" value={filters.type} onChange={e=>setF('type',e.target.value)} style={inp}>
                <option value="">الكل</option>
                {['فيلا','أرض','شقة','استراحة','شاليه','دبلكس','محل تجاري','مستودع','مزرعة','قصر'].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>📍 المدينة</label>
              <select className="filter-inp" value={filters.city} onChange={e=>setF('city',e.target.value)} style={inp}>
                <option value="">كل المدن</option>
                {['بريدة','عنيزة','الرياض','جدة','الدمام','الخبر','تبوك','أبها','حائل','ينبع'].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>💰 السعر (ريال)</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                <input className="filter-inp" type="number" value={filters.minPrice} onChange={e=>setF('minPrice',e.target.value)} style={inp} placeholder="من" />
                <input className="filter-inp" type="number" value={filters.maxPrice} onChange={e=>setF('maxPrice',e.target.value)} style={inp} placeholder="إلى" />
              </div>
            </div>
            <div>
              <label style={lbl}>🛏️ الغرف (أدنى)</label>
              <select className="filter-inp" value={filters.bedrooms} onChange={e=>setF('bedrooms',e.target.value)} style={inp}>
                <option value="">الكل</option>
                {['1','2','3','4','5','6'].map(n=><option key={n} value={n}>{n}+ غرف</option>)}
              </select>
            </div>
            {hasFilters && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {Object.entries(filters).filter(([,v])=>v).map(([k,v]) => (
                  <span key={k} onClick={()=>setF(k,'')} style={{ background:'rgba(184,152,106,0.2)', color:'#b8986a', fontSize:'0.7rem', fontWeight:700, padding:'4px 10px', borderRadius:50, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                    {v} <span>×</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* ═══ GRID ═══ */}
        <div ref={gridRef} className="props-grid-wrap">
          {!loading && (
            <p style={{ fontSize:'0.8rem', color:'rgba(168,197,190,0.5)', marginBottom:24 }}>
              {properties.length === 0 ? 'لا توجد نتائج' : `${properties.length} عقار`}
              {hasFilters && ' — حسب الفلاتر'}
            </p>
          )}

          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:24 }}>
              {[...Array(8)].map((_,i) => (
                <div key={i} style={{
                  height:340, borderRadius:20, overflow:'hidden',
                  background:'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
                  backgroundSize:'800px 100%',
                  animation:'shimmer 1.4s infinite linear',
                  animationDelay:`${i*0.1}s`,
                }} />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div style={{ textAlign:'center', padding:'100px 0', color:'rgba(168,197,190,0.5)' }}>
              <div style={{ fontSize:'5rem', opacity:0.1, marginBottom:20 }}>🔍</div>
              <p style={{ fontSize:'1.1rem', marginBottom:28 }}>لا توجد نتائج — جرّب تغيير الفلاتر</p>
              <button onClick={resetFilters} style={{
                background:'#b8986a', color:'#1e3a34', border:'none', borderRadius:50,
                padding:'12px 32px', fontSize:'0.9rem', fontWeight:800, cursor:'pointer',
                fontFamily:"'Tajawal','Cairo',sans-serif",
              }}>عرض الكل</button>
            </div>
          ) : (
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',
              gap:28,
              perspective: 1200,
            }}>
              {properties.map((p, i) => (
                <div
                  key={p.id}
                  className={`prop-card-wrap${visible ? ' show' : ''}`}
                  style={{ transitionDelay: `${Math.min(i * 60, 600)}ms` }}
                >
                  <PropertyCard property={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ background:'#f4ede4' }}><Footer /></div>
    </main>
  )
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'#f4ede4', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Tajawal' }}>
        <span style={{ color:'#b8986a', fontSize:'1.1rem' }}>جاري التحميل...</span>
      </div>
    }>
      <PropertiesInner />
    </Suspense>
  )
}
