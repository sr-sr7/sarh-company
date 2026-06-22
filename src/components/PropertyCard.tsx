'use client'
import { Property } from '@/lib/supabase'
import { useFavorites, useCompare } from '@/lib/favorites'

const ICONS: Record<string, string> = {
  'فيلا':'🏡','أرض':'🏗️','شقة':'🏢','استراحة':'🏖️',
  'دبلكس':'🏘️','محل تجاري':'🏪','مستودع':'🏭','مزرعة':'🌾','قصر':'🏰'
}

export default function PropertyCard({ property: p }: { property: Property }) {
  const isNegotiable = p.price_unit === 'آخر سوم'
  const priceNum = new Intl.NumberFormat('ar-SA').format(p.price)
  const price = isNegotiable
    ? (p.price > 0 ? `آخر سوم: ${priceNum} ريال` : 'آخر سوم')
    : priceNum
  const img     = p.main_image || (p.images?.[0] ?? null)
  const favs    = useFavorites()
  const compare = useCompare()
  const isFav   = favs.has(p.id)
  const isCmp   = compare.has(p.id)

  function goToProperty() { window.location.href = `/properties/${p.id}` }

  return (
    <>
      <style>{`
        .flip-card { perspective: 1000px; }
        .flip-card:hover .flip-inner { transform: rotateY(180deg); }
        .flip-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.4,0.2,0.2,1);
        }
        .flip-front, .flip-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 16px;
          overflow: hidden;
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
        }
        .flip-back {
          transform: rotateY(180deg);
          background: linear-gradient(145deg, #1e3a34, #2d5a4e);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 22px 20px;
          box-sizing: border-box;
        }
      `}</style>

      <div
        className="flip-card slide-in"
        style={{ height: 380, cursor: 'pointer', direction: 'rtl' }}
        onClick={goToProperty}
      >
        <div className="flip-inner">

          {/* ── الوجه الأمامي ── */}
          <div className="flip-front bg-white border border-[#27423e]/10 shadow-sm">

            {/* صورة */}
            <div style={{ position:'relative', height:192, background:'#d3e2dc', overflow:'hidden', flexShrink:0 }}>
              {img ? (
                <img src={img} alt={p.title} loading="eager" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
              ) : (
                <span style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontSize:'3rem', opacity:0.2 }}>{ICONS[p.type] || '🏠'}</span>
              )}
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(30,58,52,0.55) 0%, transparent 60%)', pointerEvents:'none' }} />

              {/* شارات */}
              <div className="absolute top-3 right-3 flex gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-md bg-[#d3e2dc] text-[#1e3a34]">{p.operation}</span>
                {p.is_featured && <span className="text-xs font-bold px-3 py-1 rounded-md bg-[#b8986a] text-[#1e3a34]">مميز</span>}
                {p.is_new      && <span className="text-xs font-bold px-3 py-1 rounded-md bg-[#d3e2dc] text-[#1e3a34]">جديد</span>}
              </div>


              {/* رقم القائمة */}
              {p.listing_number && (
                <div className="absolute bottom-3 left-3">
                  <span style={{ background:'rgba(0,0,0,0.55)', color:'#b8986a', fontSize:'0.7rem', fontWeight:800, padding:'3px 9px', borderRadius:6, fontFamily:'monospace', backdropFilter:'blur(4px)' }}>
                    #{p.listing_number}
                  </span>
                </div>
              )}
            </div>

            {/* تفاصيل */}
            <div className="p-5">
              <p className="text-xs text-[#2d5750] font-bold tracking-wider mb-1">{p.type}</p>
              <h3 className="font-amiri text-lg text-[#1e3a34] leading-snug mb-2 line-clamp-2">{p.title}</h3>
              <p className="text-xs text-[#7a9188] mb-4">📍 {p.city}{p.district ? ` — ${p.district}` : ''}</p>

              <div className="flex flex-wrap gap-3 py-3 border-t border-b border-[#27423e]/08 mb-4 text-xs text-[#7a9188]">
                {p.area        ? <span>📐 {p.area} م²</span>    : null}
                {p.bedrooms >0 ? <span>🛏️ {p.bedrooms} غرف</span> : null}
                {p.bathrooms>0 ? <span>🚿 {p.bathrooms} حمام</span>: null}
                {p.has_pool    && <span>🏊 مسبح</span>}
                {p.has_parking && <span>🚗 مواقف</span>}
              </div>

              <div className="flex items-center justify-between">
                <div className="font-amiri text-xl text-[#1e3a34] font-bold">
                  {isNegotiable
                    ? <span style={{ background:'#1e3a34', color:'#b8986a', fontSize:'0.82rem', fontWeight:800, padding:'4px 12px', borderRadius:20 }}>آخر سوم</span>
                    : <>{price} <span className="text-xs font-normal text-[#7a9188]">{p.price_unit}</span></>
                  }
                </div>
                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/${p.whatsapp}?text=${encodeURIComponent('مرحبا انا استفسر عن عقار رقم ' + (p.listing_number ?? p.id))}`}
                    target="_blank"
                    onClick={e => e.stopPropagation()}
                    className="bg-[#25D366] text-white text-sm px-3 py-2 rounded-lg hover:opacity-85 transition">
                    💬
                  </a>
                  <a
                    href={`/properties/${p.id}`}
                    onClick={e => e.stopPropagation()}
                    className="bg-[#1e3a34]/08 border border-[#1e3a34]/15 text-[#1e3a34] text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#d3e2dc] transition">
                    التفاصيل
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ── الوجه الخلفي ── */}
          <div className="flip-back" style={{ fontFamily: 'Tajawal, sans-serif' }}>

            {/* الشعار والنوع */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <span style={{ fontSize:'2.2rem' }}>{ICONS[p.type] || '🏠'}</span>
                <div>
                  <div style={{ color:'#b8986a', fontSize:'0.7rem', fontWeight:700, letterSpacing:2, marginBottom:2 }}>{p.type}</div>
                  <div style={{ color:'#fff', fontSize:'1rem', fontWeight:800, lineHeight:1.3 }}>{p.title}</div>
                </div>
              </div>

              {/* الموقع */}
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:18, color:'#a8c5be', fontSize:'0.82rem' }}>
                <span>📍</span>
                <span>{p.city}{p.district ? ` — ${p.district}` : ''}</span>
              </div>

              {/* المواصفات */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 14px', marginBottom:18 }}>
                {p.area        ? <Spec icon="📐" label={`${p.area} م²`} />        : null}
                {p.bedrooms >0 ? <Spec icon="🛏️" label={`${p.bedrooms} غرف`} />   : null}
                {p.bathrooms>0 ? <Spec icon="🚿" label={`${p.bathrooms} حمام`} /> : null}
                {p.maid_rooms && p.maid_rooms > 0 ? <Spec icon="🧹" label={`${p.maid_rooms} خادمة`} /> : null}
                {p.kitchens && p.kitchens > 0     ? <Spec icon="🍳" label={`${p.kitchens} مطبخ`} />   : null}
                {p.has_pool    ? <Spec icon="🏊" label="مسبح" />    : null}
                {p.has_parking ? <Spec icon="🚗" label="مواقف" />   : null}
                {p.has_garden  ? <Spec icon="🌿" label="حديقة" />   : null}
                {p.has_annex   ? <Spec icon="🏠" label="ملحق" />    : null}
              </div>
            </div>

            {/* السعر وأزرار */}
            <div>
              <div style={{ borderTop:'1px solid rgba(255,255,255,0.12)', paddingTop:16, marginBottom:14 }}>
                <div style={{ color:'#a8c5be', fontSize:'0.7rem', marginBottom:4 }}>السعر</div>
                <div style={{ color:'#b8986a', fontSize:'1.5rem', fontWeight:900 }}>
                  {isNegotiable
                    ? <span style={{ background:'rgba(184,152,106,0.2)', color:'#b8986a', fontSize:'1rem', padding:'4px 14px', borderRadius:20, border:'1px solid rgba(184,152,106,0.4)' }}>آخر سوم</span>
                    : <>{price} <span style={{ fontSize:'0.75rem', color:'#7a9e96', fontWeight:400 }}>{p.price_unit}</span></>
                  }
                </div>
              </div>

              {p.listing_number && (
                <div style={{ color:'#7a9e96', fontSize:'0.68rem', marginBottom:12, fontFamily:'monospace' }}>
                  رقم القائمة: <span style={{ color:'#b8986a' }}>#{p.listing_number}</span>
                </div>
              )}

              <div style={{ display:'flex', gap:8 }}>
                <a
                  href={`/properties/${p.id}`}
                  onClick={e => e.stopPropagation()}
                  style={{ flex:1, background:'#b8986a', color:'#1e3a34', fontWeight:800, fontSize:'0.82rem', padding:'10px 0', borderRadius:10, textAlign:'center', textDecoration:'none' }}>
                  عرض التفاصيل
                </a>
                <a
                  href={`https://wa.me/${p.whatsapp}?text=${encodeURIComponent('مرحبا، استفسر عن: ' + p.title)}`}
                  target="_blank"
                  onClick={e => e.stopPropagation()}
                  style={{ background:'#25D366', color:'#fff', fontSize:'1.1rem', padding:'10px 14px', borderRadius:10, textDecoration:'none', display:'flex', alignItems:'center' }}>
                  💬
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

function Spec({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.07)', borderRadius:8, padding:'6px 10px' }}>
      <span style={{ fontSize:'0.85rem' }}>{icon}</span>
      <span style={{ color:'#d0e8e2', fontSize:'0.78rem', fontWeight:600 }}>{label}</span>
    </div>
  )
}
