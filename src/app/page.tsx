'use client'
import React, { useEffect, useState, useRef } from 'react'
import { Property, sbFetch } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PropertyCard from '@/components/PropertyCard'
import dynamic from 'next/dynamic'

const PropertyMap = dynamic(() => import('@/components/PropertyMap'), { ssr: false, loading: () => (
  <div style={{ height: 500, background: '#d3e2dc', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#41646d', fontSize: '1rem' }}>
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#41646d" strokeWidth="1.5" style={{verticalAlign:'middle',marginLeft:8,opacity:0.5}}><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
    جاري تحميل الخريطة...
  </div>
)})

type TabKey = 'الكل' | 'فيلا' | 'أرض' | 'استراحة' | 'شاليه' | 'مزرعة' | 'إيجار' | 'شقة' | 'دبلكس' | 'محل تجاري' | 'وحدة علوية' | 'وحدة أرضية' | 'دور علوي' | 'دور أرضي'

type IconKey = 'all' | 'villa' | 'land' | 'apt' | 'rest' | 'farm' | 'commercial' | 'rent' | 'map'

const TAB_ICONS: Record<IconKey, React.ReactNode> = {
  all:        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  villa:      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  land:       <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 15l5-5 4 4 3-3 6 6"/></svg>,
  apt:        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22V12h6v10M8 6h.01M12 6h.01M16 6h.01M8 10h.01M16 10h.01"/></svg>,
  rest:       <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l4-8 5 6 3-4 6 6"/><path d="M3 21h18"/></svg>,
  farm:       <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7z"/><circle cx="12" cy="9" r="2.5"/></svg>,
  commercial: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v11a1 1 0 01-1 1H4a1 1 0 01-1-1V9z"/><path d="M3 9l2.5-5h13L21 9"/><path d="M9 22V13h6v9"/></svg>,
  rent:       <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="4"/><path d="M11 11l10 10M16 21l5-5"/></svg>,
  map:        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7"/></svg>,
}

const TABS: { key: TabKey; label: string; iconKey: IconKey }[] = [
  { key: 'الكل',        label: 'الكل',        iconKey: 'all' },
  { key: 'فيلا',        label: 'فلل',         iconKey: 'villa' },
  { key: 'أرض',        label: 'أراضي',       iconKey: 'land' },
  { key: 'شقة',        label: 'شقق',         iconKey: 'apt' },
  { key: 'استراحة',    label: 'استراحات',    iconKey: 'rest' },
  { key: 'شاليه',      label: 'شاليهات',     iconKey: 'rest' },
  { key: 'دبلكس',      label: 'دبلكس',       iconKey: 'apt' },
  { key: 'مزرعة',      label: 'مزارع',       iconKey: 'farm' },
  { key: 'محل تجاري',  label: 'تجاري',       iconKey: 'commercial' },
  { key: 'وحدة علوية', label: 'وحدة علوية',  iconKey: 'apt' },
  { key: 'وحدة أرضية', label: 'وحدة أرضية',  iconKey: 'apt' },
  { key: 'دور علوي',   label: 'دور علوي',    iconKey: 'apt' },
  { key: 'دور أرضي',   label: 'دور أرضي',    iconKey: 'apt' },
  { key: 'إيجار',      label: 'إيجار',       iconKey: 'rent' },
]

const S = {
  main: { fontFamily: "'Tajawal','Cairo',sans-serif", background: '#d3e2dc', minHeight: '100vh', direction: 'rtl' as const },

  // Hero
  hero: { position: 'relative' as const, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' as const, background: 'linear-gradient(150deg,#d3e2dc 0%,#d3e2dc 50%,#d3e2dc 100%)', overflow: 'hidden' },
  heroInner: { position: 'relative' as const, zIndex: 10, padding: '100px 24px 60px', maxWidth: 800, margin: '0 auto' },
  heroBadge: { display: 'inline-block', background: 'rgba(30,58,52,0.08)', border: '1px solid rgba(30,58,52,0.15)', color: '#2d5750', fontSize: '0.75rem', padding: '8px 20px', borderRadius: 50, marginBottom: 32, letterSpacing: 3 },
  heroH1: { fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800, color: '#1e3a34', lineHeight: 1.3, marginBottom: 24 },
  heroAccent: { color: '#41646d' },
  heroP: { color: '#3a5a54', fontSize: '1.05rem', lineHeight: 1.85, marginBottom: 40, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' },
  heroBtns: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' as const },
  btnPrimary: { background: '#41646d', color: '#1e3a34', padding: '14px 32px', borderRadius: 10, fontWeight: 700, fontSize: '1rem', textDecoration: 'none', display: 'inline-block' },
  btnOutline: { background: 'rgba(30,58,52,0.08)', color: '#1e3a34', border: '1px solid rgba(30,58,52,0.2)', padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: '1rem', textDecoration: 'none', display: 'inline-block' },
  heroStats: { display: 'flex', justifyContent: 'center', gap: 24, marginTop: 48, flexWrap: 'wrap' as const, padding: '0 16px' },
  statNum: { display: 'block', fontSize: 'clamp(1.6rem,5vw,2.5rem)', fontWeight: 800, color: '#41646d' },
  statLabel: { color: '#4a7a72', fontSize: '0.85rem', marginTop: 4, display: 'block' },

  // About
  about: { padding: '80px 24px', background: '#d3e2dc' },
  aboutInner: { maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 64, alignItems: 'center' },
  sectionLabel: { color: '#2d5750', fontSize: '0.72rem', fontWeight: 700, letterSpacing: 3, borderRight: '4px solid #41646d', paddingRight: 12 },
  aboutH2: { fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 800, color: '#1e3a34', margin: '16px 0 20px', lineHeight: 1.35 },
  aboutP: { color: '#3a5a54', lineHeight: 1.9, marginBottom: 16, fontSize: '1rem', fontWeight: 500 },
  tagRow: { display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' as const },
  tag: { background: '#d3e2dc', color: '#1e3a34', padding: '8px 16px', borderRadius: 50, fontSize: '0.85rem', fontWeight: 600 },
  quoteBox: { background: '#d3e2dc', borderRadius: 20, padding: 40, color: '#1e3a34', position: 'relative' as const, overflow: 'hidden', border: '1px solid rgba(30,58,52,0.1)' },
  quoteText: { color: '#1e3a34', fontSize: '1.05rem', lineHeight: 1.9, fontWeight: 500, position: 'relative' as const, zIndex: 1 },
  quoteBy: { color: '#41646d', fontWeight: 700, marginTop: 24, position: 'relative' as const, zIndex: 1 },

  // Properties
  props: { padding: '80px 24px', background: '#d3e2dc' },
  propsInner: { maxWidth: 1200, margin: '0 auto' },
  sectionTitle: { textAlign: 'center' as const, marginBottom: 48 },
  propsH2: { fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 800, color: '#1e3a34', margin: '16px 0 12px' },
  propsSub: { color: '#7a9188', fontSize: '0.95rem' },
  tabsRow: { display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' as const, marginBottom: 40 },
  tabActive: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 28px', borderRadius: 50, border: '2px solid rgba(30,58,52,0.25)', fontWeight: 700, fontSize: '0.9rem', background: '#d3e2dc', color: '#1e3a34', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(30,58,52,0.12)', fontFamily: "'Tajawal','Cairo',sans-serif" },
  tabInactive: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 28px', borderRadius: 50, border: '2px solid rgba(30,58,52,0.18)', fontWeight: 600, fontSize: '0.9rem', background: '#f4ede4', color: '#526266', cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'Tajawal','Cairo',sans-serif" },
  grid3: { display: 'grid', gridTemplateColumns: '1fr', gap: 16 },
  skeleton: { background: '#e4ede8', borderRadius: 20, height: 288, border: '1px solid rgba(30,58,52,0.1)' },
  empty: { textAlign: 'center' as const, padding: '80px 0' },
  emptyIcon: { fontSize: '4rem', opacity: 0.2, display: 'block', marginBottom: 16 },
  emptyText: { color: '#7a9188', fontSize: '1.1rem', marginBottom: 24 },
  emptyBtn: { display: 'inline-block', background: '#d3e2dc', color: '#1e3a34', padding: '12px 28px', borderRadius: 10, fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none' },

  // Features
  features: { padding: '80px 24px', background: '#d3e2dc' },
  featInner: { maxWidth: 1000, margin: '0 auto' },
  featTitle: { textAlign: 'center' as const, marginBottom: 56 },
  featLabel: { color: '#41646d', fontSize: '0.72rem', fontWeight: 700, letterSpacing: 3 },
  featH2: { fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 800, color: '#1e3a34', margin: '16px 0 12px' },
  featSub: { color: '#4a7a72', fontSize: '0.95rem' },
  featGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20 },
  featCard: { background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(30,58,52,0.1)', borderRadius: 20, padding: 28, textAlign: 'center' as const },
  featIcon: { fontSize: '2.5rem', display: 'block', marginBottom: 16 },
  featCardTitle: { fontWeight: 700, color: '#1e3a34', marginBottom: 12, fontSize: '1rem' },
  featCardDesc: { color: '#3a5a54', fontSize: '0.85rem', lineHeight: 1.75 },

  // CTA
  cta: { padding: '80px 24px', background: '#d3e2dc', textAlign: 'center' as const },
  ctaH2: { fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 800, color: '#1e3a34', marginBottom: 16 },
  ctaP: { color: '#2d5750', fontSize: '0.97rem', maxWidth: 500, margin: '0 auto 40px', lineHeight: 1.85 },
  ctaBtns: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' as const },
  btnWa: { background: '#25D366', color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 700, fontSize: '1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 },
  btnDark: { background: '#d3e2dc', color: '#1e3a34', padding: '14px 32px', borderRadius: 10, fontWeight: 700, fontSize: '1rem', textDecoration: 'none', display: 'inline-block', border: '1px solid rgba(30,58,52,0.2)' },
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>('الكل')
  const [mobileDropOpen, setMobileDropOpen] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [soldProperties, setSoldProperties] = useState<Property[]>([])
  const [heroImages, setHeroImages] = useState<string[]>([])
  const [heroIdx, setHeroIdx] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')

  // Carousel
  const carouselRef   = useRef<HTMLDivElement>(null)
  const [carouselIdx, setCarouselIdx]         = useState(0)
  const [carouselPaused, setCarouselPaused]   = useState(false)
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function pauseCarousel() {
    setCarouselPaused(true)
    if (pauseTimer.current) clearTimeout(pauseTimer.current)
    pauseTimer.current = setTimeout(() => setCarouselPaused(false), 5000)
  }

  // Auto-advance every 4s when idle
  useEffect(() => {
    if (carouselPaused || viewMode !== 'grid' || loading || properties.length <= 1) return
    const t = setInterval(() => {
      setCarouselIdx(i => (i + 1) % properties.length)
    }, 4000)
    return () => clearInterval(t)
  }, [carouselPaused, viewMode, loading, properties.length])

  // Scroll to active card
  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    const CARD = 324 + 24 // card width + gap
    el.scrollTo({ left: carouselIdx * CARD, behavior: 'smooth' })
  }, [carouselIdx])

  // One request for everything: tabs, hero images and sold list are derived client-side
  const [allProps, setAllProps] = useState<Property[] | null>(null)

  useEffect(() => {
    async function loadAll() {
      const data = await sbFetch('properties?select=*&status=in.(active,sold)&order=is_featured.desc,created_at.desc')
      if (Array.isArray(data) && data.length) { setAllProps(data); return }
      try {
        const r = await fetch('/api/properties-cache')
        const all: Property[] = r.ok ? await r.json() : []
        setAllProps(all
          .filter(p => p.status === 'active' || p.status === 'sold')
          .sort((a,b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
      } catch { setAllProps([]) }
    }
    loadAll()
  }, [])

  useEffect(() => {
    if (!allProps) return
    setHeroImages(allProps.filter(p => p.status === 'active' && p.main_image).slice(0, 8).map(p => p.main_image!))
    setSoldProperties(allProps.filter(p => p.status === 'sold').sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
  }, [allProps])

  useEffect(() => {
    if (!allProps) return
    const tab = activeTab
    let list = allProps
    if      (tab === 'إيجار')     list = list.filter(p => p.operation === 'للإيجار')
    else if (tab === 'محل تجاري') list = list.filter(p => p.type === 'محل تجاري' || p.type === 'تجاري')
    else if (tab !== 'الكل')      list = list.filter(p => p.type === tab)
    setProperties(list)
    setLoading(false)
  }, [allProps, activeTab])

  // Cycle hero images every 4 seconds
  useEffect(() => {
    if (heroImages.length < 2) return
    const timer = setInterval(() => setHeroIdx(i => (i + 1) % heroImages.length), 4000)
    return () => clearInterval(timer)
  }, [heroImages])

  return (
    <main style={S.main}>
      <Navbar />

      {/* ── Hero ── */}
      <section style={S.hero}>

        {/* Background slideshow — فاتح */}
        {heroImages.length > 0 && heroImages.map((img, i) => (
          <div key={img} style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: i === heroIdx ? 0.13 : 0,
            transition: 'opacity 1.4s ease-in-out',
            zIndex: 1,
          }} />
        ))}

        {/* تدرج فاتح خفيف فوق الصور */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          background: 'linear-gradient(150deg, rgba(211,226,220,0.55) 0%, rgba(232,240,237,0.40) 50%, rgba(244,237,228,0.55) 100%)',
        }} />

        {/* Dots — hidden */}

        <div style={{ ...S.heroInner, zIndex: 10 }}>
          <span style={S.heroBadge}>✦ نحن نعيد تعريف التجربة العقارية</span>
          <h1 style={S.heroH1}>
            اكتشف عقارك المثالي<br />
            <span style={S.heroAccent}>مع صرح العقارية</span>
          </h1>
          <p style={S.heroP}>
            تتميز صرح العقارية باحترافية استثنائية في التسويق العقاري والحصري، وإدارة وتنظيم المزادات الخاصة ومزادات منصة إنفاذ، بالتوازي مع رؤيتها في استثمار الأراضي وتطويرها، لتقدم في قلب المملكة مفاهيم عقارية مبتكرة تجمع بين الأصالة والتميز
          </p>
          <div style={S.heroBtns}>
            <a href="#properties" style={S.btnPrimary}>استعرض العقارات</a>
            <a href="#about" style={S.btnOutline}>تعرّف علينا</a>
          </div>

        </div>{/* heroInner */}
      </section>

      {/* ── Properties ── */}
      <section id="properties" style={S.props}>
        <div style={S.propsInner}>
          <div style={S.sectionTitle}>
            <span style={S.sectionLabel}>✦ عقاراتنا</span>
            <h2 style={S.propsH2}>اختر ما يناسبك</h2>
            <p style={S.propsSub}>نوفر لك مجموعة متنوعة من العقارات المميزة لتلبية جميع احتياجاتك</p>
          </div>

          {/* Tabs + view toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 12, marginBottom: 40 }}>

            {/* Desktop: أزرار التبويب */}
            <div className="sarh-tabs-desktop" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
              {TABS.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  style={activeTab === tab.key ? S.tabActive : S.tabInactive}>
                  {TAB_ICONS[tab.iconKey]} {tab.label}
                </button>
              ))}
            </div>

            {/* Mobile: قائمة منسدلة مخصصة */}
            <div className="sarh-tabs-mobile" style={{ display: 'none', flex: 1, position: 'relative' }}>
              {/* الزر الحالي */}
              <button
                onClick={() => setMobileDropOpen(o => !o)}
                style={{ width: '100%', background: '#f4ede4', border: '2px solid rgba(30,58,52,0.18)', borderRadius: 12, padding: '10px 16px', fontSize: '1rem', fontWeight: 700, color: '#1e3a34', fontFamily: "'Tajawal','Cairo',sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between', direction: 'rtl' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {TAB_ICONS[TABS.find(t => t.key === activeTab)?.iconKey ?? 'all']}
                  {TABS.find(t => t.key === activeTab)?.label}
                </span>
                <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>{mobileDropOpen ? '▲' : '▼'}</span>
              </button>

              {/* القائمة */}
              {mobileDropOpen && (
                <div style={{ position: 'absolute', top: '110%', right: 0, left: 0, background: '#f4ede4', border: '2px solid rgba(30,58,52,0.18)', borderRadius: 12, zIndex: 999, overflow: 'hidden', boxShadow: '0 8px 24px rgba(30,58,52,0.12)' }}>
                  {TABS.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => { setActiveTab(tab.key); setMobileDropOpen(false) }}
                      style={{ width: '100%', background: tab.key === activeTab ? '#d3e2dc' : '#fff', border: 'none', padding: '12px 16px', fontSize: '0.95rem', fontWeight: 700, color: '#1e3a34', fontFamily: "'Tajawal','Cairo',sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, direction: 'rtl', borderBottom: '1px solid rgba(30,58,52,0.07)' }}
                    >
                      {TAB_ICONS[tab.iconKey]}
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grid / Map toggle */}
            <div style={{ display: 'flex', gap: 6, background: '#f4ede4', borderRadius: 12, padding: 4, border: '1px solid rgba(39,66,62,0.15)', flexShrink: 0 }}>
              <button onClick={() => setViewMode('grid')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, border: 'none', fontFamily: "'Tajawal','Cairo',sans-serif", fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', background: viewMode === 'grid' ? '#d3e2dc' : 'transparent', color: '#1e3a34' }}>
                ⊞ شبكة
              </button>
              <button onClick={() => setViewMode('map')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, border: 'none', fontFamily: "'Tajawal','Cairo',sans-serif", fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', background: viewMode === 'map' ? '#d3e2dc' : 'transparent', color: '#1e3a34' }}>
                {TAB_ICONS.map} خريطة
              </button>
            </div>
          </div>

          <style>{`
            @media (max-width: 768px) {
              .sarh-tabs-desktop { display: none !important; }
              .sarh-tabs-mobile  { display: flex !important; }
            }
          `}</style>

          {/* Map view */}
          {viewMode === 'map' && (
            loading
              ? <div style={{ height: 500, background: '#d3e2dc', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#41646d' }}>جاري التحميل...</div>
              : properties.length === 0
                ? <div style={S.empty}><span style={{display:'block',fontSize:'3rem',opacity:0.4,marginBottom:12,color:'#41646d'}}>{TAB_ICONS.map}</span><p style={S.emptyText}>لا توجد عقارات في هذه الفئة حالياً</p></div>
                : <PropertyMap properties={properties} />
          )}

          {viewMode === 'grid' && loading && (
            <div style={{ display:'flex', gap:24, overflowX:'hidden' }}>
              {[0,1,2].map(i => <div key={i} style={{ ...S.skeleton, flexShrink:0, width:324 }} />)}
            </div>
          )}
          {viewMode === 'grid' && !loading && properties.length === 0 && (
            <div style={S.empty}>
              <span style={S.emptyIcon}>🏠</span>
              <p style={S.emptyText}>انتظروا عروضنا قريباً</p>
            </div>
          )}
          {viewMode === 'grid' && !loading && properties.length > 0 && (
            <div className="snap-scroll-cards" style={{
              height: '100vh',
              overflowY: 'scroll',
              scrollSnapType: 'y mandatory',
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
            }}>
              {properties.map(p => (
                <div key={p.id} className="snap-item" style={{
                  scrollSnapAlign: 'start',
                  padding: '0 0 16px',
                  boxSizing: 'border-box',
                  display: 'flex',
                }}>
                  <PropertyCard property={p} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* زر عرض جميع العقارات */}
        <div style={{ textAlign:'center', marginTop: 40 }}>
          <a href="/properties" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#1e3a34',
            color: '#d3e2dc', fontFamily: "'Tajawal','Cairo',sans-serif",
            fontWeight: 700, fontSize: '0.9rem',
            padding: '12px 32px', borderRadius: 50,
            textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(30,58,52,0.18)',
            transition: 'all 0.25s',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform='translateY(-2px)')}
          onMouseLeave={e => (e.currentTarget.style.transform='translateY(0)')}>
            عرض جميع العقارات
            <span style={{ fontSize:'0.8rem', opacity:0.6 }}>←</span>
          </a>
        </div>
      </section>

      {/* ── صفقات تمت ── */}
      {soldProperties.length > 0 && (
        <section style={{ padding:'80px 24px', background:'#1e3a34' }}>
          <div style={{ maxWidth:1200, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:48 }}>
              <span style={{ color:'#41646d', fontSize:'0.72rem', fontWeight:700, letterSpacing:3 }}>✦ أعمالنا المنجزة</span>
              <h2 style={{ fontSize:'clamp(1.6rem,3vw,2.4rem)', fontWeight:800, color:'#fff', margin:'16px 0 12px' }}>صفقات تمت</h2>
              <p style={{ color:'#7a9e96', fontSize:'0.95rem' }}>عقارات أتممنا بيعها بنجاح لعملائنا الكرام</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:24 }}>
              {soldProperties.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Why Sarh ── */}
      <section id="services" style={S.features}>
        <div style={S.featInner}>
          <div style={S.featTitle}>
            <span style={S.featLabel}>✦ لماذا صرح؟</span>
            <h2 style={S.featH2}>خبرة ترتقي بتوقعاتك</h2>
            <p style={S.featSub}>نقدم خدمات عقارية متكاملة بمعايير الجودة والاحترافية</p>
          </div>
          <div style={S.featGrid}>
            {[
              { title:'تنظيم وإدارة المزادات العقارية', desc:'هي وسيلة حديثة لبيع وشراء العقارات بشفافية وتنافس، حيث يُباع العقار لأعلى سعر مقدم، وتُعد فرصة مميزة لتحقيق قيمة عادلة وفرص استثمارية متنوعة' },
              { title:'عقود شفافة',    desc:'نوفر عقوداً دقيقة وشفافة لضمان حقوق جميع الأطراف' },
              { title:'تسويق احترافي', desc:'تعتمد شركة صرح العقارية على التقنيات الحديثة، تصوير جوي (درون)، تصوير احترافي' },
              { title:'عوائد مضمونة',  desc:'نُدير عقاراتك بكفاءة لتحقيق عوائد استثمارية واضحة ومنتظمة' },
            ].map(f => (
              <div key={f.title} style={S.featCard}>
                <p style={S.featCardTitle}>{f.title}</p>
                <p style={S.featCardDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="contact" style={S.cta}>
        <h2 style={S.ctaH2}>هل أنت مستعد للخطوة التالية؟</h2>
        <p style={S.ctaP}>تواصل معنا اليوم ودعنا نساعدك في إيجاد العقار المثالي الذي يلبي احتياجاتك</p>
        <div style={S.ctaBtns}>
          <a href="https://wa.me/966557340222" target="_blank" rel="noopener noreferrer" style={S.btnWa}>💬 تواصل على واتساب</a>
          <a href="tel:+966557340222" style={S.btnDark}>📞 اتصل بنا</a>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" style={S.about}>
        <div style={S.aboutInner}>
          <div>
            <span style={S.sectionLabel}>نبذة عنا</span>
            <h2 style={S.aboutH2}>نبني أثرى تجربة حياتية في المملكة</h2>
            <p style={S.aboutP}>تُعزّز صرح العقارية مسيرة التطور العقاري من خلال استثماراتها في الأراضي وتطويرها، مما يتيح لها إنشاء مفاهيم عقارية تتميز بالتفرد والأصالة.</p>
            <p style={S.aboutP}>تشمل أعمالها تسويق وبيع وتأجير المباني عبر عقود دقيقة، إدارة المزادات وتنظيمها، وإدارة الأملاك. كما تعتمد الشركة على التقنيات الرقمية والأدوات الحديثة لتلبية احتياجات الأفراد والشركات.</p>
            <div style={S.tagRow}>
              {['🌟 التفرد','⚡ الإتقان','🏙️ الحداثة'].map(v => <span key={v} style={S.tag}>{v}</span>)}
            </div>
          </div>
          <div style={S.quoteBox}>
            <div style={{ position: 'absolute', top: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <p style={S.quoteText}>"إعادة تعريف التجارب العقارية ليكون الإنسان محورها، من خلال تبني مفاهيم حديثة ومبتكرة قائمة على أنسنة المدن"</p>
            <p style={S.quoteBy}>— رؤية صرح العقارية</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

