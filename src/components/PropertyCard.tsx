import Image from 'next/image'
import type { Property } from '@/lib/supabase'

const fmt = new Intl.NumberFormat('ar-SA')

export default function PropertyCard({ property: p }: { property: Property }) {
  const opColor = p.operation === 'للبيع' ? 'bg-ink' : p.operation === 'للإيجار' ? 'bg-moss-600' : 'bg-[#2d7d5a]'
  const fallback = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80'

  return (
    <article className="bg-white rounded-2xl overflow-hidden border border-ink/10 hover:border-ink/25 transition group">
      <a href={`/property/${p.id}`} className="block">
        <div className="relative aspect-[4/3] bg-sand overflow-hidden">
          <Image src={p.main_image || fallback} alt={p.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition duration-500" />
          <div className={`absolute top-3 right-3 ${opColor} text-sand text-[10px] px-3 py-1 rounded-full font-medium`}>{p.operation}</div>
          {p.is_featured && (<div className="absolute top-3 left-3 bg-cream/95 backdrop-blur text-ink text-[10px] px-3 py-1 rounded-full font-medium border border-ink/10">مميز</div>)}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-ink text-base mb-1 line-clamp-1">{p.title}</h3>
          <div className="flex items-center gap-1 text-xs text-moss-500 mb-3">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            <span>{p.city}{p.district ? ` — ${p.district}` : ''}</span>
          </div>
          <div className="flex items-center gap-4 pb-3 mb-3 border-b border-ink/10 text-xs text-moss-500">
            {p.bedrooms > 0 && (<span className="inline-flex items-center gap-1"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 8v12M22 8v12M2 14h20M2 8c0-2 1-3 3-3h14c2 0 3 1 3 3" /></svg>{p.bedrooms}</span>)}
            {p.bathrooms > 0 && (<span className="inline-flex items-center gap-1"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12h18M5 12V7a3 3 0 0 1 6 0M3 12v3a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4v-3" /></svg>{p.bathrooms}</span>)}
            {p.area && (<span className="inline-flex items-center gap-1"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>{p.area} م²</span>)}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-amiri text-xl text-ink-700 font-medium leading-none">{fmt.format(p.price)}</div>
              <div className="text-[10px] text-moss-500 mt-1">{p.price_unit}</div>
            </div>
            <div className="flex gap-2">
              <a href={`https://wa.me/${p.whatsapp}?text=${encodeURIComponent(`أهتم بالعقار: ${p.title}`)}`} onClick={e => e.stopPropagation()} target="_blank" rel="noopener" className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center hover:scale-110 transition" aria-label="واتساب"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487" /></svg></a>
              <div className="w-9 h-9 rounded-full bg-ink flex items-center justify-center group-hover:bg-ink-900 transition"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f4ede4" strokeWidth="2"><path d="M5 12h14M12 5l-7 7 7 7" /></svg></div>
            </div>
          </div>
        </div>
      </a>
    </article>
  )
}
