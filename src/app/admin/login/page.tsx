'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LOGO_GIF } from '@/lib/logo'
import { SB_URL, SB_KEY, SB_HEADERS } from '@/lib/supabase'

const H = SB_HEADERS

async function sha256(msg: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername]   = useState('')
  const [password, setPassword]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [isSetup, setIsSetup]     = useState(false)
  const [checking, setChecking]   = useState(true)

  useEffect(() => {
    // إذا عنده جلسة نشطة → انتقل مباشرة
    try {
      const s = JSON.parse(localStorage.getItem('sarh_session') || '{}')
      if (s.expires && s.expires > Date.now()) { router.replace('/admin'); return }
    } catch {}
    checkFirstRun()
  }, [])

  async function checkFirstRun() {
    try {
      const res = await fetch(`${SB_URL}/rest/v1/admin_users?select=id&limit=1`, { headers: H })
      const data = await res.json()
      setIsSetup(!Array.isArray(data) || data.length === 0)
    } catch { setIsSetup(false) }
    setChecking(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim() || !password.trim()) { setError('أدخل اسم المستخدم وكلمة المرور'); return }
    setLoading(true); setError('')
    try {
      const hash = await sha256(password)
      if (isSetup) {
        // إنشاء حساب الأدمن أول مرة
        const res = await fetch(`${SB_URL}/rest/v1/admin_users`, {
          method: 'POST',
          headers: { ...H, 'content-type': 'application/json', 'prefer': 'return=representation' },
          body: JSON.stringify({ username: username.trim(), password_hash: hash, role: 'admin', permissions: { all: true } })
        })
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        storeSession(data[0] || { username: username.trim(), role: 'admin', permissions: { all: true } })
        router.replace('/admin')
      } else {
        // تسجيل دخول عادي
        const res = await fetch(
          `${SB_URL}/rest/v1/admin_users?username=eq.${encodeURIComponent(username.trim())}&select=*`,
          { headers: H }
        )
        const data = await res.json()
        if (!Array.isArray(data) || data.length === 0) { setError('اسم المستخدم غير موجود'); setLoading(false); return }
        const user = data[0]
        if (user.password_hash !== hash) { setError('كلمة المرور غير صحيحة'); setLoading(false); return }
        storeSession(user)
        router.replace('/admin')
      }
    } catch (err: any) {
      setError('حدث خطأ: ' + err.message)
    }
    setLoading(false)
  }

  function storeSession(user: any) {
    localStorage.setItem('sarh_session', JSON.stringify({
      username: user.username,
      role: user.role,
      permissions: user.permissions || {},
      userId: user.id,
      expires: Date.now() + 24 * 60 * 60 * 1000,
    }))
  }

  if (checking) return (
    <div style={{ minHeight:'100vh', background:'#1e3a34', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'#d3e2dc', fontFamily:'Tajawal', fontSize:'1rem' }}>جاري التحميل...</div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#1e3a34,#27423e)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Tajawal','Cairo',sans-serif", direction:'rtl', padding:20 }}>
      <div style={{ background:'#fff', borderRadius:20, padding:'40px 36px', width:'100%', maxWidth:400, boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <img src={LOGO_GIF} alt="صرح" width={56} height={56} style={{ borderRadius:10, marginBottom:12 }} />
          <div style={{ fontSize:'1.3rem', fontWeight:800, color:'#1e3a34' }}>صرح <span style={{ color:'#b8986a' }}>العقارية</span></div>
          <div style={{ fontSize:'0.72rem', color:'#9aada7', letterSpacing:2, marginTop:4 }}>
            {isSetup ? 'إنشاء حساب الأدمن' : 'لوحة التحكم'}
          </div>
        </div>

        {isSetup && (
          <div style={{ background:'#fff8e6', border:'1px solid #f0d080', borderRadius:10, padding:'10px 14px', marginBottom:20, fontSize:'0.82rem', color:'#7a5a00' }}>
            🔐 أول تسجيل — أنشئ حساب الأدمن الخاص بك
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div>
            <label style={{ fontSize:'0.78rem', color:'#526266', fontWeight:600, display:'block', marginBottom:6 }}>اسم المستخدم</label>
            <input
              value={username} onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:'1.5px solid #d3e2dc', fontSize:'0.95rem', outline:'none', fontFamily:'Tajawal', boxSizing:'border-box', background:'#f8fbfa', color:'#1e3a34' }}
            />
          </div>
          <div>
            <label style={{ fontSize:'0.78rem', color:'#526266', fontWeight:600, display:'block', marginBottom:6 }}>
              {isSetup ? 'الرقم السري (حدده أنت)' : 'الرقم السري'}
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:'1.5px solid #d3e2dc', fontSize:'0.95rem', outline:'none', fontFamily:'Tajawal', boxSizing:'border-box', background:'#f8fbfa', color:'#1e3a34' }}
            />
          </div>

          {error && (
            <div style={{ background:'#fff0f0', border:'1px solid #fecaca', borderRadius:8, padding:'9px 12px', fontSize:'0.82rem', color:'#cc0000' }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ background: loading ? '#a0b8b4' : 'linear-gradient(135deg,#27423e,#1e3a34)', color:'#fff', border:'none', borderRadius:10, padding:'13px', fontSize:'0.95rem', fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'Tajawal', marginTop:4 }}>
            {loading ? '⏳ جاري...' : isSetup ? '🔐 إنشاء الحساب والدخول' : '🔑 تسجيل الدخول'}
          </button>
        </form>

        <div style={{ textAlign:'center', marginTop:20 }}>
          <a href="/" style={{ color:'#9aada7', fontSize:'0.8rem', textDecoration:'none' }}>← العودة للموقع</a>
        </div>
      </div>
    </div>
  )
}
