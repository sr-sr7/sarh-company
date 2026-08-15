import Image from 'next/image'

export default function CTA() {
  return (
    <section id="contact" className="container-x py-14 md:py-20">
      <div className="relative bg-ink rounded-[28px] md:rounded-[36px] overflow-hidden">
        <div className="absolute inset-0 opacity-25"><Image src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80" alt="" fill sizes="100vw" className="object-cover" /></div>
        <div className="absolute inset-0 bg-gradient-to-l from-ink/90 via-ink/85 to-ink/95" />
        <div className="relative p-7 md:p-14 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="text-[11px] text-sand/60 tracking-[3px] mb-3 uppercase">— انضم إلى صرح</div>
            <h2 className="font-amiri text-3xl md:text-5xl text-sand font-medium leading-tight mb-4">عندك عقار تبي تبيعه أو تأجره؟</h2>
            <p className="text-sand/70 text-sm md:text-base leading-relaxed mb-6 max-w-md">سوّق عقارك معنا ووصِل لآلاف المشترين والمستأجرين في القصيم بفريق متخصص يعتني بكل التفاصيل.</p>
          </div>
          <div className="flex flex-col gap-3">
            <a href="https://wa.me/966557340222" target="_blank" rel="noopener" className="bg-[#25D366] text-white px-6 py-4 rounded-xl font-medium text-sm flex items-center justify-center gap-3 hover:opacity-90 transition"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487"/></svg>تواصل عبر واتساب</a>
            <a href="tel:+966557340222" className="bg-sand text-ink px-6 py-4 rounded-xl font-medium text-sm flex items-center justify-center gap-3 hover:bg-white transition"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>اتصل الآن — 0557340222</a>
            <a href="#properties" className="border border-sand/25 text-sand px-6 py-4 rounded-xl font-medium text-sm text-center hover:bg-sand/5 transition">تصفّح العقارات المتاحة</a>
          </div>
        </div>
      </div>
    </section>
  )
}
