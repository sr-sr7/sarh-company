'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Property, SB_URL, SB_HEADERS } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import MortgageCalc from '@/components/MortgageCalc'

const H = SB_HEADERS

function TikTokEmbed({ url }: { url: string }) {
  if (!url) return null
  return (
    <div style={{ background:'#fff', borderRadius:20, padding:'24px 32px', marginBottom:20, border:'1px solid rgba(39,66,62,0.08)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
      <div>
        <div style={{ fontWeight:800, fontSize:'0.95rem', color:'#1e3a34', marginBottom:4 }}>🎵 فيديو العقار متاح على قناتنا</div>
        <div style={{ fontSize:'0.8rem', color:'#9aada7' }}>اضغط لمشاهدة الفيديو كاملاً</div>
      </div>
      <a href={url} target="_blank" rel="noopener noreferrer" style={{
        display:'inline-flex', alignItems:'center', gap:8,
        background:'#010101', color:'#fff', borderRadius:50,
        padding:'12px 24px', fontSize:'0.88rem', fontWeight:800,
        textDecoration:'none', fontFamily:"'Tajawal','Cairo',sans-serif",
        flexShrink:0,
      }}>
        <span>🎵</span> شاهد الفيديو
      </a>
    </div>
  )
}

const TYPE_ICONS: Record<string, string> = {
  'فيلا':'🏡','أرض':'🏗️','شقة':'🏢','استراحة':'🏖️',
  'دبلكس':'🏘️','محل تجاري':'🏪','مستودع':'🏭','مزرعة':'🌾','قصر':'🏰'
}

const CITY_COORDS: Record<string, [number, number]> = {
  'الرياض':[24.7136,46.6753],'جدة':[21.4858,39.1925],'مكة المكرمة':[21.3891,39.8579],
  'المدينة المنورة':[24.5247,39.5692],'الدمام':[26.4207,50.0888],'الخبر':[26.2172,50.1971],
  'الظهران':[26.2794,50.1517],'القطيف':[26.5593,49.9952],'الأحساء':[25.3792,49.5878],
  'الطائف':[21.2703,40.4158],'تبوك':[28.3835,36.5662],'أبها':[18.2164,42.5053],
  'خميس مشيط':[18.3066,42.7289],'بريدة':[26.3292,43.9772],'عنيزة':[26.0785,43.9820],
  'الرس':[25.8625,43.4887],'البكيرية':[26.1419,43.6569],'المذنب':[25.6232,43.7483],
  'حائل':[27.5114,41.7208],'ينبع':[24.0895,38.0618],'نجران':[17.5656,44.2289],
  'جازان':[16.8892,42.5511],'الباحة':[20.0129,41.4677],'عرعر':[30.9753,41.0380],
  'سكاكا':[29.9697,40.2070],'الخرج':[24.1559,47.3006],'الدوادمي':[24.5097,44.3880],
}

function extractCoords(url: string): [number,number]|null {
  const patterns = [
    url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/),
    url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/),
    url.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/),
    url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/),
    url.match(/pb=.*!3d(-?\d+\.\d+).*!4d(-?\d+\.\d+)/),
  ]
  const m = patterns.find(Boolean)
  return m ? [parseFloat(m[1]), parseFloat(m[2])] : null
}
function osmEmbed(lat:number,lng:number,z=0.008){
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng-z},${lat-z},${lng+z},${lat+z}&layer=mapnik&marker=${lat},${lng}`
}

function Stars({ rating, onClick }: { rating: number; onClick?: (n: number) => void }) {
  return (
    <div style={{ display:'flex', gap:4 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n}
          onClick={() => onClick?.(n)}
          style={{ fontSize: onClick ? '1.6rem' : '1rem', cursor: onClick ? 'pointer' : 'default', transition:'transform 0.1s', color: n <= rating ? '#f59e0b' : '#d1d5db' }}
          onMouseOver={e => onClick && ((e.target as HTMLElement).style.transform = 'scale(1.2)')}
          onMouseOut={e  => onClick && ((e.target as HTMLElement).style.transform = 'scale(1)')}
        >★</span>
      ))}
    </div>
  )
}

export default function PropertyDetail({ id }: { id: string }) {
  const router  = useRouter()
  const [property, setProperty]   = useState<Property|null>(null)
  const [loading,  setLoading]    = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [showVideo, setShowVideo] = useState(false)
  const [lightbox, setLightbox]   = useState<string|null>(null)
  const [copied,   setCopied]     = useState(false)

  // Reviews
  const [reviews, setReviews]     = useState<any[]>([])
  const [revName, setRevName]     = useState('')
  const [revRating, setRevRating] = useState(5)
  const [revMsg,  setRevMsg]      = useState('')
  const [sending, setSending]     = useState(false)
  const [sent,    setSent]        = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    fetch(`${SB_URL}/rest/v1/properties?id=eq.${id}&select=*`, { headers:H, cache:'no-store' })
      .then(r => r.ok ? r.json() : [])
      .then((data:Property[]) => { if (!cancelled) { if (data.length>0) setProperty(data[0]); setLoading(false) } })
      .catch(() => { if (!cancelled) setLoading(false) })
    fetch(`${SB_URL}/rest/v1/inquiries?property_id=eq.${id}&type=eq.review&status=eq.approved&order=created_at.desc`, { headers:H, cache:'no-store' })
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (!cancelled) setReviews(Array.isArray(data) ? data : []) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [id])

  async function sendReview(e: React.FormEvent) {
    e.preventDefault()
    if (!revName.trim() || !revMsg.trim()) return
    setSending(true)
    try {
      const res = await fetch('/api/public/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id:  id,
          client_name:  revName.trim(),
          rating:       revRating,
          message:      revMsg.trim(),
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      setSent(true)
    } catch {}
    setSending(false)
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#f4ede4', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Tajawal' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'2rem', marginBottom:12 }}>⏳</div>
        <p style={{ color:'#41646d' }}>جاري تحميل بيانات العقار...</p>
      </div>
    </div>
  )

  if (!property) return (
    <div style={{ minHeight:'100vh', background:'#f4ede4', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Tajawal' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'3rem', marginBottom:12 }}>🔍</div>
        <p style={{ color:'#526266', fontSize:'1.1rem', marginBottom:20 }}>العقار غير موجود</p>
        <button onClick={() => router.push('/properties')}
          style={{ background:'#27423e', color:'#fff', border:'none', borderRadius:10, padding:'12px 28px', fontSize:'0.9rem', fontWeight:700, cursor:'pointer', fontFamily:'Tajawal' }}>
          ← العودة للعقارات
        </button>
      </div>
    </div>
  )

  const p       = property
  const allImgs = p.images?.length ? p.images : (p.main_image ? [p.main_image] : [])
  const price   = new Intl.NumberFormat('ar-SA').format(p.price)
  const mapQ    = encodeURIComponent(`${p.city}${p.district?' '+p.district:''} المملكة العربية السعودية`)
  const coords  = p.map_url ? extractCoords(p.map_url) : (CITY_COORDS[p.city] ?? null)
  const [lat,lng] = coords ?? (CITY_COORDS[p.city] ?? [26.3292,43.9772])
  const mapEmbed  = osmEmbed(lat,lng,coords ? 0.005 : 0.03)
  const mapsUrl   = p.map_url || `https://www.google.com/maps/search/${mapQ}`
  const shareUrl  = typeof window !== 'undefined' ? window.location.href : `https://sarh-company.com/properties/${p.id}`
  const shareText = encodeURIComponent(`${p.title}\n📍 ${p.city}\n💰 ${price} ${p.price_unit}\n`)

  const specs = [
    p.area        && { icon:'📐', label:'المساحة',    val:`${p.area} م²` },
    p.bedrooms>0  && { icon:'🛏️', label:'الغرف',      val:`${p.bedrooms} غرف` },
    p.bathrooms>0 && { icon:'🚿', label:'الحمامات',   val:`${p.bathrooms} حمام` },
    p.has_pool    && { icon:'🏊', label:'مسبح',       val:'يوجد' },
    p.has_parking && { icon:'🚗', label:'مواقف',      val:'يوجد' },
    p.has_garden  && { icon:'🌿', label:'حديقة',      val:'يوجد' },
  ].filter(Boolean) as {icon:string;label:string;val:string}[]

  const avgRating = reviews.length
    ? Math.round(reviews.reduce((s,r) => s + (parseInt(r.client_phone)||5), 0) / reviews.length)
    : 0

  return (
    <main style={{ fontFamily:"'Tajawal','Cairo',sans-serif", background:'#f4ede4', minHeight:'100vh', direction:'rtl' }}>
      <Navbar />

      {/* Breadcrumb */}
      <div style={{ paddingTop:80, background:'#fff', borderBottom:'1px solid rgba(39,66,62,0.08)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'14px 24px', display:'flex', alignItems:'center', gap:8, fontSize:'0.8rem', color:'#9aada7', flexWrap:'wrap' }}>
          <a href="/"           style={{ color:'#41646d', textDecoration:'none', fontWeight:600 }}>الرئيسية</a>
          <span>›</span>
          <a href="/properties" style={{ color:'#41646d', textDecoration:'none', fontWeight:600 }}>العقارات</a>
          <span>›</span>
          <span style={{ color:'#526266', fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:300 }}>{p.title}</span>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.93)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'zoom-out' }}>
          <img src={lightbox} alt="" style={{ maxWidth:'95vw', maxHeight:'92vh', objectFit:'contain', borderRadius:8 }} />
          <button onClick={() => setLightbox(null)} style={{ position:'absolute', top:20, left:20, background:'rgba(255,255,255,0.12)', color:'#fff', border:'none', borderRadius:'50%', width:44, height:44, fontSize:'1.4rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
          {allImgs.length>1 && <>
            <button onClick={e=>{e.stopPropagation();setLightbox(allImgs[(allImgs.indexOf(lightbox)+allImgs.length-1)%allImgs.length])}}
              style={{ position:'absolute', right:20, top:'50%', transform:'translateY(-50%)', background:'rgba(255,255,255,0.12)', color:'#fff', border:'none', borderRadius:'50%', width:44, height:44, fontSize:'1.6rem', cursor:'pointer' }}>‹</button>
            <button onClick={e=>{e.stopPropagation();setLightbox(allImgs[(allImgs.indexOf(lightbox)+1)%allImgs.length])}}
              style={{ position:'absolute', left:20, top:'50%', transform:'translateY(-50%)', background:'rgba(255,255,255,0.12)', color:'#fff', border:'none', borderRadius:'50%', width:44, height:44, fontSize:'1.6rem', cursor:'pointer' }}>›</button>
          </>}
        </div>
      )}

      {/* Hero image */}
      <div style={{ background:'#1e3a34', position:'relative', maxHeight:520, overflow:'hidden' }}>
        {allImgs.length>0 ? (
          <img src={allImgs[activeImg]} alt={p.title} onClick={()=>setLightbox(allImgs[activeImg])}
            style={{ width:'100%', maxHeight:520, objectFit:'cover', display:'block', opacity:0.92, cursor:'zoom-in' }} />
        ) : (
          <div style={{ height:420, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'6rem', opacity:0.2 }}>
            {TYPE_ICONS[p.type]||'🏠'}
          </div>
        )}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(20,42,38,0.6) 0%,transparent 60%)', pointerEvents:'none' }} />
        {allImgs.length>0 && (
          <div onClick={()=>setLightbox(allImgs[activeImg])} style={{ position:'absolute', top:16, left:16, background:'rgba(0,0,0,0.45)', color:'#fff', borderRadius:8, padding:'6px 12px', fontSize:'0.8rem', cursor:'zoom-in', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', gap:6, zIndex:5 }}>
            🔍 اضغط لعرض الصورة كاملة
          </div>
        )}
        <div style={{ position:'absolute', top:20, right:24, display:'flex', gap:8, pointerEvents:'none' }}>
          <span style={{ background:'#d3e2dc', color:'#1e3a34', fontSize:'0.85rem', fontWeight:700, padding:'6px 16px', borderRadius:8 }}>{p.operation}</span>
          {p.is_featured && <span style={{ background:'#b8986a', color:'#27423e', fontSize:'0.85rem', fontWeight:700, padding:'6px 16px', borderRadius:8 }}>⭐ مميز</span>}
          {p.is_new      && <span style={{ background:'#fff', color:'#1e3a34', fontSize:'0.85rem', fontWeight:700, padding:'6px 16px', borderRadius:8 }}>🆕 جديد</span>}
        </div>
        {allImgs.length>1 && (
          <div style={{ position:'absolute', bottom:20, left:24, background:'rgba(0,0,0,0.5)', color:'#fff', fontSize:'0.8rem', padding:'5px 14px', borderRadius:50, backdropFilter:'blur(4px)' }}>
            🖼️ {allImgs.length} صورة
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {allImgs.length>1 && (
        <div style={{ background:'#d3e2dc', padding:'12px 24px', display:'flex', gap:10, overflowX:'auto', borderBottom:'1px solid rgba(30,58,52,0.1)' }}>
          {allImgs.map((img,i) => (
            <div key={i} onClick={()=>setActiveImg(i)} onDoubleClick={()=>setLightbox(img)}
              style={{ flexShrink:0, width:80, height:56, borderRadius:8, overflow:'hidden', cursor:'pointer', border:activeImg===i?'3px solid #b8986a':'3px solid transparent', transition:'border 0.2s' }}>
              <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </div>
          ))}
        </div>
      )}

      {/* Main body */}
      <div className="prop-grid" style={{ maxWidth:1200, margin:'0 auto', padding:'32px 24px 64px', display:'grid', gridTemplateColumns:'1fr 360px', gap:28, alignItems:'start' }}>

        {/* Main content */}
        <div className="prop-main">

          {/* Title */}
          <div style={{ background:'#fff', borderRadius:20, padding:'28px 32px', marginBottom:20, border:'1px solid rgba(39,66,62,0.08)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, flexWrap:'wrap' }}>
              <span style={{ fontSize:'1.6rem' }}>{TYPE_ICONS[p.type]||'🏠'}</span>
              <span style={{ background:'rgba(39,66,62,0.08)', color:'#41646d', fontSize:'0.78rem', fontWeight:700, padding:'4px 14px', borderRadius:50 }}>{p.type}</span>
              {p.listing_number && (
                <span style={{ background:'#27423e', color:'#b8986a', fontSize:'0.78rem', fontWeight:800, padding:'4px 14px', borderRadius:50, fontFamily:'monospace', letterSpacing:1 }}>
                  رقم العرض: #{p.listing_number}
                </span>
              )}
              {reviews.length>0 && (
                <span style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:50, padding:'4px 12px' }}>
                  <span style={{ color:'#f59e0b', fontWeight:800, fontSize:'0.82rem' }}>{avgRating}.0 ★</span>
                  <span style={{ color:'#9aada7', fontSize:'0.72rem' }}>({reviews.length} تقييم)</span>
                </span>
              )}
            </div>
            <h1 style={{ fontSize:'clamp(1.4rem,2.5vw,2rem)', fontWeight:800, color:'#1e3a34', lineHeight:1.4, marginBottom:12 }}>{p.title}</h1>
            <p style={{ color:'#7a9188', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:6 }}>
              📍 {p.city}{p.district?` — ${p.district}`:''}
            </p>
          </div>

          {/* Description */}
          {p.description && (
            <div style={{ background:'#fff', borderRadius:20, padding:'28px 32px', marginBottom:20, border:'1px solid rgba(39,66,62,0.08)' }}>
              <h2 style={{ fontSize:'1rem', fontWeight:800, color:'#1e3a34', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>📄 وصف العقار</h2>
              <p style={{ color:'#526266', lineHeight:2, fontSize:'0.95rem', whiteSpace:'pre-wrap' }}>{p.description}</p>
            </div>
          )}

          {/* Specs */}
          {specs.length>0 && (
            <div style={{ background:'#fff', borderRadius:20, padding:'28px 32px', marginBottom:20, border:'1px solid rgba(39,66,62,0.08)' }}>
              <h2 style={{ fontSize:'1rem', fontWeight:800, color:'#1e3a34', marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>🏗️ المواصفات والمميزات</h2>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:12 }}>
                {specs.map(s => (
                  <div key={s.label} style={{ background:'#f4ede4', borderRadius:12, padding:'14px 16px', textAlign:'center' }}>
                    <div style={{ fontSize:'1.5rem', marginBottom:6 }}>{s.icon}</div>
                    <div style={{ fontSize:'0.72rem', color:'#9aada7', fontWeight:600, marginBottom:4 }}>{s.label}</div>
                    <div style={{ fontSize:'0.95rem', fontWeight:800, color:'#27423e' }}>{s.val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TikTok Video — lazy loaded after page */}
          {p.video_url && <TikTokEmbed url={p.video_url} />}

          {/* Map */}
          <div style={{ background:'#fff', borderRadius:20, padding:'28px 32px', marginBottom:20, border:'1px solid rgba(39,66,62,0.08)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
              <h2 style={{ fontSize:'1rem', fontWeight:800, color:'#1e3a34', display:'flex', alignItems:'center', gap:8, margin:0 }}>📍 موقع العقار</h2>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                style={{ background:'#4285f4', color:'#fff', fontSize:'0.82rem', fontWeight:700, padding:'8px 18px', borderRadius:8, textDecoration:'none' }}>
                🗺️ فتح في قوقل ماب
              </a>
            </div>
            <div style={{ borderRadius:16, overflow:'hidden', border:'1px solid rgba(39,66,62,0.1)' }}>
              <iframe src={mapEmbed} width="100%" height="360" style={{ border:'none', display:'block' }} loading="lazy" title="موقع العقار" />
            </div>
            <p style={{ marginTop:12, fontSize:'0.78rem', color:'#9aada7', textAlign:'center' }}>
              📍 {p.city}{p.district?` — ${p.district}`:''} — المملكة العربية السعودية
            </p>
          </div>

          {/* ── Customer Reviews ── */}
          <div style={{ background:'#fff', borderRadius:20, padding:'28px 32px', border:'1px solid rgba(39,66,62,0.08)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:8 }}>
              <h2 style={{ fontSize:'1rem', fontWeight:800, color:'#1e3a34', display:'flex', alignItems:'center', gap:8, margin:0 }}>
                ⭐ تعليقات العملاء
              </h2>
              {reviews.length>0 && (
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Stars rating={avgRating} />
                  <span style={{ fontSize:'0.82rem', color:'#7a9188' }}>{reviews.length} تقييم</span>
                </div>
              )}
            </div>

            {/* Approved reviews list */}
            {reviews.length>0 ? (
              <div style={{ display:'flex', flexDirection:'column', gap:16, marginBottom:28 }}>
                {reviews.map(r => (
                  <div key={r.id} style={{ background:'#faf8f5', borderRadius:14, padding:'16px 20px', border:'1px solid rgba(39,66,62,0.07)' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8, flexWrap:'wrap', gap:8 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#27423e,#41646d)', display:'flex', alignItems:'center', justifyContent:'center', color:'#d3e2dc', fontWeight:800, fontSize:'0.9rem' }}>
                          {r.client_name?.[0] || '؟'}
                        </div>
                        <span style={{ fontWeight:700, color:'#1e3a34', fontSize:'0.9rem' }}>{r.client_name}</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <Stars rating={parseInt(r.client_phone)||5} />
                        <span style={{ fontSize:'0.72rem', color:'#9aada7' }}>
                          {new Date(r.created_at).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </div>
                    <p style={{ color:'#526266', fontSize:'0.88rem', lineHeight:1.7, margin:0 }}>{r.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'20px 0 24px', color:'#9aada7' }}>
                <div style={{ fontSize:'2.5rem', marginBottom:8, opacity:0.4 }}>💬</div>
                <p style={{ fontSize:'0.88rem', margin:0 }}>لا توجد تعليقات بعد — كن أول من يقيّم!</p>
              </div>
            )}

            {/* Review form */}
            <div style={{ borderTop:'1px solid rgba(39,66,62,0.08)', paddingTop:20 }}>
              <h3 style={{ fontSize:'0.88rem', fontWeight:800, color:'#1e3a34', margin:'0 0 16px', display:'flex', alignItems:'center', gap:8 }}>
                ✍️ أضف تقييمك
              </h3>
              {sent ? (
                <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:12, padding:'16px', textAlign:'center' }}>
                  <div style={{ fontSize:'1.8rem', marginBottom:8 }}>🎉</div>
                  <p style={{ color:'#166534', fontWeight:700, fontSize:'0.9rem', margin:'0 0 4px' }}>شكراً على تقييمك!</p>
                  <p style={{ color:'#4ade80', fontSize:'0.8rem', margin:0 }}>سيظهر تعليقك بعد مراجعة الإدارة</p>
                </div>
              ) : (
                <form onSubmit={sendReview} style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <div>
                    <label style={{ fontSize:'0.72rem', color:'#526266', fontWeight:700, display:'block', marginBottom:4 }}>الاسم *</label>
                    <input value={revName} onChange={e=>setRevName(e.target.value)} placeholder="اسمك الكريم" required
                      style={{ width:'100%', background:'#faf8f5', border:'1.5px solid rgba(39,66,62,0.15)', borderRadius:8, padding:'9px 12px', fontSize:'0.88rem', fontFamily:"'Tajawal','Cairo',sans-serif", outline:'none', boxSizing:'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize:'0.72rem', color:'#526266', fontWeight:700, display:'block', marginBottom:8 }}>تقييمك</label>
                    <Stars rating={revRating} onClick={setRevRating} />
                  </div>
                  <div>
                    <label style={{ fontSize:'0.72rem', color:'#526266', fontWeight:700, display:'block', marginBottom:4 }}>تعليقك *</label>
                    <textarea value={revMsg} onChange={e=>setRevMsg(e.target.value)} rows={3} placeholder="شاركنا تجربتك مع هذا العقار..." required
                      style={{ width:'100%', background:'#faf8f5', border:'1.5px solid rgba(39,66,62,0.15)', borderRadius:8, padding:'9px 12px', fontSize:'0.85rem', fontFamily:"'Tajawal','Cairo',sans-serif", outline:'none', resize:'vertical', boxSizing:'border-box' }} />
                  </div>
                  <button type="submit" disabled={sending}
                    style={{ background:sending?'#9aada7':'linear-gradient(135deg,#27423e,#1e3a34)', color:'#fff', border:'none', borderRadius:10, padding:'11px', fontWeight:800, cursor:sending?'not-allowed':'pointer', fontFamily:"'Tajawal','Cairo',sans-serif", fontSize:'0.88rem' }}>
                    {sending ? '⏳ جاري الإرسال...' : '📤 إرسال التقييم'}
                  </button>
                  <p style={{ fontSize:'0.68rem', color:'#9aada7', textAlign:'center', margin:0 }}>
                    * التعليقات تظهر بعد موافقة الإدارة
                  </p>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="prop-sidebar" style={{ position:'sticky', top:90 }}>

          {/* Price */}
          <div style={{ background:'#d3e2dc', borderRadius:20, padding:'28px 24px', marginBottom:16, color:'#1e3a34', border:'1px solid rgba(30,58,52,0.12)' }}>
            {p.listing_number && (
              <div style={{ background:'rgba(184,152,106,0.15)', border:'1px solid rgba(184,152,106,0.3)', borderRadius:10, padding:'8px 14px', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ color:'#4a7a72', fontSize:'0.72rem', fontWeight:600 }}>رقم العرض</span>
                <span style={{ color:'#b8986a', fontSize:'1rem', fontWeight:800, fontFamily:'monospace', letterSpacing:2 }}>#{p.listing_number}</span>
              </div>
            )}
            <p style={{ color:'#4a7a72', fontSize:'0.78rem', fontWeight:600, marginBottom:8, letterSpacing:1 }}>السعر</p>
            <div style={{ fontSize:'clamp(1.6rem,3vw,2.2rem)', fontWeight:800, color:'#b8986a', lineHeight:1.2 }}>{price}</div>
            <p style={{ color:'#4a7a72', fontSize:'0.82rem', marginTop:6 }}>{p.price_unit}</p>
            <div style={{ height:1, background:'rgba(30,58,52,0.12)', margin:'20px 0' }} />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[
                { icon:'🏠', label:'النوع',   val:p.type },
                { icon:'🔄', label:'العملية', val:p.operation },
                { icon:'📍', label:'المدينة', val:p.city },
                p.district && { icon:'🏘️', label:'الحي', val:p.district },
                p.area     && { icon:'📐', label:'المساحة', val:`${p.area} م²` },
                p.bedrooms>0 && { icon:'🛏️', label:'الغرف', val:`${p.bedrooms}` },
              ].filter(Boolean).map((s:any) => (
                <div key={s.label} style={{ background:'rgba(30,58,52,0.06)', borderRadius:10, padding:'10px 12px' }}>
                  <div style={{ fontSize:'0.68rem', color:'#4a7a72', marginBottom:3 }}>{s.icon} {s.label}</div>
                  <div style={{ fontSize:'0.88rem', fontWeight:700, color:'#1e3a34' }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp */}
          <a href={`https://wa.me/${p.whatsapp}?text=${encodeURIComponent('مرحبا انا استفسر عن عقار رقم '+(p.listing_number??p.id))}`}
            target="_blank" rel="noopener noreferrer"
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, width:'100%', background:'#25D366', color:'#fff', border:'none', borderRadius:14, padding:'15px 0', fontSize:'1rem', fontWeight:800, textDecoration:'none', marginBottom:10, boxSizing:'border-box', boxShadow:'0 4px 20px rgba(37,211,102,0.3)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.004 2C6.479 2 2 6.478 2 12.004c0 1.85.484 3.584 1.332 5.09L2.05 21.95l4.945-1.297A10.01 10.01 0 0012.004 22C17.53 22 22 17.522 22 12.004 22 6.479 17.53 2 12.004 2zm0 18.371a8.322 8.322 0 01-4.246-1.16l-.305-.18-3.151.828.843-3.065-.2-.32a8.32 8.32 0 01-1.278-4.47c0-4.6 3.742-8.343 8.337-8.343 4.593 0 8.335 3.742 8.335 8.343 0 4.6-3.742 8.367-8.335 8.367z"/></svg>
            تواصل عبر واتساب
          </a>

          <a href={`tel:+${p.whatsapp}`}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', background:'#fff', color:'#27423e', border:'2px solid rgba(39,66,62,0.2)', borderRadius:14, padding:'13px 0', fontSize:'0.95rem', fontWeight:700, textDecoration:'none', marginBottom:16, boxSizing:'border-box' }}>
            📞 اتصال مباشر
          </a>

          {/* Share */}
          <div style={{ background:'#fff', borderRadius:16, padding:'16px 20px', border:'1px solid rgba(39,66,62,0.08)', marginBottom:0 }}>
            <p style={{ fontSize:'0.75rem', color:'#9aada7', fontWeight:600, marginBottom:12, textAlign:'center' }}>مشاركة العقار</p>
            <div style={{ display:'flex', justifyContent:'center' }}>
              <a href={`https://wa.me/?text=${shareText}${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"
                style={{ background:'#25D366', color:'#fff', borderRadius:50, width:48, height:48, display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none', boxShadow:'0 4px 12px rgba(37,211,102,0.35)' }}>
                <svg width="26" height="26" viewBox="0 0 32 32" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 2C8.268 2 2 8.268 2 16c0 2.474.67 4.793 1.836 6.785L2 30l7.43-1.797A13.93 13.93 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.54 11.54 0 01-5.88-1.607l-.42-.25-4.41 1.067 1.1-4.295-.274-.44A11.56 11.56 0 014.4 16C4.4 9.59 9.59 4.4 16 4.4S27.6 9.59 27.6 16 22.41 27.6 16 27.6zm6.34-8.66c-.347-.174-2.055-1.014-2.374-1.13-.32-.115-.552-.173-.784.174-.232.347-.9 1.13-1.102 1.363-.203.232-.405.26-.752.087-.347-.174-1.465-.54-2.79-1.72-1.03-.92-1.726-2.057-1.928-2.404-.203-.347-.022-.535.152-.708.156-.155.347-.405.52-.608.174-.203.232-.347.348-.578.115-.232.058-.434-.029-.608-.087-.173-.784-1.89-1.073-2.588-.283-.68-.57-.587-.784-.598l-.667-.012c-.232 0-.608.087-.927.434-.318.347-1.217 1.189-1.217 2.9s1.246 3.363 1.42 3.595c.173.232 2.452 3.742 5.942 5.247.83.358 1.478.572 1.983.732.833.265 1.592.228 2.192.138.669-.1 2.055-.84 2.346-1.652.29-.812.29-1.508.203-1.652-.086-.145-.318-.232-.666-.405z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Mortgage Calc */}
          <MortgageCalc price={p.price} />

        </div>
      </div>

      {/* Back button */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px 40px' }}>
        <button onClick={()=>router.back()}
          style={{ background:'#fff', color:'#526266', border:'1px solid rgba(39,66,62,0.15)', borderRadius:10, padding:'10px 24px', fontSize:'0.9rem', fontWeight:700, cursor:'pointer', fontFamily:'Tajawal' }}>
          ← العودة للعقارات
        </button>
      </div>

      <Footer />

      <style>{`
        @media (max-width:768px) {
          .prop-grid { grid-template-columns:1fr !important; padding:16px 16px 48px !important; gap:16px !important; }
          .prop-sidebar { order:-1; position:static !important; }
          .prop-main { order:1; }
        }
      `}</style>
    </main>
  )
}
