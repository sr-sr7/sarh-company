'use client'
import React from 'react'
import Image from 'next/image'
import { Property } from '@/lib/supabase'
import { useFavorites, useCompare } from '@/lib/favorites'

// ── Inline SVG icons — no HTTP requests ───────────────────────
const SV: Record<string, React.ReactNode> = {
  house:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  apt:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22V12h6v10M8 6h.01M12 6h.01M16 6h.01M8 10h.01M16 10h.01"/></svg>,
  land:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 15l5-5 4 4 3-3 6 6"/></svg>,
  rest:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l4-8 5 6 3-4 6 6"/><path d="M3 21h18"/></svg>,
  farm:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7z"/><circle cx="12" cy="9" r="2.5"/></svg>,
  commercial: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v11a1 1 0 01-1 1H4a1 1 0 01-1-1V9z"/><path d="M3 9l2.5-5h13L21 9"/><path d="M9 22V13h6v9"/></svg>,
  map:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7"/></svg>,
  area:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg>,
  bed:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 20V10a2 2 0 012-2h14a2 2 0 012 2v10M3 20h18M3 12h18M7 8V6a1 1 0 011-1h8a1 1 0 011 1v2"/></svg>,
  bath:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16v3a4 4 0 01-4 4H8a4 4 0 01-4-4v-3z"/><path d="M6 12V5a2 2 0 012-2h1v2"/><path d="M4 19l-1 2M20 19l1 2"/></svg>,
  pool:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><circle cx="7" cy="7" r="2"/><path d="M7 5V2"/></svg>,
  parking:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 010 6H9"/></svg>,
  garden:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12M12 12C12 12 7 9 7 4a5 5 0 0110 0c0 5-5 8-5 8z"/><path d="M8 22h8"/></svg>,
  whatsapp:   <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.004 2C6.479 2 2 6.478 2 12.004c0 1.85.484 3.584 1.332 5.09L2.05 21.95l4.945-1.297A10.01 10.01 0 0012.004 22C17.53 22 22 17.522 22 12.004 22 6.479 17.53 2 12.004 2zm0 18.371a8.322 8.322 0 01-4.246-1.16l-.305-.18-3.151.828.843-3.065-.2-.32a8.32 8.32 0 01-1.278-4.47c0-4.6 3.742-8.343 8.337-8.343 4.593 0 8.335 3.742 8.335 8.343 0 4.6-3.742 8.367-8.335 8.367z"/></svg>,
}

const TYPE_ICON: Record<string, keyof typeof SV> = {
  'فيلا': 'house', 'شقة': 'apt', 'عمارة': 'apt', 'دبلكس': 'apt',
  'وحدة علوية': 'apt', 'وحدة أرضية': 'apt', 'دور علوي': 'apt', 'دور أرضي': 'apt',
  'أرض': 'land', 'استراحة': 'rest', 'شاليه': 'rest',
  'مزرعة': 'farm', 'تجاري': 'commercial', 'محل': 'commercial',
  'محل تجاري': 'commercial', 'مستودع': 'commercial',
}

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
      className="sarh-card"
      style={{
        display: 'flex',
        background: '#f4ede4',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(30,58,52,0.09)',
        boxShadow: '0 2px 12px rgba(30,58,52,0.06)',
        textDecoration: 'none',
        transition: 'box-shadow 0.2s, transform 0.2s',
        direction: 'rtl',
        height: 220,
        width: '100%',
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
      <div className="sarh-card-img" style={{ position: 'relative', width: 220, minWidth: 220, alignSelf: 'stretch', background: '#d3e2dc', flexShrink: 0 }}>
        {img ? (
          <Image src={img} alt={p.title} fill sizes="220px"
            style={{ objectFit: 'cover' }} />
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
            <img src="/sold-stamp.svg" alt="تم البيع" width={110} height={110} style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }} />
          </div>
        )}

        {/* رقم القائمة */}
        {p.listing_number && (
          <span style={{
            position: 'absolute', bottom: 10, left: 10,
            background: 'rgba(0,0,0,0.55)', color: '#41646d',
            fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px',
            borderRadius: 6, fontFamily: 'monospace', backdropFilter: 'blur(4px)',
          }}>#{p.listing_number}</span>
        )}
      </div>

      {/* التفاصيل */}
      <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0, overflow: 'hidden' }}>

        {/* الرأس */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize: '0.72rem', fontWeight: 700, color: '#41646d', background: 'rgba(65,100,109,0.1)', padding: '3px 10px', borderRadius: 20 }}>
              {TYPE_ICON[p.type] && <BIcon name={TYPE_ICON[p.type]} size={14} />}{p.type}
            </span>
            {p.is_new      && <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0d6832', background: '#e8f5e9', padding: '3px 10px', borderRadius: 20 }}>جديد</span>}
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e3a34', margin: '0 0 8px', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
            {p.title}
          </h3>

          <p style={{ fontSize: '0.82rem', color: '#7a9188', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <BIcon name="map" /> {p.city}{p.district ? ` — ${p.district}` : ''}
          </p>

          {/* المواصفات */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {p.area        ? <Spec label={`${p.area} م²`} icon="area" /> : null}
            {p.bedrooms >0 ? <Spec label={`${p.bedrooms} غرف`} icon="bed" /> : null}
            {p.bathrooms>0 ? <Spec label={`${p.bathrooms} حمام`} icon="bath" /> : null}
            {p.has_pool    ? <Spec label="مسبح" icon="pool" /> : null}
            {p.has_parking ? <Spec label="مواقف" icon="parking" /> : null}
            {p.has_garden  ? <Spec label="حديقة" icon="garden" /> : null}
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
                {bidPriceNum && <span style={{ fontSize: '0.72rem', color: '#41646d', paddingRight: 4 }}>الحد: {bidPriceNum} ر</span>}
              </div>
            ) : isNegotiable ? (
              <span style={{ background: '#1e3a34', color: '#41646d', fontSize: '0.82rem', fontWeight: 800, padding: '5px 14px', borderRadius: 20 }}>آخر سوم</span>
            ) : (
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e3a34' }}>{priceNum}</span>
                <span style={{ fontSize: '0.78rem', color: '#7a9188', marginRight: 4 }}>{p.price_unit}</span>
                {p.type === 'أرض' && p.price_per_meter && (
                  <div style={{ fontSize: '0.72rem', color: '#7a9e96', marginTop: 2 }}>
                    سعر المتر: <span style={{ color: '#41646d', fontWeight: 700 }}>{new Intl.NumberFormat('ar-SA').format(p.price_per_meter)} ر/م²</span>
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
              <BIcon name="whatsapp" size={18} /> واتساب
            </a>
          </div>
        </div>
      </div>
    </a>
  )
}

function BIcon({ name, size = 18 }: { name: keyof typeof SV; size?: number }) {
  return (
    <span style={{ display:'inline-flex', flexShrink:0, width:size, height:size, verticalAlign:'middle' }}>
      {React.cloneElement(SV[name] as React.ReactElement, { width: size, height: size })}
    </span>
  )
}

function Spec({ icon, label }: { icon: keyof typeof SV; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#d3e2dc', color: '#3a5a54', fontSize: '0.78rem', fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>
      <BIcon name={icon} size={16} /> {label}
    </span>
  )
}

