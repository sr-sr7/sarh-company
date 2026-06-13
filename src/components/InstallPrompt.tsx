'use client'
import { useEffect, useState } from 'react'

export default function InstallPrompt() {
  const [show, setShow]         = useState(false)
  const [isIOS, setIsIOS]       = useState(false)
  const [deferredPrompt, setDP] = useState<any>(null)

  useEffect(() => {
    // Don't show if already installed or dismissed before
    if (
      localStorage.getItem('sarh_install_dismissed') ||
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone
    ) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(ios)

    if (ios) {
      // On iOS show after 1.5s
      setTimeout(() => setShow(true), 1500)
    } else {
      // Android/Chrome: wait for beforeinstallprompt
      const handler = (e: Event) => {
        e.preventDefault()
        setDP(e)
        setTimeout(() => setShow(true), 1500)
      }
      window.addEventListener('beforeinstallprompt', handler)
      return () => window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  function dismiss() {
    localStorage.setItem('sarh_install_dismissed', '1')
    setShow(false)
  }

  async function install() {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      await deferredPrompt.userChoice
    }
    dismiss()
  }

  if (!show) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 99999,
      background: 'linear-gradient(135deg, #1e3a34, #2d5a4e)',
      padding: '18px 20px 28px',
      borderTopLeftRadius: 20, borderTopRightRadius: 20,
      boxShadow: '0 -8px 32px rgba(0,0,0,0.35)',
      fontFamily: 'Tajawal, sans-serif',
      direction: 'rtl',
      animation: 'slideUp 0.35s ease',
    }}>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity:0 } to { transform: translateY(0); opacity:1 } }`}</style>

      {/* Close */}
      <button onClick={dismiss} style={{
        position: 'absolute', top: 12, left: 16,
        background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%',
        width: 28, height: 28, cursor: 'pointer', color: '#fff', fontSize: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>✕</button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <img src="/icon-192.png" alt="صرح" style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0 }} />
        <div>
          <div style={{ color: '#b8986a', fontSize: '0.7rem', fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>
            أضف للشاشة الرئيسية
          </div>
          <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 800 }}>صرح العقارية</div>
          <div style={{ color: '#a8c5be', fontSize: '0.75rem' }}>وصول سريع لكل العقارات</div>
        </div>
      </div>

      {isIOS ? (
        /* iOS instructions */
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
          <div style={{ color: '#d0e8e2', fontSize: '0.82rem', lineHeight: 1.8 }}>
            <span style={{ color: '#b8986a', fontWeight: 700 }}>١.</span> اضغط زر <strong style={{ color: '#fff' }}>المشاركة</strong>
            <span style={{ fontSize: '1rem' }}> ⎙ </span>
            في المتصفح<br />
            <span style={{ color: '#b8986a', fontWeight: 700 }}>٢.</span> اختر <strong style={{ color: '#fff' }}>"إضافة إلى الشاشة الرئيسية"</strong>
          </div>
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 10 }}>
        {!isIOS && (
          <button onClick={install} style={{
            flex: 1, background: '#b8986a', color: '#1e3a34',
            border: 'none', borderRadius: 12, padding: '12px 0',
            fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
            fontFamily: 'Tajawal, sans-serif',
          }}>
            تثبيت التطبيق
          </button>
        )}
        <button onClick={dismiss} style={{
          flex: isIOS ? 1 : 0, background: 'rgba(255,255,255,0.1)', color: '#a8c5be',
          border: 'none', borderRadius: 12, padding: '12px 18px',
          fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
          fontFamily: 'Tajawal, sans-serif',
          ...(isIOS ? { textAlign: 'center' } : {}),
        }}>
          {isIOS ? 'حسناً، شكراً' : 'لاحقاً'}
        </button>
      </div>
    </div>
  )
}
