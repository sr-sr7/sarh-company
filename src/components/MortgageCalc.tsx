'use client'
import { useState } from 'react'

export default function MortgageCalc({ price }: { price: number }) {
  const [down,  setDown]  = useState(20)
  const [rate,  setRate]  = useState(4.5)
  const [years, setYears] = useState(20)

  const loan    = price * (1 - down / 100)
  const mRate   = rate / 100 / 12
  const n       = years * 12
  const monthly = mRate === 0
    ? loan / n
    : (loan * mRate * Math.pow(1 + mRate, n)) / (Math.pow(1 + mRate, n) - 1)

  const fmt = (v: number) =>
    isFinite(v) ? new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 0 }).format(v) : '—'

  const sl: React.CSSProperties = { width: '100%', accentColor: '#27423e', margin: '6px 0 0' }
  const row = (label: string, val: string) => (
    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.72rem', color:'#526266', fontWeight:700, marginBottom:2 }}>
      <span>{label}</span><span style={{ color:'#41646d' }}>{val}</span>
    </div>
  )

  return (
    <div style={{ background:'#fff', borderRadius:16, padding:'18px 20px', border:'1px solid rgba(39,66,62,0.08)', marginTop:16 }}>
      <h3 style={{ fontSize:'0.9rem', fontWeight:800, color:'#1e3a34', margin:'0 0 16px', display:'flex', alignItems:'center', gap:8 }}>
        🏦 حاسبة التمويل العقاري
      </h3>

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

        {/* Sliders */}
        <div>
          {row('الدفعة الأولى', `${down}%  —  ${fmt(price * down / 100)} ﷼`)}
          <input type="range" min={5} max={50} value={down} onChange={e => setDown(+e.target.value)} style={sl} />
        </div>
        <div>
          {row('نسبة الفائدة السنوية', `${rate}%`)}
          <input type="range" min={1} max={12} step={0.5} value={rate} onChange={e => setRate(+e.target.value)} style={sl} />
        </div>
        <div>
          {row('مدة التمويل', `${years} سنة`)}
          <input type="range" min={5} max={30} value={years} onChange={e => setYears(+e.target.value)} style={sl} />
        </div>

        {/* Result */}
        <div style={{ background:'linear-gradient(135deg,#1e3a34,#27423e)', borderRadius:12, padding:'14px', textAlign:'center' }}>
          <div style={{ fontSize:'0.65rem', color:'rgba(211,226,220,0.65)', marginBottom:4 }}>القسط الشهري التقريبي</div>
          <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#41646d' }}>{fmt(monthly)}</div>
          <div style={{ fontSize:'0.65rem', color:'rgba(211,226,220,0.65)', marginTop:2 }}>ريال / شهر</div>
        </div>

        {/* Summary */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {[
            { label:'قيمة القرض',        val: fmt(loan) },
            { label:'إجمالي المدفوعات', val: fmt(monthly * n) },
          ].map(({ label, val }) => (
            <div key={label} style={{ background:'#d3e2dc', borderRadius:8, padding:'8px', textAlign:'center' }}>
              <div style={{ fontWeight:800, color:'#27423e', fontSize:'0.78rem' }}>{val}</div>
              <div style={{ fontSize:'0.62rem', color:'#7a9188', marginTop:2 }}>{label}</div>
            </div>
          ))}
        </div>

        <p style={{ fontSize:'0.62rem', color:'#9aada7', textAlign:'center', lineHeight:1.5, margin:0 }}>
          * الأرقام تقريبية وليست عرضاً مالياً ملزماً
        </p>
      </div>
    </div>
  )
}
