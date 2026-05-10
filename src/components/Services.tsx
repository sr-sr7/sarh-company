const services = [
  { title: 'بيع وشراء', desc: 'نتولّى عمليات البيع والشراء بمتابعة كاملة من الفحص حتى نقل الملكية', d: 'M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7' },
  { title: 'تأجير وإدارة', desc: 'إدارة عقارية احترافية، تحصيل وعقود واستلام وتسليم', d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-5h-2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
  { title: 'استثمار الأراضي', desc: 'فرص استثمارية مدروسة في أفضل مواقع القصيم', d: 'M3 3h18v18H3z' },
  { title: 'تقييم العقارات', desc: 'تقييم احترافي معتمد بناءً على دراسة السوق والموقع', d: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
]

export default function Services() {
  return (
    <section id="services" className="bg-sand py-14 md:py-20">
      <div className="container-x">
        <div className="text-center mb-10 md:mb-14">
          <div className="text-xs text-moss-600 tracking-[3px] mb-2 uppercase">— ماذا نقدّم</div>
          <h2 className="font-amiri text-3xl md:text-4xl text-ink font-medium">خدماتنا <span className="text-moss-600">المتكاملة</span></h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {services.map(s => (
            <div key={s.title} className="bg-cream rounded-2xl p-5 md:p-6 border border-ink/10 hover:border-ink/25 transition">
              <div className="w-11 h-11 rounded-xl bg-ink/8 text-ink flex items-center justify-center mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={s.d} /></svg>
              </div>
              <div className="font-amiri text-lg text-ink font-medium mb-2">{s.title}</div>
              <div className="text-xs text-moss-500 leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
