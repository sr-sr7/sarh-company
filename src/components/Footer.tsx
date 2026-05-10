import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="bg-ink text-sand/70 pt-12 md:pt-16 pb-6">
      <div className="container-x grid md:grid-cols-4 gap-8 md:gap-12 mb-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <Logo size={42} bg="#f4ede4" color="#1e3a34" />
            <div>
              <div className="font-amiri text-2xl text-sand">صرح</div>
              <div className="text-[9px] tracking-[2px] opacity-60">SARH REAL ESTATE</div>
            </div>
          </div>
          <p className="text-sm leading-relaxed max-w-md mb-6">صرح العقارية — متخصصون في عقارات منطقة القصيم. نقدّم خدمات البيع والشراء والتأجير بمعايير الأصالة والتميّز.</p>
          <div className="flex gap-3">
            <a href="https://wa.me/966500000000" target="_blank" rel="noopener" aria-label="واتساب" className="w-9 h-9 rounded-full bg-sand/10 hover:bg-sand/20 flex items-center justify-center transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074" /></svg>
            </a>
          </div>
        </div>
        <div>
          <div className="font-medium text-sand mb-4 text-sm">الموقع</div>
          <ul className="space-y-2 text-sm">
            <li><a href="#properties" className="hover:text-sand transition">العقارات</a></li>
            <li><a href="#categories" className="hover:text-sand transition">الفئات</a></li>
            <li><a href="#services" className="hover:text-sand transition">خدماتنا</a></li>
            <li><a href="#contact" className="hover:text-sand transition">تواصل</a></li>
          </ul>
        </div>
        <div>
          <div className="font-medium text-sand mb-4 text-sm">تواصل</div>
          <ul className="space-y-2 text-sm">
            <li>بريدة، منطقة القصيم</li>
            <li><a href="tel:+966500000000">+966 50 000 0000</a></li>
          </ul>
        </div>
      </div>
      <div className="container-x pt-6 border-t border-sand/10 flex justify-between items-center flex-wrap gap-2 text-xs">
        <div>© 2026 صرح العقارية. جميع الحقوق محفوظة.</div>
        <a href="/admin" className="opacity-50 hover:opacity-100 transition">لوحة التحكم</a>
      </div>
    </footer>
  )
}
