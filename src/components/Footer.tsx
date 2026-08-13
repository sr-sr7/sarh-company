import { LOGO_GIF } from '@/lib/logo'

export default function Footer() {
  const S = {
    footer: { background: '#f0f4f2', color: '#3a5a54', padding: '60px 5% 30px', direction: 'rtl' as const },
    grid: { maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 48, paddingBottom: 40 },
    brand: { fontSize: '1.1rem', fontWeight: 700, color: '#1e3a34', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 },
    brandAccent: { color: '#b8986a' },
    desc: { fontSize: '0.88rem', lineHeight: 1.85, color: '#1e3a34', fontWeight: 500 },
    heading: { fontSize: '0.75rem', letterSpacing: 2, textTransform: 'uppercase' as const, color: '#1e3a34', fontWeight: 700, marginBottom: 18 },
    list: { listStyle: 'none', display: 'flex', flexDirection: 'column' as const, gap: 10 },
    link: { color: '#1e3a34', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600 },
    contactItem: { display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', marginBottom: 10, color: '#1e3a34', fontWeight: 500 },
    bottom: { maxWidth: 1100, margin: '24px auto 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'rgba(30,58,52,0.7)', fontWeight: 500, flexWrap: 'wrap' as const, gap: 10 },
    bottomLink: { color: '#b8986a', textDecoration: 'none' },
  }

  return (
    <footer style={S.footer}>
      <div style={S.grid}>
        <div>
          <div style={S.brand}>
            <img src={LOGO_GIF} alt="صرح" width={60} height={60} style={{ borderRadius: 8, filter: 'brightness(0.15) saturate(1.5)' }} />
            <div>
              <div>صرح <span style={S.brandAccent}>العقارية</span></div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(211,226,220,0.35)', marginTop: 2 }}>SARH REAL ESTATE</div>
            </div>
          </div>
          <p style={S.desc}>شركة عقارية متخصصة في منطقة القصيم، تقدم خدمات عقارية بخبرة متكاملة</p>
        </div>

        <div>
          <p style={S.heading}>روابط سريعة</p>
          <ul style={S.list}>
            {[['الرئيسية','/'],['عن صرح','/#about'],['العقارات','/#properties']].map(([l,h]) => (
              <li key={l}><a href={h} style={S.link}>{l}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <p style={S.heading}>تواصل معنا</p>
          <div style={S.contactItem}>📍 القصيم، المملكة العربية السعودية</div>
          <div style={S.contactItem}>
            📞
            <a href="tel:+966552226345" style={{ ...S.link, direction: 'ltr' }}>+966 55 222 6345</a>
            <span style={{ color:'rgba(30,58,52,0.4)' }}>-</span>
            <a href="tel:+966552226257" style={{ ...S.link, direction: 'ltr' }}>+966 55 222 6257</a>
          </div>
          <div style={S.contactItem}>
            ✉️ <a href="mailto:mktbsrh1@gmail.com" style={S.link}>mktbsrh1@gmail.com</a>
          </div>
          <div style={S.contactItem}>
            🗺️ <a href="https://maps.app.goo.gl/G4TnGed4wSSS5BiG9" target="_blank" rel="noopener noreferrer" style={S.link}>موقع الشركة</a>
          </div>
        </div>
      </div>

      {/* أيقونات التواصل الاجتماعي — صف مستقل بالوسط */}
      <div style={{ maxWidth: 1100, margin: '32px auto 0', paddingTop: 8 }}>
        <p style={{ ...S.heading, marginBottom: 16, textAlign: 'center' as const }}>تابعنا</p>

        {/* الأيقونات — صف أفقي دائماً */}
        <div style={{ display: 'flex', flexDirection: 'row' as const, flexWrap: 'nowrap' as const, gap: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 14 }}>
          {[
            { label: 'واتساب',   href: 'https://wa.me/966552226345',                          svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L.057 23.5a.5.5 0 00.611.611l5.638-1.475A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.896 0-3.67-.523-5.188-1.434l-.372-.22-3.853 1.009 1.026-3.742-.242-.386A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg> },
            { label: 'سناب شات', href: 'https://www.snapchat.com/add/sarh_company',           svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.166 3C8.758 3 6 5.756 6 9.167c0 .933.103 1.62.243 2.246-.27.135-.573.21-.9.21-.34 0-.636-.083-.9-.21l-.08-.04c-.13-.06-.26-.09-.39-.09-.44 0-.76.32-.76.73 0 .33.21.61.53.73.06.02 1.54.44 1.85 2.01.01.06.02.12.02.18 0 .09-.02.18-.06.26-.43.82-1.56 1.16-2.2 1.38-.33.11-.54.3-.54.55 0 .33.34.6.8.6.13 0 .27-.02.41-.06.62-.17 1.2-.26 1.68-.26.34 0 .62.04.84.1-.08.63-.12 1.28-.12 1.95 0 .28.22.5.5.5h.06c.77-.06 1.52-.34 2.22-.62.82-.32 1.67-.65 2.6-.65.93 0 1.78.33 2.6.65.7.28 1.45.56 2.22.62h.06c.28 0 .5-.22.5-.5 0-.67-.04-1.32-.12-1.95.22-.06.5-.1.84-.1.48 0 1.06.09 1.68.26.14.04.28.06.41.06.46 0 .8-.27.8-.6 0-.25-.21-.44-.54-.55-.64-.22-1.77-.56-2.2-1.38a.538.538 0 01-.06-.26c0-.06.01-.12.02-.18.31-1.57 1.79-1.99 1.85-2.01.32-.12.53-.4.53-.73 0-.41-.32-.73-.76-.73-.13 0-.26.03-.39.09l-.08.04c-.264.127-.56.21-.9.21-.327 0-.63-.075-.9-.21.14-.626.243-1.313.243-2.246C18.333 5.756 15.575 3 12.166 3z"/></svg> },
            { label: 'انستقرام', href: 'https://www.instagram.com/sarh_company',              svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
            { label: 'تيك توك',  href: 'https://www.tiktok.com/@sarh_company',                svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/></svg> },
            { label: 'تويتر',    href: 'https://twitter.com/sarh_company',                    svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
            { label: 'يوتيوب',   href: 'https://www.youtube.com/@%D8%B5%D8%B1%D8%AD%D8%A7%D9%84%D8%B9%D9%82%D8%A7%D8%B1%D9%8A%D8%A9', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
          ].map(({ label, href, svg }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" title={label}
              style={{ display:'flex', alignItems:'center', justifyContent:'center', width:38, height:38, borderRadius:10, background:'transparent', color:'#1e3a34', textDecoration:'none', flexShrink:0, border:'1.5px solid rgba(30,58,52,0.3)' }}>
              {svg}
            </a>
          ))}
        </div>

        {/* السجل التجاري ورخصة فال */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 8, marginTop: 4 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e3a34' }}>سجل تجاري رقم 7040771805</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e3a34' }}>رخصة فال 1200028344</span>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(30,58,52,0.12)', maxWidth: 1100, margin: '0 auto', padding: '28px 0 10px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 10 }}>
        <a
          href="https://wa.me/966591088884"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8, textDecoration: 'none' }}
        >
          <img src="/asimjed-logo.png" alt="AsiMjed" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} style={{ width: 100, height: 100, objectFit: 'contain' }} />
          <span style={{ color: 'rgba(30,58,52,0.7)', fontSize: '0.78rem', fontWeight: 500, fontFamily: "'Tajawal','Cairo',sans-serif", textAlign: 'center' as const }}>
            تم تطوير وتنفيذ هذا الموقع من قبل مجموعة AsiMjed لتطوير المواقع — للتواصل 0591088884
          </span>
        </a>
      </div>

      <div style={S.bottom}>
        <span>© 2026 صرح العقارية — جميع الحقوق محفوظة</span>
      </div>
    </footer>
  )
}
