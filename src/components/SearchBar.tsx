'use client'
import { useState } from 'react'

const operations = ['للبيع', 'للإيجار', 'إيجار يومي']
const types = ['الكل', 'فيلا', 'شقة', 'أرض', 'استراحة', 'محل تجاري']
const cities = ['الكل', 'بريدة', 'عنيزة', 'الرس', 'البكيرية', 'المذنب']

export default function SearchBar() {
  const [op, setOp] = useState('للبيع')
  const [type, setType] = useState('الكل')
  const [city, setCity] = useState('الكل')

  function search(e: React.FormEvent) {
    e.preventDefault()
    const grid = document.getElementById('properties')
    if (grid) grid.scrollIntoView({ behavior: 'smooth' })
  }

  const selectCls = 'w-full bg-cream border border-ink/15 rounded-xl px-3 py-3 text-sm text-ink outline-none focus:border-ink/40 transition appearance-none font-tajawal'

  return (
    <section className="container-x -mt-8 md:-mt-14 relative z-10">
      <form onSubmit={search} className="bg-sand rounded-3xl p-4 md:p-6 border border-ink/10 shadow-sm">
        <div className="flex gap-1.5 bg-ink/5 rounded-xl p-1 mb-4">
          {operations.map(o => (
            <button key={o} type="button" onClick={() => setOp(o)} className={`flex-1 py-2.5 rounded-lg text-sm transition ${op === o ? 'bg-ink text-sand font-medium' : 'text-moss-500'}`}>{o}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-3">
          <div className="relative">
            <select value={type} onChange={e => setType(e.target.value)} className={selectCls}>
              {types.map(t => (<option key={t} value={t}>{t === 'الكل' ? 'نوع العقار' : t}</option>))}
            </select>
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
          </div>
          <div className="relative">
            <select value={city} onChange={e => setCity(e.target.value)} className={selectCls}>
              {cities.map(c => (<option key={c} value={c}>{c === 'الكل' ? 'المدينة' : c}</option>))}
            </select>
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
          </div>
          <input type="text" placeholder="ابحث بالحي أو الكلمة المفتاحية..." className="md:col-span-2 w-full bg-cream border border-ink/15 rounded-xl px-3 py-3 text-sm text-ink outline-none focus:border-ink/40 transition placeholder:text-moss-400" />
        </div>
        <button type="submit" className="w-full bg-ink text-sand py-3.5 rounded-xl text-sm font-medium hover:bg-ink-900 transition flex items-center justify-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          ابحث عن عقارك
        </button>
      </form>
    </section>
  )
}
