'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Property, SB_URL, SB_HEADERS } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const ICONS: Record<string, string> = {
  'فيلا':'🏡','أرض':'🏗️','شقة':'🏢','استراحة':'🏖️',
  'دبلكس':'🏘️','محل تجاري':'🏪','مستودع':'🏭','مزرعة':'🌾','قصر':'🏰'
}

function CompareInner() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = searchParams.get('ids') || ''
    const ids = raw.split(',').filter(Boolean).slice(0, 2)
    if (!ids.length) { setLoading(false); return }
    fetch(`${SB_URL}/rest/v1/properties?id=in.(${ids.join(',')})&select=*`, { headers: SB_HEADERS })
      .then(r => r.ok ? r.json() : [])
      .then(data => { setProperties(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const fmt = (n: number) => new Intl.NumberFormat('ar-SA').format(n)
  const bool = (v: boolean) => v ? <span style={{ color:'#27423e', fontWeight:800 }}>✓ يوجد</span> : <span style={{ color:'#ccc' }}>—</span>

  const rows: { label: string; key: keyof Property; render?: (v: any) => React.ReactNode }[] = [
    { label:'النوع',         key:'type' },
    { label:'العملية',       key:'operation' },
    { label:'المدينة',       key:'city' },
    { label:'الحي',          key:'district' },
    { label:'المساحة',       key:'area',      render: v => v ? `${v} م²` : '—' },
    { label:'الغرف',         key:'bedrooms',  render: v => v > 0 ? `${v} غرف` : '—' },
    { label:'الحمامات',      key:'bathrooms', render: v => v > 0 ? `${v} حمام` : '—' },
    { label:'مسبح',          key:'has_pool',  render: bool },
    { label:'مواقف',         key:'has_parking',render: bool },
    { label:'حديقة',         key:'has_garden', render: bool },
    { label:'السعر',         key:'price',     render: (v) => <span style={{ color:'#41646d', fontWeight:800 }}>{fmt(v)}</span> },
  ]

  const cell: React.CSSProperties = {
    padding:'12px 16px', textAlign:'center', fontSize:'0.88rem',
    borderBottom:'1px solid rgba(39,66,62,0.07)', color:'#27423e', fontWeight:600,
  }
  const head: React.CSSProperties = {
    padding:'14px 16px', textAlign:'center', fontWeight:800, fontSize:'0.82rem',
    color:'#526266', borderBottom:'2px solid rgba(39,66,62,0.12)', background:'#d3e2dc',
  }

  return (
    <main style={{ fontFamily:"'Tajawal','Cairo',sans-serif", direction:'rtl', minHeight:'100vh', background:'#d3e2dc' }}>
      <Navbar />

      {/* Header */}
      <div style={{ paddingTop:96, paddingBottom:32, padding:'96px 5% 32px', background:'linear-gradient(160deg,#27423e,#41646d)' }}>
        <p style={{ fontSize:'0.78rem', color:'rgba(211,226,220,0.6)', marginBottom:8 }}>الرئيسية › مقارنة العقارات</p>
        <h1 style={{ fontWeight:800, fontSize:'clamp(1.8rem,3vw,2.4rem)', color:'#fff', margin:0 }}>
          ⚖️ مقارنة <span style={{ color:'#41646d' }}>العقارات</span>
        </h1>
      </div>

      <div style={{ maxWidth:900, margin:'0 auto', padding:'32px 24px 80px' }}>

        {loading ? (
          <div style={{ textAlign:'center', padding:'80px 0', color:'#7a9188' }}>⏳ جاري التحميل...</div>
        ) : properties.length < 2 ? (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ fontSize:'4rem', opacity:0.12, marginBottom:20 }}>⚖️</div>
            <p style={{ color:'#7a9188', fontSize:'1.1rem', marginBottom:24 }}>
              {properties.length === 0 ? 'لم يتم تحديد عقارات للمقارنة' : 'يلزم اختيار عقارين على الأقل'}
            </p>
            <a href="/properties"
              style={{ background:'#27423e', color:'#fff', borderRadius:10, padding:'12px 32px', fontWeight:700, textDecoration:'none' }}>
              اختر عقارات للمقارنة
            </a>
          </div>
        ) : (
          <div style={{ background:'#fff', borderRadius:20, overflow:'hidden', border:'1px solid rgba(39,66,62,0.1)', boxShadow:'0 4px 24px rgba(39,66,62,0.08)' }}>
            {/* Images & Titles */}
            <div style={{ display:'grid', gridTemplateColumns:`140px repeat(${properties.length}, 1fr)` }}>
              <div style={{ ...head, textAlign:'right' }}>المواصفات</div>
              {properties.map(p => (
                <div key={p.id} style={{ padding:'16px', borderRight:'1px solid rgba(39,66,62,0.07)', textAlign:'center' }}>
                  {p.main_image
                    ? <img src={p.main_image} alt={p.title} style={{ width:'100%', height:120, objectFit:'cover', borderRadius:10, marginBottom:8 }} />
                    : <div style={{ height:120, background:'#d3e2dc', borderRadius:10, marginBottom:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.5rem' }}>{ICONS[p.type]||'🏠'}</div>
                  }
                  <a href={`/properties/${p.id}`} style={{ fontSize:'0.85rem', fontWeight:800, color:'#1e3a34', textDecoration:'none', display:'block', marginBottom:4, lineHeight:1.4 }}>{p.title}</a>
                  {p.listing_number && <span style={{ fontSize:'0.7rem', color:'#41646d', fontFamily:'monospace' }}>#{p.listing_number}</span>}
                </div>
              ))}
            </div>

            {/* Rows */}
            {rows.map(({ label, key, render }) => (
              <div key={String(key)} style={{ display:'grid', gridTemplateColumns:`140px repeat(${properties.length}, 1fr)` }}>
                <div style={{ ...cell, textAlign:'right', background:'#f9f7f5', color:'#526266', fontWeight:700, fontSize:'0.8rem', paddingRight:20 }}>{label}</div>
                {properties.map(p => (
                  <div key={p.id} style={{ ...cell, borderRight:'1px solid rgba(39,66,62,0.07)' }}>
                    {render ? render(p[key]) : (p[key] ?? '—')}
                  </div>
                ))}
              </div>
            ))}

            {/* CTA */}
            <div style={{ display:'grid', gridTemplateColumns:`140px repeat(${properties.length}, 1fr)`, borderTop:'2px solid rgba(39,66,62,0.08)' }}>
              <div style={{ padding:'14px' }} />
              {properties.map(p => (
                <div key={p.id} style={{ padding:'14px 16px', textAlign:'center', borderRight:'1px solid rgba(39,66,62,0.07)' }}>
                  <a href={`https://wa.me/${p.whatsapp}?text=${encodeURIComponent('مرحباً أريد الاستفسار عن: ' + p.title)}`}
                    target="_blank"
                    style={{ display:'block', background:'#25D366', color:'#fff', borderRadius:10, padding:'10px', fontWeight:700, textDecoration:'none', fontSize:'0.85rem', marginBottom:8 }}>
                    💬 تواصل
                  </a>
                  <a href={`/properties/${p.id}`}
                    style={{ display:'block', background:'rgba(39,66,62,0.08)', color:'#27423e', borderRadius:10, padding:'9px', fontWeight:700, textDecoration:'none', fontSize:'0.82rem' }}>
                    التفاصيل
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop:24, textAlign:'center' }}>
          <a href="/properties"
            style={{ color:'#9aada7', fontSize:'0.85rem', textDecoration:'none', fontWeight:600 }}>
            ← العودة لقائمة العقارات
          </a>
        </div>
      </div>

      <Footer />
    </main>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Tajawal' }}><span>جاري التحميل...</span></div>}>
      <CompareInner />
    </Suspense>
  )
}
