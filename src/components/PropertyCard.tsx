'use client'
import { Property } from '@/lib/supabase'
import { useFavorites, useCompare } from '@/lib/favorites'

const ICONS: Record<string, string> = {
  'فيلا':'🏡','أرض':'🏗️','شقة':'🏢','استراحة':'🏖️',
  'دبلكس':'🏘️','محل تجاري':'🏪','مستودع':'🏭','مزرعة':'🌾','قصر':'🏰'
}

export default function PropertyCard({ property: p }: { property: Property }) {
  const price   = new Intl.NumberFormat('ar-SA').format(p.price)
  const img     = p.main_image || (p.images?.[0] ?? null)
  const favs    = useFavorites()
  const compare = useCompare()
  const isFav   = favs.has(p.id)
  const isCmp   = compare.has(p.id)

  return (
    <>
    <div
      onClick={() => window.location.href = `/properties/${p.id}`}
      className="bg-white border border-[#27423e]/10 rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:border-[#27423e]/25 transition-all duration-300 cursor-pointer slide-in"
      style={{ position:'relative' }}
    >
      {/* Image */}
      <div className="relative h-48 bg-[#d3e2dc] flex items-center justify-center overflow-hidden">
        {img ? (
          <img src={img} alt={p.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
        ) : (
          <span className="text-5xl opacity-20">{ICONS[p.type] || '🏠'}</span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a34]/60 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-md bg-[#d3e2dc] text-[#1e3a34]">{p.operation}</span>
          {p.is_featured && <span className="text-xs font-bold px-3 py-1 rounded-md bg-[#b8986a] text-[#1e3a34]">مميز</span>}
          {p.is_new      && <span className="text-xs font-bold px-3 py-1 rounded-md bg-[#d3e2dc] text-[#1e3a34]">جديد</span>}
        </div>

        {/* ❤️ Favorite + ⚖️ Compare buttons */}
        <div style={{ position:'absolute', top:10, left:10, display:'flex', flexDirection:'column', gap:6, zIndex:10 }}>
          <button
            onClick={e => { e.stopPropagation(); favs.toggle(p.id) }}
            title={isFav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            style={{ width:34, height:34, borderRadius:'50%', border:'none', background:isFav ? '#e74c3c' : 'rgba(255,255,255,0.85)', color:isFav ? '#fff' : '#666', fontSize:'1rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.2)', transition:'all 0.2s' }}>
            {isFav ? '❤️' : '🤍'}
          </button>
          <button
            onClick={e => { e.stopPropagation(); compare.toggle(p.id) }}
            title={isCmp ? 'إلغاء المقارنة' : 'إضافة للمقارنة'}
            style={{ width:34, height:34, borderRadius:'50%', border:'none', background:isCmp ? '#27423e' : 'rgba(255,255,255,0.85)', color:isCmp ? '#b8986a' : '#666', fontSize:'0.85rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.2)', transition:'all 0.2s', fontWeight:800 }}>
            ⚖️
          </button>
        </div>

        {/* Listing number */}
        {p.listing_number && (
          <div className="absolute bottom-3 left-3">
            <span style={{ background:'rgba(0,0,0,0.55)', color:'#b8986a', fontSize:'0.7rem', fontWeight:800, padding:'3px 9px', borderRadius:6, fontFamily:'monospace', backdropFilter:'blur(4px)' }}>
              #{p.listing_number}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <p className="text-xs text-[#2d5750] font-bold tracking-wider uppercase mb-1">{p.type}</p>
        <h3 className="font-amiri text-lg text-[#1e3a34] leading-snug mb-2 line-clamp-2">{p.title}</h3>
        <p className="text-xs text-[#7a9188] mb-4">📍 {p.city}{p.district ? ` — ${p.district}` : ''}</p>

        {/* Specs */}
        <div className="flex flex-wrap gap-3 py-3 border-t border-b border-[#27423e]/08 mb-4 text-xs text-[#7a9188]">
          {p.area       ? <span>📐 {p.area} م²</span>   : null}
          {p.bedrooms>0 ? <span>🛏️ {p.bedrooms} غرف</span> : null}
          {p.bathrooms>0? <span>🚿 {p.bathrooms} حمام</span>: null}
          {p.has_pool   && <span>🏊 مسبح</span>}
          {p.has_parking&& <span>🚗 مواقف</span>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="font-amiri text-xl text-[#1e3a34] font-bold">
            {price} <span className="text-xs font-normal text-[#7a9188]">{p.price_unit}</span>
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
    </>
  )
}