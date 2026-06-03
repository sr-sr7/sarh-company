'use client'
import { useEffect, useState } from 'react'
import { Property, SB_URL, SB_HEADERS } from '@/lib/supabase'

export default function PropertyModal({ id, onClose }: { id: string; onClose: () => void }) {
  const [p, setP] = useState<Property | null>(null)

  // Lock background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    fetch(`${SB_URL}/rest/v1/properties?id=eq.${id}&select=*`, { headers: SB_HEADERS })
      .then(r => r.ok ? r.json() : [])
      .then((data: Property[]) => { if (data[0]) setP(data[0]); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  const price = p ? new Intl.NumberFormat('ar-SA').format(p.price) : ''
  const images = p ? [p.main_image, ...(p.images || [])].filter(Boolean) as string[] : []

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxHeight: '92vh', overflowY: 'auto',
          background: '#f4ede4', borderRadius: '20px 20px 0 0',
          padding: '0 0 40px', direction: 'rtl',
          animation: 'slideUp 0.3s ease',
        }}
      >
        <style>{`@keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }`}</style>

        {/* Header */}
        <div style={{ position: 'sticky', top: 0, background: '#f4ede4', padding: '16px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, borderBottom: '1px solid rgba(30,58,52,0.1)' }}>
          <button onClick={onClose} style={{ background: 'rgba(30,58,52,0.08)', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: '0.9rem', cursor: 'pointer', color: '#1e3a34', fontFamily: 'Tajawal,sans-serif' }}>✕ إغلاق</button>
          {p && <span style={{ fontSize: '0.75rem', color: '#7a9188', fontFamily: 'Tajawal,sans-serif' }}>#{p.listing_number}</span>}
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#7a9188', fontFamily: 'Tajawal,sans-serif' }}>جاري التحميل...</div>
        ) : !p ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#7a9188', fontFamily: 'Tajawal,sans-serif' }}>لم يتم العثور على العقار</div>
        ) : (
          <>
            {/* Images */}
            {images.length > 0 && (
              <div style={{ position: 'relative', height: 240, overflow: 'hidden' }}>
                <img src={images[activeImg]} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {images.length > 1 && (
                  <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setActiveImg(i)} style={{ width: i === activeImg ? 20 : 8, height: 8, borderRadius: 4, border: 'none', background: i === activeImg ? '#b8986a' : 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 0, transition: 'all 0.3s' }} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <div style={{ padding: '20px 20px 0' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{ background: '#d3e2dc', color: '#1e3a34', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: 8 }}>{p.type}</span>
                <span style={{ background: '#d3e2dc', color: '#1e3a34', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: 8 }}>{p.operation}</span>
                {p.is_featured && <span style={{ background: '#b8986a', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: 8 }}>مميز</span>}
              </div>

              <h2 style={{ fontFamily: 'Amiri,serif', fontSize: '1.4rem', color: '#1e3a34', marginBottom: 8 }}>{p.title}</h2>
              <p style={{ color: '#7a9188', fontSize: '0.85rem', marginBottom: 16, fontFamily: 'Tajawal,sans-serif' }}>📍 {p.city}{p.district ? ` — ${p.district}` : ''}</p>

              <div style={{ fontSize: '1.8rem', fontFamily: 'Amiri,serif', color: '#1e3a34', fontWeight: 700, marginBottom: 20 }}>
                {price} <span style={{ fontSize: '0.85rem', color: '#7a9188', fontWeight: 400 }}>{p.price_unit}</span>
              </div>

              {/* Specs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: '16px 0', borderTop: '1px solid rgba(30,58,52,0.1)', borderBottom: '1px solid rgba(30,58,52,0.1)', marginBottom: 20 }}>
                {p.area       && <span style={{ fontSize: '0.85rem', color: '#4a7a72', fontFamily: 'Tajawal,sans-serif' }}>📐 {p.area} م²</span>}
                {p.bedrooms>0 && <span style={{ fontSize: '0.85rem', color: '#4a7a72', fontFamily: 'Tajawal,sans-serif' }}>🛏️ {p.bedrooms} غرف</span>}
                {p.bathrooms>0&& <span style={{ fontSize: '0.85rem', color: '#4a7a72', fontFamily: 'Tajawal,sans-serif' }}>🚿 {p.bathrooms} حمام</span>}
                {p.maid_rooms && p.maid_rooms>0 && <span style={{ fontSize: '0.85rem', color: '#4a7a72', fontFamily: 'Tajawal,sans-serif' }}>🧹 {p.maid_rooms} غرفة خادمة</span>}
                {p.kitchens   && p.kitchens>0   && <span style={{ fontSize: '0.85rem', color: '#4a7a72', fontFamily: 'Tajawal,sans-serif' }}>🍳 {p.kitchens} مطبخ</span>}
                {p.has_pool    && <span style={{ fontSize: '0.85rem', color: '#4a7a72', fontFamily: 'Tajawal,sans-serif' }}>🏊 مسبح</span>}
                {p.has_parking && <span style={{ fontSize: '0.85rem', color: '#4a7a72', fontFamily: 'Tajawal,sans-serif' }}>🚗 مواقف</span>}
                {p.has_garden  && <span style={{ fontSize: '0.85rem', color: '#4a7a72', fontFamily: 'Tajawal,sans-serif' }}>🌿 حديقة</span>}
                {p.has_annex   && <span style={{ fontSize: '0.85rem', color: '#4a7a72', fontFamily: 'Tajawal,sans-serif' }}>🏠 ملحق</span>}
              </div>

              {/* Description */}
              {p.description && (
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ color: '#1e3a34', fontSize: '1rem', fontFamily: 'Tajawal,sans-serif', marginBottom: 8 }}>الوصف</h3>
                  <p style={{ color: '#4a7a72', fontSize: '0.9rem', lineHeight: 1.8, fontFamily: 'Tajawal,sans-serif' }}>{p.description}</p>
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <a
                  href={`https://wa.me/${p.whatsapp}?text=${encodeURIComponent('مرحبا استفسر عن عقار رقم ' + (p.listing_number ?? p.id))}`}
                  target="_blank"
                  style={{ flex: 1, background: '#25D366', color: '#fff', textAlign: 'center', padding: '14px', borderRadius: 12, fontFamily: 'Tajawal,sans-serif', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}
                >
                  💬 تواصل واتساب
                </a>
                <a
                  href={`tel:${p.whatsapp}`}
                  style={{ flex: 1, background: '#1e3a34', color: '#b8986a', textAlign: 'center', padding: '14px', borderRadius: 12, fontFamily: 'Tajawal,sans-serif', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}
                >
                  📞 اتصال
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
