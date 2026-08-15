'use client'
import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Property, SB_URL, SB_HEADERS } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

const PropertyMap = dynamic(() => import('@/components/PropertyMap'), {
  ssr: false,
  loading: () => (
    <div style={{ height:'100%', background:'#e8f0ec', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ color:'#41646d', fontFamily:'Tajawal', fontSize:'1rem' }}>جاري تحميل الخريطة...</span>
    </div>
  ),
})

const OPERATIONS = ['للبيع','للإيجار','إيجار يومي','استثماري']
const TYPES      = ['فيلا','أرض','شقة','استراحة','دبلكس','مزرعة','تجاري','مستودع']

export default function MapPage() {
  const [all,        setAll]        = useState<Property[]>([])
  const [filtered,   setFiltered]   = useState<Property[]>([])
  const [loading,    setLoading]    = useState(true)
  const [selected,   setSelected]   = useState<Property | null>(null)
  const [sideOpen,   setSideOpen]   = useState(true)
  const [op,         setOp]         = useState('')
  const [type,       setType]       = useState('')
  const [search,     setSearch]     = useState('')

  // جلب كل العقارات مرة واحدة
  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch(`${SB_URL}/rest/v1/properties?select=*&status=eq.active&order=created_at.desc`, { headers: SB_HEADERS, cache:'no-store' })
        const data = res.ok ? await res.json() : []
        setAll(Array.isArray(data) ? data : [])
      } catch { setAll([]) }
      finally  { setLoading(false) }
    }
    load()
  }, [])

  // فلترة محلية بدون طلبات شبكة إضافية
  useEffect(() => {
    let list = all
    if (op)     list = list.filter(p => p.operation === op)
    if (type)   list = list.filter(p => p.type === type)
    if (search) list = list.filter(p =>
      p.title.includes(search) || p.district?.includes(search) || p.city.includes(search)
    )
    setFiltered(list)
    setSelected(null)
  }, [all, op, type, search])

  const handlePin = useCallback((p: Property) => {
    setSelected(p)
    setSideOpen(true)
  }, [])

  const priceNum = (p: Property) => new Intl.NumberFormat('ar-SA').format(p.price)
  const opColor  = (o: string) => o === 'للإيجار' ? '#2e7d32' : o === 'على السوم' ? '#e65100' : '#1565c0'
  const opBg     = (o: string) => o === 'للإيجار' ? '#e8f5e9' : o === 'على السوم' ? '#fff3e0' : '#e3f2fd'

  const hasRealCoords = all.filter(p => p.lat && p.lng).length
  const withCoords    = filtered.filter(p => p.lat && p.lng).length

  return (
    <div style={{ fontFamily:"'Tajawal','Cairo',sans-serif", direction:'rtl', height:'100dvh', display:'flex', flexDirection:'column', background:'#f4ede4', overflow:'hidden' }}>
      <Navbar />

      {/* شريط الفلاتر */}
      <div style={{ paddingTop:'calc(80px)', background:'#f4ede4', borderBottom:'1px solid rgba(30,58,52,0.1)', padding:'80px 16px 12px', display:'flex', gap:10, alignItems:'center', flexWrap:'wrap', flexShrink:0 }}>

        <div style={{ display:'flex', alignItems:'center', gap:6, background:'#fff', borderRadius:10, padding:'0 12px', border:'1px solid rgba(30,58,52,0.12)', height:38, flex:'1 1 160px', maxWidth:260 }}>
          <svg width="16" height="16" fill="none" stroke="#7a9188" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ابحث بالعنوان أو الحي..."
            style={{ border:'none', outline:'none', background:'none', fontSize:'0.83rem', fontFamily:"'Tajawal','Cairo',sans-serif", color:'#1e3a34', width:'100%' }} />
        </div>

        <select value={op} onChange={e => setOp(e.target.value)} style={SEL}>
          <option value="">كل العمليات</option>
          {OPERATIONS.map(o => <option key={o}>{o}</option>)}
        </select>

        <select value={type} onChange={e => setType(e.target.value)} style={SEL}>
          <option value="">كل الأنواع</option>
          {TYPES.map(t => <option key={t}>{t}</option>)}
        </select>

        {(op || type || search) && (
          <button onClick={() => { setOp(''); setType(''); setSearch('') }}
            style={{ background:'none', border:'1px solid rgba(184,152,106,0.4)', borderRadius:8, color:'#b8986a', fontWeight:700, cursor:'pointer', fontSize:'0.8rem', fontFamily:"'Tajawal','Cairo',sans-serif", padding:'0 12px', height:38, whiteSpace:'nowrap' }}>
            مسح ✕
          </button>
        )}

        <div style={{ marginRight:'auto', display:'flex', alignItems:'center', gap:6, fontSize:'0.78rem', color:'#7a9188', whiteSpace:'nowrap' }}>
          {loading ? 'جاري التحميل...' : (
            <>
              <span style={{ fontWeight:700, color:'#1e3a34' }}>{filtered.length}</span> عقار
              {withCoords > 0 && <span style={{ color:'#b8986a' }}>· {withCoords} بموقع دقيق</span>}
            </>
          )}
        </div>

        <button onClick={() => setSideOpen(o => !o)}
          style={{ background:'#1e3a34', color:'#f4ede4', border:'none', borderRadius:8, padding:'0 14px', height:38, fontWeight:700, fontSize:'0.8rem', cursor:'pointer', fontFamily:"'Tajawal','Cairo',sans-serif", whiteSpace:'nowrap' }}>
          {sideOpen ? 'إخفاء القائمة ◀' : '▶ القائمة'}
        </button>
      </div>

      {/* المحتوى الرئيسي */}
      <div style={{ flex:1, display:'flex', overflow:'hidden', minHeight:0 }}>

        {/* الخريطة */}
        <div style={{ flex:1, position:'relative', minWidth:0 }}>
          {!loading && (
            <PropertyMap properties={filtered} onPinClick={handlePin} />
          )}
          {loading && (
            <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#e8ede8' }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ width:48, height:48, border:'4px solid #f4ede4', borderTop:'4px solid #1e3a34', borderRadius:'50%', margin:'0 auto 16px', animation:'spin 1s linear infinite' }} />
                <span style={{ color:'#41646d', fontFamily:'Tajawal' }}>جاري تحميل العقارات...</span>
              </div>
            </div>
          )}
        </div>

        {/* القائمة الجانبية */}
        {sideOpen && (
          <div style={{ width:340, borderRight:'1px solid rgba(30,58,52,0.1)', overflowY:'auto', background:'#f4ede4', flexShrink:0, display:'flex', flexDirection:'column' }}>

            {/* العقار المحدد */}
            {selected && (
              <div style={{ background:'#1e3a34', padding:'16px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <span style={{ fontSize:'0.68rem', fontWeight:800, letterSpacing:1.5, color:'#b8986a' }}>العقار المحدد</span>
                  <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', color:'rgba(211,226,220,0.5)', cursor:'pointer', fontSize:'1rem', padding:0, lineHeight:1 }}>✕</button>
                </div>
                {selected.main_image && (
                  <img src={selected.main_image} alt="" style={{ width:'100%', height:130, objectFit:'cover', borderRadius:10, marginBottom:10, display:'block' }} />
                )}
                <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap' }}>
                  <span style={{ background:opBg(selected.operation), color:opColor(selected.operation), fontSize:'0.68rem', fontWeight:800, padding:'3px 10px', borderRadius:20 }}>{selected.operation}</span>
                  <span style={{ background:'rgba(184,152,106,0.15)', color:'#b8986a', fontSize:'0.68rem', fontWeight:700, padding:'3px 10px', borderRadius:20 }}>{selected.type}</span>
                </div>
                <p style={{ fontSize:'0.88rem', fontWeight:800, color:'#fff', margin:'0 0 6px', lineHeight:1.4 }}>{selected.title}</p>
                <p style={{ fontSize:'0.75rem', color:'rgba(211,226,220,0.65)', margin:'0 0 10px' }}>📍 {selected.district ? selected.district + '، ' : ''}{selected.city}</p>
                <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:12 }}>
                  <span style={{ fontSize:'1.1rem', fontWeight:900, color:'#b8986a' }}>{priceNum(selected)}</span>
                  <span style={{ fontSize:'0.72rem', color:'rgba(211,226,220,0.5)' }}>{selected.price_unit}</span>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <a href={`/properties/${selected.id}`}
                    style={{ flex:1, display:'block', background:'#b8986a', color:'#1e3a34', textAlign:'center', padding:'9px', borderRadius:8, fontWeight:800, fontSize:'0.82rem', textDecoration:'none' }}>
                    عرض التفاصيل
                  </a>
                  <a href={`https://wa.me/${selected.whatsapp}?text=${encodeURIComponent('مرحباً، أريد الاستفسار عن: ' + selected.title)}`} target="_blank"
                    style={{ flex:1, display:'block', background:'#25D366', color:'#fff', textAlign:'center', padding:'9px', borderRadius:8, fontWeight:800, fontSize:'0.82rem', textDecoration:'none' }}>
                    واتساب
                  </a>
                </div>
              </div>
            )}

            {/* قائمة العقارات */}
            <div style={{ flex:1, overflowY:'auto', padding:'8px' }}>
              {filtered.length === 0 && !loading ? (
                <div style={{ textAlign:'center', padding:'40px 16px', color:'#7a9188' }}>
                  <div style={{ fontSize:'2rem', marginBottom:8 }}>🔍</div>
                  <p style={{ fontWeight:700, color:'#1e3a34', marginBottom:4 }}>لا توجد نتائج</p>
                  <p style={{ fontSize:'0.82rem' }}>جرّب تغيير الفلاتر</p>
                </div>
              ) : (
                filtered.map(p => (
                  <div key={p.id}
                    onClick={() => setSelected(p)}
                    style={{
                      display:'flex', gap:10, padding:'10px', borderRadius:10, marginBottom:6,
                      background: selected?.id === p.id ? '#fff' : 'transparent',
                      border: selected?.id === p.id ? '1px solid rgba(184,152,106,0.4)' : '1px solid transparent',
                      cursor:'pointer', transition:'all 0.15s', alignItems:'center',
                    }}
                    onMouseEnter={e => { if (selected?.id !== p.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.6)' }}
                    onMouseLeave={e => { if (selected?.id !== p.id) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    {p.main_image ? (
                      <img src={p.main_image} alt="" style={{ width:56, height:56, borderRadius:8, objectFit:'cover', flexShrink:0 }} />
                    ) : (
                      <div style={{ width:56, height:56, background:'rgba(30,58,52,0.08)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0 }}>🏠</div>
                    )}
                    <div style={{ minWidth:0, flex:1 }}>
                      <div style={{ display:'flex', gap:4, marginBottom:3, flexWrap:'wrap' }}>
                        <span style={{ fontSize:'0.62rem', fontWeight:800, color:opColor(p.operation), background:opBg(p.operation), padding:'2px 7px', borderRadius:20 }}>{p.operation}</span>
                        {p.lat && p.lng && <span style={{ fontSize:'0.62rem', color:'#1e3a34', background:'rgba(30,58,52,0.08)', padding:'2px 7px', borderRadius:20 }}>📍 دقيق</span>}
                      </div>
                      <p style={{ fontSize:'0.8rem', fontWeight:700, color:'#1e3a34', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</p>
                      <p style={{ fontSize:'0.7rem', color:'#7a9188', margin:'0 0 3px' }}>{p.city}{p.district ? ` · ${p.district}` : ''}</p>
                      <p style={{ fontSize:'0.82rem', fontWeight:900, color:'#b8986a', margin:0 }}>
                        {priceNum(p)} <span style={{ fontSize:'0.62rem', fontWeight:400, color:'#9aada7' }}>{p.price_unit}</span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .sarh-popup .leaflet-popup-content-wrapper { border-radius: 12px; box-shadow: 0 8px 24px rgba(30,58,52,0.2); padding: 0; overflow: hidden; }
        .sarh-popup .leaflet-popup-content { margin: 12px; }
        .sarh-popup .leaflet-popup-tip-container { display: none; }
        @media (max-width: 640px) {
          .map-side { width: 100% !important; position: absolute !important; bottom: 0 !important; right: 0 !important; left: 0 !important; max-height: 55% !important; z-index: 1000; border-radius: 16px 16px 0 0 !important; }
        }
      `}</style>
    </div>
  )
}

const SEL: React.CSSProperties = {
  background:'#fff', border:'1px solid rgba(30,58,52,0.12)', borderRadius:8,
  padding:'0 12px', fontSize:'0.83rem', fontFamily:"'Tajawal','Cairo',sans-serif",
  color:'#1e3a34', outline:'none', cursor:'pointer', height:38,
}
