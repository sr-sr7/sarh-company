'use client'
import { useEffect, useState } from 'react'
import { LOGO_GIF } from '@/lib/logo'

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [srchText,    setSrchText]    = useState('')
  const [srchOp,      setSrchOp]      = useState('')
  const [srchType,    setSrchType]    = useState('')
  const [srchCity,    setSrchCity]    = useState('')

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  function closeMenu() { setMenuOpen(false) }

  function doSearch(e?: React.FormEvent) {
    if (e) e.preventDefault()
    const p = new URLSearchParams()
    if (srchText) p.set('search', srchText)
    if (srchOp)   p.set('operation', srchOp)
    if (srchType) p.set('type', srchType)
    if (srchCity) p.set('city', srchCity)
    window.location.href = '/properties' + (p.toString() ? '?' + p.toString() : '')
  }

  const links = [
    { href: '#about',      label: 'عن صرح',    icon: null },
    { href: '#properties', label: 'العقارات',   icon: null },
    { href: '#services',   label: 'خدماتنا',   icon: null },
    { href: '/map',        label: 'الخريطة',   icon: null },
    { href: '/favorites',  label: 'المفضلة',   icon: null },
  ]

  const navBg = scrolled ? 'rgba(207,224,218,0.99)' : 'rgba(211,226,220,0.95)'

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(30,58,52,0.18)',
    borderRadius: 8, padding: '6px 10px', fontSize: '0.8rem', color: '#1e3a34',
    outline: 'none', fontFamily: "'Tajawal','Cairo',sans-serif", cursor: 'pointer',
    height: 34,
  }

  const mobileInputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(211,226,220,0.2)',
    borderRadius: 10, padding: '11px 14px', fontSize: '0.92rem', color: '#d3e2dc',
    outline: 'none', fontFamily: "'Tajawal','Cairo',sans-serif",
    boxSizing: 'border-box' as const,
  }

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, right: 0, left: 0, zIndex: 1000,
        paddingTop: 'var(--status-bar-height, env(safe-area-inset-top, 0px))',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 3%', height: 'calc(80px + var(--status-bar-height, env(safe-area-inset-top, 0px)))',
        background: navBg,
        backdropFilter: 'blur(16px)',
        boxShadow: scrolled ? '0 2px 24px rgba(30,58,52,0.14)' : '0 1px 0 rgba(30,58,52,0.08)',
        transition: 'all 0.3s',
        direction: 'rtl',
        gap: 16,
      }}>

        {/* Logo */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
          <img src="/logo.png" alt="صرح العقارية" style={{ height: 56, width: 'auto', maxWidth: 200, objectFit: 'contain' }} />
        </a>

        {/* Search form — desktop only */}
        <form onSubmit={doSearch} className="sarh-nav-search"
          style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, maxWidth: 560 }}>
          <input value={srchText} onChange={e => setSrchText(e.target.value)}
            placeholder="ابحث بالعنوان..."
            style={{ ...inputStyle, flex: 2, minWidth: 80 }} />
          <select value={srchOp} onChange={e => setSrchOp(e.target.value)} style={{ ...inputStyle, minWidth: 80 }}>
            <option value="">العملية</option>
            {['للبيع','للإيجار','إيجار يومي','استثماري'].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <select value={srchType} onChange={e => setSrchType(e.target.value)} style={{ ...inputStyle, minWidth: 72 }}>
            <option value="">النوع</option>
            {['فيلا','أرض','شقة','استراحة','شاليه','دبلكس','مزرعة','محل تجاري','وحدة علوية','وحدة أرضية','دور علوي','دور أرضي'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={srchCity} onChange={e => setSrchCity(e.target.value)} style={{ ...inputStyle, minWidth: 72 }}>
            <option value="">المدينة</option>
            {['الرياض','جدة','مكة المكرمة','المدينة المنورة','الدمام','الخبر','الظهران','القطيف','الأحساء','الطائف','تبوك','أبها','خميس مشيط','بريدة','عنيزة','الرس','البكيرية','المذنب','حائل','ينبع','نجران','جازان','الباحة','عرعر','سكاكا','الخرج','الدوادمي'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit" style={{ background: '#41646d', color: '#1e3a34', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', fontFamily: "'Tajawal','Cairo',sans-serif", height: 34, whiteSpace: 'nowrap' as const }}>
            🔍
          </button>
        </form>

        {/* Desktop links */}
        <ul style={{ display: 'flex', gap: 20, listStyle: 'none', margin: 0, padding: 0, flexShrink: 0 }}
          className="sarh-desktop-nav">
          {links.map(({ href, label, icon }) => (
            <li key={label}>
              <a href={href} style={{ color: '#2d5750', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                {icon && <img src={icon} alt="" width={16} height={16} style={{ verticalAlign: 'middle' }} />}
                {label}
              </a>
            </li>
          ))}
          <li>
            <a href="https://wa.me/966557340222" target="_blank" rel="noopener noreferrer"
              style={{ background: '#41646d', color: '#1e3a34', padding: '8px 18px', borderRadius: 6, fontWeight: 700, textDecoration: 'none', fontSize: '0.88rem' }}>
              💬 تواصل معنا
            </a>
          </li>
        </ul>

        {/* Mobile: أيقونة البحث + الهامبرغر */}
        <div className="sarh-mobile-btns" style={{ display: 'none', alignItems: 'center', gap: 4 }}>
          {/* أيقونة البحث */}
          <button
            onClick={() => { setSearchOpen(o => !o); setMenuOpen(false) }}
            style={{ background: searchOpen ? 'rgba(30,58,52,0.12)' : 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="بحث"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e3a34" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="22" y2="22" />
            </svg>
          </button>

          {/* الهامبرغر */}
          <button
            onClick={() => { setMenuOpen(o => !o); setSearchOpen(false) }}
            className="sarh-hamburger"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center', justifyContent: 'center' }}
            aria-label="القائمة"
          >
            <span style={{ display: 'block', width: 24, height: 2, background: '#1e3a34', borderRadius: 2, transition: 'all 0.3s', transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none' }} />
            <span style={{ display: 'block', width: 24, height: 2, background: '#1e3a34', borderRadius: 2, transition: 'all 0.3s', opacity: menuOpen ? 0 : 1 }} />
            <span style={{ display: 'block', width: 24, height: 2, background: '#1e3a34', borderRadius: 2, transition: 'all 0.3s', transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
          </button>
        </div>
      </nav>

      {/* Mobile search panel */}
      <div style={{
        position: 'fixed', top: 80, right: 0, left: 0, zIndex: 997,
        background: 'rgba(30,58,52,0.97)',
        backdropFilter: 'blur(16px)',
        direction: 'rtl',
        transform: searchOpen ? 'translateY(0)' : 'translateY(-110%)',
        transition: 'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
        padding: '20px 24px 24px',
      }} className="sarh-search-panel">
        <form onSubmit={(e) => { doSearch(e); setSearchOpen(false) }}>
          <p style={{ color: 'rgba(211,226,220,0.6)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: 2, marginBottom: 14 }}>🔍 البحث عن عقار</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input value={srchText} onChange={e => setSrchText(e.target.value)}
              placeholder="ابحث بالعنوان أو الحي..."
              style={mobileInputStyle} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <select value={srchOp} onChange={e => setSrchOp(e.target.value)} style={{ ...mobileInputStyle, padding: '11px 10px' }}>
                <option value="">العملية</option>
                {['للبيع','للإيجار','إيجار يومي','استثماري'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <select value={srchType} onChange={e => setSrchType(e.target.value)} style={{ ...mobileInputStyle, padding: '11px 10px' }}>
                <option value="">النوع</option>
                {['فيلا','أرض','شقة','استراحة','شاليه','دبلكس','مزرعة','محل تجاري','وحدة علوية','وحدة أرضية','دور علوي','دور أرضي'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={srchCity} onChange={e => setSrchCity(e.target.value)} style={{ ...mobileInputStyle, padding: '11px 10px' }}>
                <option value="">المدينة</option>
                {['الرياض','جدة','مكة المكرمة','المدينة المنورة','الدمام','الخبر','الظهران','القطيف','الأحساء','الطائف','تبوك','أبها','خميس مشيط','بريدة','عنيزة','الرس','البكيرية','المذنب','حائل','ينبع','نجران','جازان','الباحة','عرعر','سكاكا','الخرج','الدوادمي'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button type="submit" style={{ background: '#41646d', color: '#1e3a34', border: 'none', borderRadius: 10, padding: '13px 0', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', fontFamily: "'Tajawal','Cairo',sans-serif", width: '100%' }}>
              🔍 بحث
            </button>
          </div>
        </form>
      </div>

      {/* Overlay — يغلق عند الضغط */}
      {(menuOpen || searchOpen) && (
        <div onClick={() => { closeMenu(); setSearchOpen(false) }}
          style={{ position: 'fixed', inset: 0, zIndex: 996, background: 'rgba(0,0,0,0.4)' }} />
      )}

      {/* Mobile menu drawer */}
      <div style={{
        position: 'fixed', top: 80, right: 0, left: 0, zIndex: 999,
        background: 'rgba(30,58,52,0.98)',
        backdropFilter: 'blur(16px)',
        direction: 'rtl',
        transform: menuOpen ? 'translateY(0)' : 'translateY(-110%)',
        transition: 'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
        borderBottom: '1px solid rgba(211,226,220,0.1)',
        paddingBottom: 24,
      }}
        className="sarh-mobile-menu"
      >
        <ul style={{ listStyle: 'none', margin: 0, padding: '8px 0' }}>
          {links.map(({ href, label }) => (
            <li key={label}>
              <a href={href} onClick={closeMenu}
                style={{ display: 'block', padding: '14px 28px', color: 'rgba(211,226,220,0.9)', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, borderBottom: '1px solid rgba(211,226,220,0.06)', fontFamily: "'Tajawal','Cairo',sans-serif" }}>
                {label}
              </a>
            </li>
          ))}
          <li style={{ padding: '12px 28px' }}>
            <a href="https://wa.me/966557340222" target="_blank" rel="noopener noreferrer" onClick={closeMenu}
              style={{ display: 'block', textAlign: 'center', background: '#41646d', color: '#27423e', padding: '13px 0', borderRadius: 10, fontWeight: 700, fontSize: '1rem', textDecoration: 'none', fontFamily: "'Tajawal','Cairo',sans-serif" }}>
              💬 تواصل معنا عبر واتساب
            </a>
          </li>
        </ul>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .sarh-desktop-nav   { display: none !important; }
          .sarh-nav-search    { display: none !important; }
          .sarh-mobile-btns   { display: flex !important; }
        }
        @media (min-width: 769px) {
          .sarh-mobile-menu   { display: none !important; }
          .sarh-search-panel  { display: none !important; }
          .sarh-mobile-btns   { display: none !important; }
        }
      `}</style>
    </>
  )
}
