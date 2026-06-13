'use client'
import { useEffect, useState } from 'react'

export default function InstallPrompt() {
  const [show, setShow]         = useState(false)
  const [isIOS, setIsIOS]       = useState(false)
  const [deferredPrompt, setDP] = useState<any>(null)

  useEffect(() => {
    // Already installed as PWA — don't show
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone
    ) return

    // Already dismissed — don't show again
    if (localStorage.getItem('sarh_install_dismissed')) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(ios)

    // Try to capture native install event (Android/Chrome)
    const handler = (e: Event) => {
      e.preventDefault()
      setDP(e)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Show after 2s regardless of browser
    const t = setTimeout(() => setShow(true), 2000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(t)
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

  const showNativeBtn = !isIOS && deferredPrompt

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 99999,
      background: 'linear-gradient(135deg, #1e3a34, #2d5a4e)',
      padding: '18px 20px 32px',
      borderTopLeftRadius: 20, borderTopRightRadius: 20,
      boxShadow: '0 -8px 32px rgba(0,0,0,0.35)',
      fontFamily: 'Tajawal, sans-serif',
      direction: 'rtl',
      animation: 'slideUpPrompt 0.35s ease',
    }}>
      <style>{`@keyframes slideUpPrompt { from { transform:translateY(100%); opacity:0 } to { transform:translateY(0); opacity:1 } }`}</style>

      {/* Close */}
      <button onClick={dismiss} style={{
        position: 'absolute', top: 12, left: 16,
        background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%',
        width: 30, height: 30, cursor: 'pointer', color: '#fff', fontSize: 15,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>✕</button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <img src="/icon-192.png" alt="صرح" style={{ width: 54, height: 54, borderRadius: 14, flexShrink: 0 }} />
        <div>
          <div style={{ color: '#b8986a', fontSize: '0.68rem', fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>
            أضف للشاشة الرئيسية
          </div>
          <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 800 }}>صرح العقارية</div>
          <div style={{ color: '#a8c5be', fontSize: '0.75rem' }}>وصول سريع لكل العقارات</div>
        </div>
      </div>

      {/* iOS instructions */}
      {isIOS && (
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
          <div style={{ color: '#d0e8e2', fontSize: '0.82rem', lineHeight: 2 }}>
            <span style={{ color: '#b8986a', fontWeight: 700 }}>١.</span>{' '}
            اضغط زر <strong style={{ color: '#fff' }}>المشاركة</strong>{' '}
            <span style={{ fontSize: '1.1rem' }}>⎙</span> في أسفل Safari<br />
            <span style={{ color: '#b8986a', fontWeight: 700 }}>٢.</span>{' '}
            اختر <strong style={{ color: '#fff' }}>«إضافة إلى الشاشة الرئيسية»</strong>
          </div>
        </div>
      )}

      {/* Chrome (no native prompt yet) instructions */}
      {!isIOS && !deferredPrompt && (
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
          <div style={{ color: '#d0e8e2', fontSize: '0.82rem', lineHeight: 2 }}>
            <span style={{ color: '#b8986a', fontWeight: 700 }}>١.</span>{' '}
            اضغط قائمة المتصفح <strong style={{ color: '#fff' }}>⋮</strong><br />
            <span style={{ color: '#b8986a', fontWeight: 700 }}>٢.</span>{' '}
            اختر <strong style={{ color: '#fff' }}>«إضافة إلى الشاشة الرئيسية»</strong>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        {showNativeBtn && (
          <button onClick={install} style={{
            flex: 1, background: '#b8986a', color: '#1e3a34',
            border: 'none', borderRadius: 12, padding: '13px 0',
            fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
            fontFamily: 'Tajawal, sans-serif',
          }}>
            تثبيت التطبيق
          </button>
        )}
        <button onClick={dismiss} style={{
          flex: showNativeBtn ? 0 : 1,
          background: showNativeBtn ? 'rgba(255,255,255,0.1)' : '#b8986a',
          color: showNativeBtn ? '#a8c5be' : '#1e3a34',
          border: 'none', borderRadius: 12,
          padding: showNativeBtn ? '13px 20px' : '13px 0',
          fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
          fontFamily: 'Tajawal, sans-serif',
        }}>
          {showNativeBtn ? 'لاحقاً' : 'حسناً، شكراً'}
        </button>
      </div>
    </div>
  )
}
