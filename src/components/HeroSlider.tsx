'use client'
import { useEffect, useRef, useState } from 'react'

const SLIDES = [
  { bg: 'linear-gradient(135deg,#1e3a34 0%,#3a6b5e 100%)', label: 'فلل سكنية فاخرة' },
  { bg: 'linear-gradient(135deg,#2a4e60 0%,#1e3a34 100%)', label: 'أراضي استثمارية' },
  { bg: 'linear-gradient(135deg,#3d5a52 0%,#27423e 100%)', label: 'استراحات مجهزة'  },
  { bg: 'linear-gradient(135deg,#41646d 0%,#1e3a34 100%)', label: 'محلات تجارية'    },
]

export function HeroSlider() {
  const [cur, setCur] = useState(0)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const DURATION = 4000

  function goTo(n: number) {
    setCur((n + SLIDES.length) % SLIDES.length)
    setProgress(0)
  }

  useEffect(() => {
    setProgress(0)
    const start = Date.now()
    const frame = () => {
      const p = Math.min(((Date.now() - start) / DURATION) * 100, 100)
      setProgress(p)
      if (p < 100) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
    timerRef.current = setTimeout(() => goTo(cur + 1), DURATION)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [cur])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Slides */}
      {SLIDES.map((s, i) => (
        <div key={i} className="absolute inset-0 transition-opacity duration-[1200ms]"
          style={{ background: s.bg, opacity: i === cur ? 1 : 0 }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg,rgba(30,58,52,.88) 0%,rgba(30,58,52,.5) 55%,rgba(30,58,52,.15) 100%)' }} />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 px-16 max-w-2xl pt-20">
        <p className="text-xs tracking-[4px] uppercase text-[#d3e2dc]/75 mb-6 flex items-center gap-3">
          <span className="w-7 h-px bg-[#d3e2dc]/50 inline-block"></span>
          متخصصون في منطقة القصيم
        </p>
        <h1 className="font-amiri text-[clamp(46px,5.5vw,72px)] leading-[1.15] text-white mb-5">
          نبني أثرى<br/>
          <span className="text-[#d3e2dc]">تجربة حياتية</span><br/>
          في المملكة
        </h1>
        <p className="text-base leading-[1.9] text-[#d3e2dc]/70 max-w-lg mb-10">
          صرح العقارية تُعزز مسيرة التطور من خلال استثمارات الأراضي وتطويرها، لخلق مفاهيم عقارية تتميز بالتفرد والأصالة.
        </p>
        <div className="flex gap-4">
          <a href="/properties" className="bg-[#d3e2dc] text-[#1e3a34] px-8 py-3 rounded-lg font-bold text-sm hover:bg-white transition shadow-lg">تصفح العقارات</a>
          <a href="#contact" className="border border-white/30 text-white px-8 py-3 rounded-lg font-semibold text-sm hover:bg-white/10 transition">تواصل معنا</a>
        </div>
        <div className="flex gap-10 mt-14 pt-8 border-t border-white/12">
          {[['500+','عقار مُدرج'],['1200+','عميل راضٍ'],['12+','سنة خبرة']].map(([n,l])=>(
            <div key={l}>
              <div className="font-amiri text-4xl text-[#d3e2dc] leading-none">{n}</div>
              <div className="text-xs text-[#d3e2dc]/55 mt-1">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots — hidden */}

      {/* Arrows */}
      <div className="absolute bottom-8 right-16 z-10 flex gap-2">
        <button onClick={()=>goTo(cur-1)} className="w-10 h-10 bg-white/10 border border-white/18 rounded-lg text-white text-lg flex items-center justify-center hover:bg-white/20 transition cursor-pointer">→</button>
        <button onClick={()=>goTo(cur+1)} className="w-10 h-10 bg-white/10 border border-white/18 rounded-lg text-white text-lg flex items-center justify-center hover:bg-white/20 transition cursor-pointer">←</button>
      </div>

      {/* Slide label */}
      <div className="absolute bottom-10 left-16 z-10 text-xs tracking-[3px] uppercase text-white/40">
        {SLIDES[cur].label}
      </div>

      {/* Progress */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-10">
        <div className="h-full bg-[#d3e2dc] transition-none" style={{ width: `${progress}%` }} />
      </div>
    </section>
  )
}

export default HeroSlider

// ── SearchBar ────────────────────────────────────────
export function SearchBar() {
  const [form, setForm] = useState({ operation: '', type: '', city: '', search: '' })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (form.operation) params.set('operation', form.operation)
    if (form.type)      params.set('type', form.type)
    if (form.city)      params.set('city', form.city)
    if (form.search)    params.set('search', form.search)
    window.location.href = `/properties?${params.toString()}`
  }

  const selectCls = "flex-1 min-w-[150px] bg-[#d3e2dc] border border-[#27423e]/12 rounded-lg px-3 py-2.5 text-sm font-tajawal outline-none focus:border-[#41646d] appearance-none"

  return (
    <div className="px-16 -mt-9 relative z-10">
      <form onSubmit={handleSearch} className="bg-white border border-[#27423e]/12 rounded-xl px-7 py-5 flex gap-4 items-end flex-wrap shadow-lg shadow-[#27423e]/08">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[10px] uppercase tracking-wider text-[#7a9188] mb-2 font-semibold">نوع العملية</label>
          <select value={form.operation} onChange={e=>setForm(p=>({...p,operation:e.target.value}))} className={selectCls}>
            <option value="">الكل</option>
            {['للبيع','للإيجار','إيجار يومي','استثماري'].map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[10px] uppercase tracking-wider text-[#7a9188] mb-2 font-semibold">نوع العقار</label>
          <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} className={selectCls}>
            <option value="">جميع الأنواع</option>
            {['فيلا','أرض','شقة','استراحة','دبلكس','محل تجاري','مستودع','مزرعة'].map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[10px] uppercase tracking-wider text-[#7a9188] mb-2 font-semibold">المدينة</label>
          <select value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))} className={selectCls}>
            <option value="">كل المدن</option>
            {['الرياض','جدة','مكة المكرمة','المدينة المنورة','الدمام','الخبر','الظهران','القطيف','الأحساء','الطائف','تبوك','أبها','خميس مشيط','بريدة','عنيزة','الرس','البكيرية','المذنب','حائل','ينبع','نجران','جازان','الباحة','عرعر','سكاكا','الخرج','الدوادمي'].map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-[10px] uppercase tracking-wider text-[#7a9188] mb-2 font-semibold">بحث</label>
          <input value={form.search} onChange={e=>setForm(p=>({...p,search:e.target.value}))}
            placeholder="مثال: حي النزهة" className={selectCls + ' w-full'} />
        </div>
        <button type="submit" className="bg-[#27423e] text-[#d3e2dc] px-7 py-2.5 rounded-lg text-sm font-bold hover:bg-[#1e3a34] transition whitespace-nowrap">
          🔍 بحث
        </button>
      </form>
    </div>
  )
}
