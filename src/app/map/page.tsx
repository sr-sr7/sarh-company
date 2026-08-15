'use client'
import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Property, SB_URL, SB_HEADERS } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

const PropertyMap = dynamic(() => import('@/components/PropertyMap'), {
  ssr: false,
  loading: () => (
    <div style={{ width:'100%', height:'100%', background:'#e8f0ec', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ color:'#41646d', fontFamily:'Tajawal', fontSize:'1rem' }}>جاري تحميل الخريطة...</span>
    </div>
  ),
})

const OPERATIONS = ['للبيع','للإيجار','إيجار يومي','استثماري']
const TYPES      = ['فيلا','أرض','شقة','استراحة','دبلكس','مزرعة','تجاري','مستودع']
const FILTER_H   = 58  // ارتفاع شريط الفلاتر
const NAV_H      = 80  // ارتفاع النافبار
const BODY_H     = `calc(100vh - ${NAV_H + FILTER_H}px)`

export default function MapPage() {
  const [all,      setAll]      = useState<Property[]>([])
  const [filtered, setFiltered] = useState<Property[]>([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState<Property | null>(null)
  const [sideOpen, setSideOpen] = useState(true)
  const [op,       setOp]       = useState('')
  const [type,     setType]     = useState('')
  const [search,   setSearch]   = useState('')

  useEffect(() => {
    fetch(`${SB_URL}/rest/v1/properties?select=*&status=eq.active&order=created_at.desc`, { headers: SB_HEADERS, cache:'no-store' })
      .then(r => r.ok ? r.json() : [])
      .then(d => { setAll(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

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

  const fmt = (n: number) => new Intl.NumberFormat('ar-SA').format(n)
  const opColor = (o: string) => o==='للإيجار' ? '#2e7d32' : o==='على السوم' ? '#e65100' : '#1565c0'
  const opBg    = (o: string) => o==='للإيجار' ? '#e8f5e9' : o==='على السوم' ? '#fff3e0' : '#e3f2fd'

  return (
    <div style={{ fontFamily:"'Tajawal','Cairo',sans-serif", direction:'rtl', background:'#f4ede4' }}>
      <Navbar />

      {/* شريط الفلاتر — ثابت تحت النافبار */}
      <div style={{
        position:'fixed', top:NAV_H, right:0, left:0, zIndex:900,
        height:FILTER_H, background:'#f4ede4',
        borderBottom:'1px solid rgba(30,58,52,0.12)',
        display:'flex', gap:8, alignItems:'center', padding:'0 16px', flexWrap:'nowrap',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, background:'#fff', borderRadius:8, padding:'0 10px', border:'1px solid rgba(30,58,52,0.12)', height:34, flex:'1 1 140px', maxWidth:220, minWidth:0 }}>
          <svg width="14" height="14" fill="none" stroke="#7a9188" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث..."
            style={{ border:'none', outline:'none', background:'none', fontSize:'0.8rem', fontFamily:"'Tajawal','Cairo',sans-serif", color:'#1e3a34', width:'100%' }} />
        </div>
        <select value={op} onChange={e => setOp(e.target.value)} style={SEL}>
          <option value="">كل العمليات</option>
          {OPERATIONS.map(o => <option key={o}>{o}</option>)}
        </select>
        <select value={type} onChange={e => setType(e.target.value)} style={SEL}>
          <option value="">كل الأنواع</option>
          {TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        {(op||type||search) && (
          <button onClick={() => { setOp(''); setType(''); setSearch('') }}
            style={{ background:'none', border:'1px solid rgba(184,152,106,0.4)', borderRadius:8, color:'#b8986a', fontWeight:700, cursor:'pointer', fontSize:'0.78rem', fontFamily:"'Tajawal','Cairo',sans-serif", padding:'0 10px', height:34, whiteSpace:'nowrap', flexShrink:0 }}>
            مسح ✕
          </button>
        )}
        <span style={{ fontSize:'0.75rem', color:'#7a9188', whiteSpace:'nowrap', flexShrink:0, marginRight:'auto' }}>
          {loading ? '...' : <><b style={{ color:'#1e3a34' }}>{filtered.length}</b> عقار</>}
        </span>
        <button onClick={() => setSideOpen(o => !o)}
          style={{ background:'#1e3a34', color:'#f4ede4', border:'none', borderRadius:8, padding:'0 12px', height:34, fontWeight:700, fontSize:'0.78rem', cursor:'pointer', fontFamily:"'Tajawal','Cairo',sans-serif", whiteSpace:'nowrap', flexShrink:0 }}>
          {sideOpen ? '◀ القائمة' : 'القائمة ▶'}
        </button>
      </div>

      {/* المحتوى: خريطة + قائمة */}
      <div style={{ marginTop: NAV_H + FILTER_H, height: BODY_H, display:'flex', overflow:'hidden' }}>

        {/* الخريطة */}
        <div style={{ flex:1, height:'100%', position:'relative', minWidth:0 }}>
          {loading ? (
            <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#e8ede8' }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ width:40, height:40, border:'4px solid #f4ede4', borderTop:'4px solid #1e3a34', borderRadius:'50%', margin:'0 auto 12px', animation:'spin 1s linear infinite' }} />
                <span style={{ color:'#41646d', fontFamily:'Tajawal' }}>جاري التحميل...</span>
              </div>
            </div>
          ) : (
            <PropertyMap properties={filtered} onPinClick={handlePin} />
          )}
        </div>

        {/* القائمة الجانبية */}
        {sideOpen && (
          <div style={{ width:320, height:'100%', borderRight:'1px solid rgba(30,58,52,0.1)', overflowY:'auto', background:'#f4ede4', flexShrink:0, display:'flex', flexDirection:'column' }}>
            {/* العقار المحدد */}
            {selected && (
              <div style={{ background:'#1e3a34', padding:'14px', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <span style={{ fontSize:'0.65rem', fontWeight:800, letterSpacing:1.5, color:'#b8986a' }}>العقار المحدد</span>
                  <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', color:'rgba(211,226,220,0.5)', cursor:'pointer', fontSize:'1.1rem', padding:0, lineHeight:1 }}>✕</button>
                </div>
                {selected.main_image && <img src={selected.main_image} alt="" style={{ width:'100%', height:120, objectFit:'cover', borderRadius:10, marginBottom:10, display:'block' }} />}
                <div style={{ display:'flex', gap:5, marginBottom:8, flexWrap:'wrap' }}>
                  <span style={{ background:opBg(selected.operation), color:opColor(selected.operation), fontSize:'0.65rem', fontWeight:800, padding:'2px 9px', borderRadius:20 }}>{selected.operation}</span>
                  <span style={{ background:'rgba(184,152,106,0.15)', color:'#b8986a', fontSize:'0.65rem', fontWeight:700, padding:'2px 9px', borderRadius:20 }}>{selected.type}</span>
                </div>
                <p style={{ fontSize:'0.85rem', fontWeight:800, color:'#fff', margin:'0 0 5px', lineHeight:1.4 }}>{selected.title}</p>
                <p style={{ fontSize:'0.72rem', color:'rgba(211,226,220,0.65)', margin:'0 0 10px' }}>📍 {selected.district ? selected.district+'، ' : ''}{selected.city}</p>
                <p style={{ fontSize:'1rem', fontWeight:900, color:'#b8986a', margin:'0 0 12px' }}>
                  {fmt(selected.price)} <span style={{ fontSize:'0.7rem', fontWeight:400, color:'rgba(211,226,220,0.5)' }}>{selected.price_unit}</span>
                </p>
                <div style={{ display:'flex', gap:8 }}>
                  <a href={`/properties/${selected.id}`} style={{ flex:1, display:'block', background:'#b8986a', color:'#1e3a34', textAlign:'center', padding:'9px', borderRadius:8, fontWeight:800, fontSize:'0.8rem', textDecoration:'none' }}>التفاصيل</a>
                  <a href={`https://wa.me/${selected.whatsapp}?text=${encodeURIComponent('مرحباً، أريد الاستفسار عن: '+selected.title)}`} target="_blank"
                    style={{ flex:1, display:'block', background:'#25D366', color:'#fff', textAlign:'center', padding:'9px', borderRadius:8, fontWeight:800, fontSize:'0.8rem', textDecoration:'none' }}>واتساب</a>
                </div>
              </div>
            )}

            {/* قائمة العقارات */}
            <div style={{ flex:1, padding:8, overflowY:'auto' }}>
              {!loading && filtered.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px 16px', color:'#7a9188' }}>
                  <div style={{ fontSize:'2rem', marginBottom:8 }}>🔍</div>
                  <p style={{ fontWeight:700, color:'#1e3a34', margin:'0 0 4px' }}>لا توجد نتائج</p>
                  <p style={{ fontSize:'0.8rem', margin:0 }}>جرّب تغيير الفلاتر</p>
                </div>
              ) : filtered.map(p => (
                <div key={p.id} onClick={() => setSelected(p)} style={{
                  display:'flex', gap:10, padding:'10px', borderRadius:10, marginBottom:6,
                  background: selected?.id===p.id ? '#fff' : 'transparent',
                  border: selected?.id===p.id ? '1px solid rgba(184,152,106,0.4)' : '1px solid transparent',
                  cursor:'pointer', transition:'background 0.15s', alignItems:'center',
                }}
                  onMouseEnter={e => { if (selected?.id!==p.id) (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.65)' }}
                  onMouseLeave={e => { if (selected?.id!==p.id) (e.currentTarget as HTMLElement).style.background='transparent' }}
                >
                  {p.main_image
                    ? <img src={p.main_image} alt="" style={{ width:54, height:54, borderRadius:8, objectFit:'cover', flexShrink:0 }} />
                    : <div style={{ width:54, height:54, background:'rgba(30,58,52,0.08)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0 }}>🏠</div>
                  }
                  <div style={{ minWidth:0, flex:1 }}>
                    <div style={{ display:'flex', gap:4, marginBottom:3 }}>
                      <span style={{ fontSize:'0.6rem', fontWeight:800, color:opColor(p.operation), background:opBg(p.operation), padding:'2px 7px', borderRadius:20 }}>{p.operation}</span>
                      {p.lat&&p.lng && <span style={{ fontSize:'0.6rem', color:'#1e3a34', background:'rgba(30,58,52,0.08)', padding:'2px 7px', borderRadius:20 }}>📍</span>}
                    </div>
                    <p style={{ fontSize:'0.78rem', fontWeight:700, color:'#1e3a34', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</p>
                    <p style={{ fontSize:'0.68rem', color:'#7a9188', margin:'0 0 2px' }}>{p.city}{p.district ? ` · ${p.district}` : ''}</p>
                    <p style={{ fontSize:'0.8rem', fontWeight:900, color:'#b8986a', margin:0 }}>{fmt(p.price)} <span style={{ fontSize:'0.6rem', fontWeight:400, color:'#9aada7' }}>{p.price_unit}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform:rotate(360deg) } }
        .sarh-popup .leaflet-popup-content-wrapper { border-radius:12px; box-shadow:0 8px 24px rgba(30,58,52,0.2); padding:0; overflow:hidden; }
        .sarh-popup .leaflet-popup-content { margin:12px; }
        .sarh-popup .leaflet-popup-tip-container { display:none; }
      `}</style>
    </div>
  )
}

const SEL: React.CSSProperties = {
  background:'#fff', border:'1px solid rgba(30,58,52,0.12)', borderRadius:8,
  padding:'0 10px', fontSize:'0.8rem', fontFamily:"'Tajawal','Cairo',sans-serif",
  color:'#1e3a34', outline:'none', cursor:'pointer', height:34, flexShrink:0,
}
