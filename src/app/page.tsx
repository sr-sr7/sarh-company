'use client'
import { useEffect, useState, useRef } from 'react'
import { Property, sbFetch } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PropertyCard from '@/components/PropertyCard'
import dynamic from 'next/dynamic'

const PropertyMap = dynamic(() => import('@/components/PropertyMap'), { ssr: false, loading: () => (
  <div style={{ height: 500, background: '#f0f4f2', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#41646d', fontSize: '1rem' }}>🗺️ جاري تحميل الخريطة...</div>
)})

type TabKey = 'الكل' | 'فيلا' | 'أرض' | 'استراحة' | 'مزرعة' | 'إيجار' | 'شقة' | 'دبلكس' | 'تجاري'

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'الكل',    label: 'الكل',      icon: '/icons/icon_r3_c1.png' },
  { key: 'فيلا',   label: 'فلل',       icon: '/icons/icon_r3_c1.png' },
  { key: 'أرض',   label: 'أراضي',     icon: '/icons/icon_r2_c3.png' },
  { key: 'شقة',   label: 'شقق',       icon: '/icons/icon_r2_c7.png' },
  { key: 'استراحة',label: 'استراحات',  icon: '/icons/icon_r6_c9.png' },
  { key: 'مزرعة', label: 'مزارع',     icon: '/icons/icon_r4_c4.png' },
  { key: 'دبلكس', label: 'دبلكس',     icon: '/icons/icon_r2_c7.png' },
  { key: 'تجاري', label: 'تجاري',     icon: '/icons/icon_r6_c2.png' },
  { key: 'إيجار', label: 'إيجار',     icon: '/icons/icon_r5_c8.png' },
]

const S = {
  main: { fontFamily: "'Tajawal','Cairo',sans-serif", background: '#f0f4f2', minHeight: '100vh', direction: 'rtl' as const },

  // Hero
  hero: { position: 'relative' as const, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' as const, background: 'linear-gradient(150deg,#f0f4f2 0%,#f7faf8 50%,#f0f4f2 100%)', overflow: 'hidden' },
  heroInner: { position: 'relative' as const, zIndex: 10, padding: '100px 24px 60px', maxWidth: 800, margin: '0 auto' },
  heroBadge: { display: 'inline-block', background: 'rgba(30,58,52,0.08)', border: '1px solid rgba(30,58,52,0.15)', color: '#2d5750', fontSize: '0.75rem', padding: '8px 20px', borderRadius: 50, marginBottom: 32, letterSpacing: 3 },
  heroH1: { fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800, color: '#1e3a34', lineHeight: 1.3, marginBottom: 24 },
  heroAccent: { color: '#b8986a' },
  heroP: { color: '#3a5a54', fontSize: '1.05rem', lineHeight: 1.85, marginBottom: 40, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' },
  heroBtns: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' as const },
  btnPrimary: { background: '#b8986a', color: '#1e3a34', padding: '14px 32px', borderRadius: 10, fontWeight: 700, fontSize: '1rem', textDecoration: 'none', display: 'inline-block' },
  btnOutline: { background: 'rgba(30,58,52,0.08)', color: '#1e3a34', border: '1px solid rgba(30,58,52,0.2)', padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: '1rem', textDecoration: 'none', display: 'inline-block' },
  heroStats: { display: 'flex', justifyContent: 'center', gap: 24, marginTop: 48, flexWrap: 'wrap' as const, padding: '0 16px' },
  statNum: { display: 'block', fontSize: 'clamp(1.6rem,5vw,2.5rem)', fontWeight: 800, color: '#b8986a' },
  statLabel: { color: '#4a7a72', fontSize: '0.85rem', marginTop: 4, display: 'block' },

  // About
  about: { padding: '80px 24px', background: '#f0f4f2' },
  aboutInner: { maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 64, alignItems: 'center' },
  sectionLabel: { color: '#2d5750', fontSize: '0.72rem', fontWeight: 700, letterSpacing: 3, borderRight: '4px solid #b8986a', paddingRight: 12 },
  aboutH2: { fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 800, color: '#1e3a34', margin: '16px 0 20px', lineHeight: 1.35 },
  aboutP: { color: '#3a5a54', lineHeight: 1.9, marginBottom: 16, fontSize: '1rem', fontWeight: 500 },
  tagRow: { display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' as const },
  tag: { background: '#f0f4f2', color: '#1e3a34', padding: '8px 16px', borderRadius: 50, fontSize: '0.85rem', fontWeight: 600 },
  quoteBox: { background: '#f0f4f2', borderRadius: 20, padding: 40, color: '#1e3a34', position: 'relative' as const, overflow: 'hidden', border: '1px solid rgba(30,58,52,0.1)' },
  quoteText: { color: '#1e3a34', fontSize: '1.05rem', lineHeight: 1.9, fontWeight: 500, position: 'relative' as const, zIndex: 1 },
  quoteBy: { color: '#b8986a', fontWeight: 700, marginTop: 24, position: 'relative' as const, zIndex: 1 },

  // Properties
  props: { padding: '80px 24px', background: '#f0f4f2' },
  propsInner: { maxWidth: 1200, margin: '0 auto' },
  sectionTitle: { textAlign: 'center' as const, marginBottom: 48 },
  propsH2: { fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 800, color: '#1e3a34', margin: '16px 0 12px' },
  propsSub: { color: '#7a9188', fontSize: '0.95rem' },
  tabsRow: { display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' as const, marginBottom: 40 },
  tabActive: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 28px', borderRadius: 50, border: '2px solid rgba(30,58,52,0.25)', fontWeight: 700, fontSize: '0.9rem', background: '#f0f4f2', color: '#1e3a34', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(30,58,52,0.12)', fontFamily: "'Tajawal','Cairo',sans-serif" },
  tabInactive: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 28px', borderRadius: 50, border: '2px solid rgba(30,58,52,0.18)', fontWeight: 600, fontSize: '0.9rem', background: '#fff', color: '#526266', cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'Tajawal','Cairo',sans-serif" },
  grid3: { display: 'grid', gridTemplateColumns: '1fr', gap: 16 },
  skeleton: { background: '#e4ede8', borderRadius: 20, height: 288, border: '1px solid rgba(30,58,52,0.1)' },
  empty: { textAlign: 'center' as const, padding: '80px 0' },
  emptyIcon: { fontSize: '4rem', opacity: 0.2, display: 'block', marginBottom: 16 },
  emptyText: { color: '#7a9188', fontSize: '1.1rem', marginBottom: 24 },
  emptyBtn: { display: 'inline-block', background: '#f0f4f2', color: '#1e3a34', padding: '12px 28px', borderRadius: 10, fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none' },

  // Features
  features: { padding: '80px 24px', background: '#f0f4f2' },
  featInner: { maxWidth: 1000, margin: '0 auto' },
  featTitle: { textAlign: 'center' as const, marginBottom: 56 },
  featLabel: { color: '#b8986a', fontSize: '0.72rem', fontWeight: 700, letterSpacing: 3 },
  featH2: { fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 800, color: '#1e3a34', margin: '16px 0 12px' },
  featSub: { color: '#4a7a72', fontSize: '0.95rem' },
  featGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20 },
  featCard: { background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(30,58,52,0.1)', borderRadius: 20, padding: 28, textAlign: 'center' as const },
  featIcon: { fontSize: '2.5rem', display: 'block', marginBottom: 16 },
  featCardTitle: { fontWeight: 700, color: '#1e3a34', marginBottom: 12, fontSize: '1rem' },
  featCardDesc: { color: '#3a5a54', fontSize: '0.85rem', lineHeight: 1.75 },

  // CTA
  cta: { padding: '80px 24px', background: '#f0f4f2', textAlign: 'center' as const },
  ctaH2: { fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 800, color: '#1e3a34', marginBottom: 16 },
  ctaP: { color: '#2d5750', fontSize: '0.97rem', maxWidth: 500, margin: '0 auto 40px', lineHeight: 1.85 },
  ctaBtns: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' as const },
  btnWa: { background: '#25D366', color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 700, fontSize: '1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 },
  btnDark: { background: '#f0f4f2', color: '#1e3a34', padding: '14px 32px', borderRadius: 10, fontWeight: 700, fontSize: '1rem', textDecoration: 'none', display: 'inline-block', border: '1px solid rgba(30,58,52,0.2)' },
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>('الكل')
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

  // Load hero images — limit to 8 max
  useEffect(() => {
    sbFetch('properties?select=main_image&status=eq.active&main_image=not.is.null&limit=8')
      .then((data: any[]) => {
        if (!data?.length) return
        const imgs = data.map((p: any) => p.main_image).filter(Boolean)
        setHeroImages(imgs)
      })
  }, [])

  // Cycle hero images every 4 seconds
  useEffect(() => {
    if (heroImages.length < 2) return
    const timer = setInterval(() => setHeroIdx(i => (i + 1) % heroImages.length), 4000)
    return () => clearInterval(timer)
  }, [heroImages])

  useEffect(() => { loadProperties(activeTab) }, [activeTab])

  useEffect(() => {
    sbFetch('properties?select=*&status=eq.sold&order=created_at.desc', { cache: 'no-store' })
      .then((data: any) => setSoldProperties(Array.isArray(data) ? data : []))
      .catch(() => setSoldProperties([]))
  }, [])

  async function loadProperties(tab: TabKey) {
    setLoading(true)
    try {
      let filter = ''
      if      (tab === 'الكل')    filter = ''
      else if (tab === 'إيجار')  filter = `&operation=eq.${encodeURIComponent('للإيجار')}`
      else if (tab === 'تجاري')  filter = `&type=in.(${encodeURIComponent('محل تجاري')},${encodeURIComponent('مستودع')})`
      else                        filter = `&type=eq.${encodeURIComponent(tab)}`
      const data = await sbFetch(
        `properties?select=*&status=in.(active,sold)${filter}&order=is_featured.desc,created_at.desc`,
        { cache: 'no-store' }
      )
      setProperties(Array.isArray(data) ? data : [])
    } catch {
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

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
                  <img src={tab.icon} alt="" width={20} height={20} style={{ display:'inline-block', verticalAlign:'middle', marginLeft:4 }} /> {tab.label}
                </button>
              ))}
            </div>

            {/* Mobile: قائمة منسدلة */}
            <div className="sarh-tabs-mobile" style={{ display: 'none', flex: 1 }}>
              <select
                value={activeTab}
                onChange={e => setActiveTab(e.target.value as TabKey)}
                style={{ width: '100%', background: '#fff', border: '2px solid rgba(30,58,52,0.18)', borderRadius: 12, padding: '12px 16px', fontSize: '1rem', fontWeight: 700, color: '#1e3a34', fontFamily: "'Tajawal','Cairo',sans-serif", cursor: 'pointer', outline: 'none' }}
              >
                {TABS.map(tab => (
                  <option key={tab.key} value={tab.key}>{tab.icon} {tab.label}</option>
                ))}
              </select>
            </div>

            {/* Grid / Map toggle */}
            <div style={{ display: 'flex', gap: 6, background: '#fff', borderRadius: 12, padding: 4, border: '1px solid rgba(39,66,62,0.15)', flexShrink: 0 }}>
              <button onClick={() => setViewMode('grid')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, border: 'none', fontFamily: "'Tajawal','Cairo',sans-serif", fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', background: viewMode === 'grid' ? '#f0f4f2' : 'transparent', color: '#1e3a34' }}>
                ⊞ شبكة
              </button>
              <button onClick={() => setViewMode('map')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, border: 'none', fontFamily: "'Tajawal','Cairo',sans-serif", fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', background: viewMode === 'map' ? '#f0f4f2' : 'transparent', color: '#1e3a34' }}>
                🗺️ خريطة
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
              ? <div style={{ height: 500, background: '#f0f4f2', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#41646d' }}>جاري التحميل...</div>
              : properties.length === 0
                ? <div style={S.empty}><span style={S.emptyIcon}>🗺️</span><p style={S.emptyText}>لا توجد عقارات في هذه الفئة حالياً</p></div>
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
            <div style={{
              height: '100vh',
              overflowY: 'scroll',
              scrollSnapType: 'y mandatory',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: 24,
            }}>
              {properties.map(p => (
                <div key={p.id} style={{
                  height: '88vh',
                  scrollSnapAlign: 'start',
                  padding: '0 0 16px',
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
            color: '#f0f4f2', fontFamily: "'Tajawal','Cairo',sans-serif",
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
              <span style={{ color:'#b8986a', fontSize:'0.72rem', fontWeight:700, letterSpacing:3 }}>✦ أعمالنا المنجزة</span>
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
          <a href="https://wa.me/966552226345" target="_blank" rel="noopener noreferrer" style={S.btnWa}>💬 تواصل على واتساب</a>
          <a href="tel:+966552226345" style={S.btnDark}>📞 اتصل بنا</a>
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

