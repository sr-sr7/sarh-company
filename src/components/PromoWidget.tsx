'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

const PROPERTY_TYPES = ['فيلا','أرض','شقة','استراحة','دبلكس','مستودع','مزرعة','قصر','تجاري','أخرى']

export default function PromoWidget() {
  const pathname = usePathname()
  const [open, setOpen]         = useState(false)
  const [name, setName]         = useState('')
  const [phone, setPhone]       = useState('')
  const [propType, setPropType] = useState('')
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim() || !propType) {
      setError('الرجاء تعبئة جميع الحقول')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/public/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), property_type: propType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'حدث خطأ')
      setDone(true)
      setName(''); setPhone(''); setPropType('')
    } catch {
      setError('حدث خطأ، حاول مرة أخرى')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setOpen(false)
    setTimeout(() => { setDone(false); setError('') }, 400)
  }

  if (pathname?.startsWith('/admin')) return null

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 11px', borderRadius: 9,
    border: '1.5px solid #d3e2dc', fontSize: '0.88rem',
    fontFamily: 'Tajawal,sans-serif', color: '#1e3a34',
    outline: 'none', boxSizing: 'border-box', background: '#f8fbfa',
  }

  if (pathname === '/maintenance') return null

  return (
    <>
      {open && (
        <div onClick={handleClose} style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)',
        }} />
      )}

      <div style={{
        position: 'fixed', left: 14, bottom: 90, zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', direction: 'rtl',
      }}>

        {/* Panel */}
        {open && (
          <div style={{
            marginBottom: 10, width: 280, background: '#fff',
            borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            animation: 'promoSlideUp 0.25s ease',
          }}>
            <div style={{ padding: '18px 16px', fontFamily: 'Tajawal,sans-serif', direction: 'rtl' }}>

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e3a34' }}>🏡 تسويق عقارك معنا</div>
                  <div style={{ fontSize: '0.73rem', color: '#7a9490', marginTop: 2 }}>سجّل بياناتك وسنتواصل معك</div>
                </div>
                <button onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', color: '#9aada7', padding: 4 }}>✕</button>
              </div>

              {done ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#27423e', marginBottom: 4 }}>تم استلام طلبك!</div>
                  <div style={{ fontSize: '0.78rem', color: '#7a9490', lineHeight: 1.7 }}>سيتواصل معك فريق صرح العقارية قريباً.</div>
                  <button onClick={handleClose} style={{ marginTop: 12, background: '#27423e', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 22px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>حسناً</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#526266', fontWeight: 600, display: 'block', marginBottom: 4 }}>الاسم *</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="أدخل اسمك" style={inputStyle} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#526266', fontWeight: 600, display: 'block', marginBottom: 4 }}>رقم الجوال *</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder="05XXXXXXXX" dir="ltr"
                      style={{ ...inputStyle, textAlign: 'left' as const }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#526266', fontWeight: 600, display: 'block', marginBottom: 4 }}>نوع العقار *</label>
                    <select value={propType} onChange={e => setPropType(e.target.value)}
                      style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="">اختر نوع العقار</option>
                      {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {error && (
                    <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: 7, padding: '7px 10px', fontSize: '0.77rem', color: '#cc0000' }}>
                      ⚠️ {error}
                    </div>
                  )}

                  <button type="submit" disabled={loading} style={{
                    background: loading ? '#a0b8b4' : 'linear-gradient(135deg,#27423e,#1e3a34)',
                    color: '#fff', border: 'none', borderRadius: 9, padding: '10px',
                    fontSize: '0.88rem', fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'Tajawal,sans-serif', marginTop: 2,
                  }}>
                    {loading ? '⏳ جاري الإرسال...' : '📩 أرسل طلبك'}
                  </button>

                  <p style={{ fontSize: '0.68rem', color: '#adbfbb', textAlign: 'center' as const, margin: 0 }}>
                    بياناتك محفوظة ولن تُشارك مع أي طرف
                  </p>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Balloon button */}
        <button
          onClick={() => { setOpen(o => !o); setDone(false); setError('') }}
          title="تسويق عقارك معنا"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
        >
          {!open && (
            <span style={{
              position: 'absolute', top: 4, right: 4,
              width: 9, height: 9, borderRadius: '50%',
              background: '#ff4d4d',
              boxShadow: '0 0 0 0 rgba(255,77,77,0.5)',
              animation: 'promoPulse 1.8s infinite',
            }} />
          )}
          <svg width="46" height="58" viewBox="0 0 46 58" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0 4px 10px rgba(65,100,109,0.5))', transition: 'transform 0.2s' }}>
            <ellipse cx="23" cy="20" rx="18" ry="20" fill="url(#balloonGrad)" />
            <ellipse cx="16" cy="12" rx="5" ry="7" fill="rgba(255,255,255,0.28)" transform="rotate(-20 16 12)" />
            <path d="M23 40 C21 42 25 44 23 46" stroke="#9a7d52" strokeWidth="1.5" fill="none" />
            <path d="M23 46 C20 50 26 52 23 58" stroke="#41646d" strokeWidth="1.2" fill="none" strokeDasharray="2 1" />
            <defs>
              <linearGradient id="balloonGrad" x1="5" y1="0" x2="41" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#d4aa70" />
                <stop offset="100%" stopColor="#41646d" />
              </linearGradient>
            </defs>
          </svg>
          <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#9a7d52', fontFamily: 'Tajawal,sans-serif', marginTop: -4, letterSpacing: 0.5 }}>
            طلباتك وتسويق عقارك
          </span>
        </button>

      </div>

      <style>{`
        @keyframes promoPulse {
          0%   { box-shadow: 0 0 0 0 rgba(255,77,77,0.55); }
          70%  { box-shadow: 0 0 0 8px rgba(255,77,77,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,77,77,0); }
        }
        @keyframes promoSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
