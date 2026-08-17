'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LOGO_GIF } from '@/lib/logo'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim() || !password.trim()) { setError('أدخل اسم المستخدم وكلمة المرور'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'بيانات الدخول غير صحيحة'); return }
      router.replace('/admin')
    } catch {
      setError('حدث خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#1e3a34,#27423e)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Tajawal','Cairo',sans-serif", direction:'rtl', padding:20 }}>
      <div style={{ background:'#f4ede4', borderRadius:20, padding:'40px 36px', width:'100%', maxWidth:400, boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>

        <div style={{ textAlign:'center', marginBottom:32 }}>
          <img src={LOGO_GIF} alt="صرح" width={56} height={56} style={{ borderRadius:10, marginBottom:12 }} />
          <div style={{ fontSize:'1.3rem', fontWeight:800, color:'#1e3a34' }}>صرح <span style={{ color:'#41646d' }}>العقارية</span></div>
          <div style={{ fontSize:'0.72rem', color:'#9aada7', letterSpacing:2, marginTop:4 }}>لوحة التحكم</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div>
            <label style={{ fontSize:'0.78rem', color:'#526266', fontWeight:600, display:'block', marginBottom:6 }}>اسم المستخدم</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              autoFocus
              style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:'1.5px solid #d3e2dc', fontSize:'0.95rem', outline:'none', fontFamily:'Tajawal', boxSizing:'border-box', background:'#f8fbfa', color:'#1e3a34' }}
            />
          </div>
          <div>
            <label style={{ fontSize:'0.78rem', color:'#526266', fontWeight:600, display:'block', marginBottom:6 }}>كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:'1.5px solid #d3e2dc', fontSize:'0.95rem', outline:'none', fontFamily:'Tajawal', boxSizing:'border-box', background:'#f8fbfa', color:'#1e3a34' }}
            />
          </div>

          {error && (
            <div style={{ background:'#fff0f0', border:'1px solid #fecaca', borderRadius:8, padding:'9px 12px', fontSize:'0.82rem', color:'#cc0000' }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ background: loading ? '#a0b8b4' : 'linear-gradient(135deg,#27423e,#1e3a34)', color:'#fff', border:'none', borderRadius:10, padding:'13px', fontSize:'0.95rem', fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'Tajawal', marginTop:4 }}>
            {loading ? '⏳ جاري...' : '🔑 دخول'}
          </button>
        </form>

        <div style={{ textAlign:'center', marginTop:20 }}>
          <a href="/" style={{ color:'#9aada7', fontSize:'0.8rem', textDecoration:'none' }}>← العودة للموقع</a>
        </div>
      </div>
    </div>
  )
}
