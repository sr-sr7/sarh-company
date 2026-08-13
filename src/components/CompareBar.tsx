'use client'
import { useCompare } from '@/lib/favorites'

export default function CompareBar() {
  const { ids, clear } = useCompare()
  if (ids.length === 0) return null

  return (
    <div style={{
      position:'fixed', bottom:0, right:0, left:0, zIndex:9998,
      background:'linear-gradient(135deg,#1e3a34,#27423e)',
      color:'#f0f4f2', padding:'14px 24px',
      display:'flex', alignItems:'center', justifyContent:'center', gap:16,
      flexWrap:'wrap',
      boxShadow:'0 -4px 24px rgba(30,58,52,0.35)',
      fontFamily:"'Tajawal','Cairo',sans-serif",
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:'1.2rem' }}>⚖️</span>
        <span style={{ fontWeight:700, fontSize:'0.9rem' }}>
          {ids.length === 1 ? 'اختر عقاراً آخر للمقارنة' : 'جاهز للمقارنة!'}
        </span>
        <div style={{ display:'flex', gap:6 }}>
          {ids.map((id, i) => (
            <span key={id} style={{ background:'rgba(184,152,106,0.25)', border:'1px solid rgba(184,152,106,0.4)', borderRadius:8, padding:'4px 12px', fontSize:'0.78rem', color:'#b8986a', fontFamily:'monospace', fontWeight:700 }}>
              عقار {i + 1}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', gap:10 }}>
        {ids.length === 2 && (
          <a
            href={`/compare?ids=${ids.join(',')}`}
            style={{ background:'#b8986a', color:'#1e3a34', borderRadius:10, padding:'10px 24px', fontWeight:800, textDecoration:'none', fontSize:'0.9rem', whiteSpace:'nowrap' }}>
            قارن الآن ←
          </a>
        )}
        <button
          onClick={clear}
          style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', color:'#f0f4f2', borderRadius:10, padding:'10px 16px', fontWeight:700, cursor:'pointer', fontFamily:"'Tajawal','Cairo',sans-serif", fontSize:'0.85rem' }}>
          إلغاء ✕
        </button>
      </div>
    </div>
  )
}
