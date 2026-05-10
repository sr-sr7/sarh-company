import Image from 'next/image'

const cats = [
  { name: 'فلل', count: '+128', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80' },
  { name: 'شقق', count: '+96', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80' },
  { name: 'أراضي', count: '+204', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80' },
  { name: 'استراحات', count: '+47', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80' },
  { name: 'محلات', count: '+62', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80' },
  { name: 'مزارع', count: '+18', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80' },
]

export default function Categories() {
  return (
    <section id="categories" className="container-x py-14 md:py-20">
      <div className="flex justify-between items-end flex-wrap gap-3 mb-8">
        <div>
          <div className="text-xs text-moss-600 tracking-[3px] mb-2 uppercase">— تصفّح حسب النوع</div>
          <h2 className="font-amiri text-3xl md:text-4xl text-ink font-medium">أنواع <span className="text-moss-600">العقارات</span></h2>
        </div>
        <a href="#properties" className="text-sm text-ink-700 hover:underline">عرض الكل ←</a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
        {cats.map(c => (
          <a key={c.name} href="#properties" className="group relative aspect-[4/5] md:aspect-[4/3] rounded-2xl overflow-hidden block">
            <Image src={c.image} alt={c.name} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover group-hover:scale-110 transition duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" />
            <div className="absolute bottom-0 right-0 left-0 p-4 md:p-5 text-sand">
              <div className="font-amiri text-xl md:text-2xl font-medium mb-0.5">{c.name}</div>
              <div className="text-[11px] opacity-75">{c.count} عقار</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
