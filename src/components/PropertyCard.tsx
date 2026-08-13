'use client'
import { Property } from '@/lib/supabase'
import { useFavorites, useCompare } from '@/lib/favorites'

export default function PropertyCard({ property: p }: { property: Property }) {
  const isSold       = p.status === 'sold'
  const isNegotiable = p.price_unit === 'آخر سوم'
  const isAuction    = p.operation === 'على السوم'
  const priceNum     = new Intl.NumberFormat('ar-SA').format(p.price)
  const bidPriceNum  = p.bid_price ? new Intl.NumberFormat('ar-SA').format(p.bid_price) : null
  const img          = p.main_image || (p.images?.[0] ?? null)
  const favs         = useFavorites()
  const compare      = useCompare()
  const isFav        = favs.has(p.id)
  const isCmp        = compare.has(p.id)

  const operationColor = p.operation === 'للإيجار'
    ? { bg: '#e8f5e9', color: '#2e7d32' }
    : p.operation === 'على السوم'
    ? { bg: '#fff3e0', color: '#e65100' }
    : { bg: '#e3f2fd', color: '#1565c0' }

  return (
    <a
      href={`/properties/${p.id}`}
      style={{
        display: 'flex',
        background: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(30,58,52,0.09)',
        boxShadow: '0 2px 12px rgba(30,58,52,0.06)',
        textDecoration: 'none',
        transition: 'box-shadow 0.2s, transform 0.2s',
        direction: 'rtl',
        height: '100%',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(30,58,52,0.13)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(30,58,52,0.06)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
      }}
    >
      {/* الصورة */}
      <div style={{ position: 'relative', width: 220, minWidth: 220, alignSelf: 'stretch', background: '#f0f4f2', flexShrink: 0 }}>
        {img ? (
          <img src={img} alt={p.title} loading="eager"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', opacity: 0.15 }}>
            🏠
          </div>
        )}

        {/* شارة العملية */}
        {!isSold && (
          <span style={{
            position: 'absolute', top: 12, right: 12,
            background: operationColor.bg, color: operationColor.color,
            fontSize: '0.72rem', fontWeight: 800, padding: '4px 12px',
            borderRadius: 20, letterSpacing: 0.5,
          }}>{p.operation}</span>
        )}

        {/* مباع */}
        {isSold && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/sold-stamp.png" alt="تم البيع" style={{ width: 110, height: 110, objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }} />
          </div>
        )}

        {/* رقم القائمة */}
        {p.listing_number && (
          <span style={{
            position: 'absolute', bottom: 10, left: 10,
            background: 'rgba(0,0,0,0.55)', color: '#b8986a',
            fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px',
            borderRadius: 6, fontFamily: 'monospace', backdropFilter: 'blur(4px)',
          }}>#{p.listing_number}</span>
        )}
      </div>

      {/* التفاصيل */}
      <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>

        {/* الرأس */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b8986a', background: 'rgba(184,152,106,0.1)', padding: '3px 10px', borderRadius: 20 }}>{p.type}</span>
            {p.is_featured && <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1e3a34', background: '#f0f4f2', padding: '3px 10px', borderRadius: 20, border: '1px solid rgba(30,58,52,0.15)' }}>⭐ مميز</span>}
            {p.is_new      && <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0d6832', background: '#e8f5e9', padding: '3px 10px', borderRadius: 20 }}>جديد</span>}
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e3a34', margin: '0 0 8px', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
            {p.title}
          </h3>

          <p style={{ fontSize: '0.82rem', color: '#7a9188', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>📍</span> {p.city}{p.district ? ` — ${p.district}` : ''}
          </p>

          {/* المواصفات */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {p.area        ? <Spec label={`${p.area} م²`} icon="📐" /> : null}
            {p.bedrooms >0 ? <Spec label={`${p.bedrooms} غرف`} icon="🛏️" /> : null}
            {p.bathrooms>0 ? <Spec label={`${p.bathrooms} حمام`} icon="🚿" /> : null}
            {p.has_pool    ? <Spec label="مسبح" icon="🏊" /> : null}
            {p.has_parking ? <Spec label="مواقف" icon="🚗" /> : null}
            {p.has_garden  ? <Spec label="حديقة" icon="🌿" /> : null}
          </div>
        </div>

        {/* السعر والأزرار */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', borderTop: '1px solid rgba(30,58,52,0.07)', paddingTop: 14 }}>

          <div>
            {isSold ? (
              <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '0.82rem', fontWeight: 800, padding: '5px 14px', borderRadius: 20 }}>تم البيع</span>
            ) : isAuction ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ background: '#1e3a34', color: '#f0c060', fontSize: '0.8rem', fontWeight: 800, padding: '4px 12px', borderRadius: 20 }}>
                  {p.price > 0 ? `وصل السوم: ${priceNum} ر` : 'على السوم'}
                </span>
                {bidPriceNum && <span style={{ fontSize: '0.72rem', color: '#b8986a', paddingRight: 4 }}>الحد: {bidPriceNum} ر</span>}
              </div>
            ) : isNegotiable ? (
              <span style={{ background: '#1e3a34', color: '#b8986a', fontSize: '0.82rem', fontWeight: 800, padding: '5px 14px', borderRadius: 20 }}>آخر سوم</span>
            ) : (
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e3a34' }}>{priceNum}</span>
                <span style={{ fontSize: '0.78rem', color: '#7a9188', marginRight: 4 }}>{p.price_unit}</span>
                {p.type === 'أرض' && p.price_per_meter && (
                  <div style={{ fontSize: '0.72rem', color: '#7a9e96', marginTop: 2 }}>
                    سعر المتر: <span style={{ color: '#b8986a', fontWeight: 700 }}>{new Intl.NumberFormat('ar-SA').format(p.price_per_meter)} ر/م²</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }} onClick={e => e.preventDefault()}>
            <a
              href={`https://wa.me/${p.whatsapp}?text=${encodeURIComponent('مرحبا، استفسر عن: ' + p.title)}`}
              target="_blank"
              style={{ background: '#25D366', color: '#fff', fontSize: '0.85rem', fontWeight: 700, padding: '8px 16px', borderRadius: 10, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              💬 واتساب
            </a>
            <span style={{ background: '#1e3a34', color: '#fff', fontSize: '0.85rem', fontWeight: 700, padding: '8px 16px', borderRadius: 10, cursor: 'pointer' }}>
              التفاصيل
            </span>
          </div>
        </div>
      </div>
    </a>
  )
}

function Spec({ icon, label }: { icon: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f0f4f2', color: '#3a5a54', fontSize: '0.78rem', fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>
      {icon} {label}
    </span>
  )
}
