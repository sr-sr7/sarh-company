import Image from 'next/image'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream">
      <div className="container-x grid md:grid-cols-2 gap-8 md:gap-12 py-12 md:py-24 items-center">
        <div className="order-2 md:order-1 animate-fade-up">
          <div className="text-xs text-moss-600 tracking-[3px] mb-4 uppercase">عقارات القصيم — الأصالة والتميّز</div>
          <h1 className="font-amiri text-[44px] md:text-[68px] leading-[1.1] text-ink font-medium mb-6 text-balance">
            نَبني <span className="text-moss-600">أُثرى</span>
            <br />
            تجربة حياتية
            <br />
            في المملكة
          </h1>
          <p className="text-base text-moss-500 leading-relaxed mb-8 max-w-md">
            صرح العقارية تُعزز مسيرة التطور من خلال استثمارات الأراضي وتطويرها، لخلق مفاهيم عقارية تتميز بالتفرد والأصالة في منطقة القصيم.
          </p>
          <div className="flex gap-3 flex-wrap">
            <a href="#properties" className="bg-ink text-sand px-6 py-3.5 rounded-xl text-sm font-medium hover:bg-ink-900 transition inline-flex items-center gap-2">
              تصفّح العقارات
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            </a>
            <a href="#contact" className="border border-ink/25 text-ink px-6 py-3.5 rounded-xl text-sm font-medium hover:bg-ink/5 transition">تواصل معنا</a>
          </div>
          <div className="grid grid-cols-3 gap-3 md:gap-6 mt-12 pt-8 border-t border-ink/10 max-w-md">
            <div><div className="font-amiri text-2xl md:text-3xl text-ink font-medium">+500</div><div className="text-[11px] text-moss-500 mt-1">عقار مُدرج</div></div>
            <div><div className="font-amiri text-2xl md:text-3xl text-ink font-medium">+1200</div><div className="text-[11px] text-moss-500 mt-1">عميل راضٍ</div></div>
            <div><div className="font-amiri text-2xl md:text-3xl text-ink font-medium">+12</div><div className="text-[11px] text-moss-500 mt-1">سنة خبرة</div></div>
          </div>
        </div>
        <div className="order-1 md:order-2 relative animate-fade-in">
          <div className="relative aspect-[4/5] md:aspect-[3/4] rounded-[28px] overflow-hidden bg-sand">
            <Image src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80" alt="فيلا فاخرة" fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
            <div className="absolute bottom-5 right-5 left-5 bg-cream/95 backdrop-blur-md rounded-2xl p-4 border border-ink/10">
              <div className="flex items-center justify-between gap-3">
                <div><div className="text-[10px] text-moss-500 mb-1">عقار مميز</div><div className="font-amiri text-lg text-ink font-medium">فيلا النزهة</div></div>
                <div className="text-left"><div className="font-amiri text-xl text-ink-700 font-medium">١٬٢٥٠٬٠٠٠</div><div className="text-[10px] text-moss-500">ريال</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
