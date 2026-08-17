'use client'
import { useEffect, useState } from 'react'

export default function WaterDropIntro() {
  const [phase, setPhase] = useState<'drop'|'ripple'|'expand'|'done'>('drop')

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem('sarh_intro_done')) {
      setPhase('done')
      return
    }
    // drop falls → ripple → expand to cover → reveal
    const t1 = setTimeout(() => setPhase('ripple'),  700)
    const t2 = setTimeout(() => setPhase('expand'),  1100)
    const t3 = setTimeout(() => {
      setPhase('done')
      sessionStorage.setItem('sarh_intro_done', '1')
    }, 1900)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  if (phase === 'done') return null

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:99999,
      display:'flex', alignItems:'center', justifyContent:'center',
      background:'#d3e2dc',
      pointerEvents: 'all',
    }}>
      <style>{`
        @keyframes dropFall {
          0%   { transform: translateY(-120px) scale(1);   opacity:0; }
          40%  { transform: translateY(-8px)   scale(1);   opacity:1; }
          60%  { transform: translateY(0px)    scale(1.1); opacity:1; }
          80%  { transform: translateY(-4px)   scale(0.9); opacity:1; }
          100% { transform: translateY(0px)    scale(1);   opacity:1; }
        }
        @keyframes ripple1 {
          0%   { transform:scale(0);   opacity:0.5; }
          100% { transform:scale(8);   opacity:0; }
        }
        @keyframes ripple2 {
          0%   { transform:scale(0);   opacity:0.35; }
          100% { transform:scale(12);  opacity:0; }
        }
        @keyframes coverExpand {
          0%   { clip-path: circle(0% at 50% 50%);   }
          100% { clip-path: circle(150% at 50% 50%); }
        }
      `}</style>

      {/* القطرة */}
      {(phase === 'drop' || phase === 'ripple') && (
        <div style={{
          position:'relative',
          animation: 'dropFall 0.7s cubic-bezier(0.25,0.8,0.25,1) forwards',
        }}>
          <svg width="52" height="68" viewBox="0 0 52 68" fill="none">
            <path d="M26 2 C26 2 4 28 4 42 C4 55 14 66 26 66 C38 66 48 55 48 42 C48 28 26 2 26 2Z"
              fill="url(#dropGrad)" />
            <defs>
              <linearGradient id="dropGrad" x1="26" y1="2" x2="26" y2="66" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#2d5a4e" />
                <stop offset="100%" stopColor="#1e3a34" />
              </linearGradient>
            </defs>
          </svg>
          {/* بريق داخل القطرة */}
          <div style={{
            position:'absolute', top:14, right:14,
            width:8, height:8, borderRadius:'50%',
            background:'rgba(255,255,255,0.4)',
          }} />
        </div>
      )}

      {/* التموجات */}
      {phase === 'ripple' && (
        <>
          <div style={{
            position:'absolute', width:80, height:80, borderRadius:'50%',
            border:'2px solid rgba(30,58,52,0.35)',
            animation:'ripple1 0.45s ease-out forwards',
          }} />
          <div style={{
            position:'absolute', width:80, height:80, borderRadius:'50%',
            border:'2px solid rgba(30,58,52,0.2)',
            animation:'ripple2 0.55s ease-out 0.06s forwards',
          }} />
        </>
      )}

      {/* التمدد ليغطي الشاشة */}
      {phase === 'expand' && (
        <div style={{
          position:'absolute', inset:0,
          background:'linear-gradient(160deg, #1e3a34, #2d5a4e)',
          animation:'coverExpand 0.75s cubic-bezier(0.4,0,0.2,1) forwards',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <div style={{
            textAlign:'center', color:'#fff',
            animation:'dropFall 0.4s ease 0.2s both',
          }}>
            <img src="/icon-192.png" alt="صرح" style={{ width:64, height:64, borderRadius:16, marginBottom:14, boxShadow:'0 8px 32px rgba(0,0,0,0.3)' }} />
            <div style={{ fontSize:'1.3rem', fontWeight:900, fontFamily:'Tajawal,sans-serif', letterSpacing:1 }}>
              صرح العقارية
            </div>
            <div style={{ fontSize:'0.75rem', color:'rgba(211,226,220,0.6)', marginTop:6, fontFamily:'Tajawal,sans-serif' }}>
              القصيم — بريدة
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
