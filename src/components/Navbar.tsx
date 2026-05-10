'use client'
import { useState, useEffect } from 'react'
import Logo from './Logo'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { href: '#properties', label: 'العقارات' },
    { href: '#categories', label: 'الفئات' },
    { href: '#services', label: 'خدماتنا' },
    { href: '#contact', label: 'تواصل' },
  ]

  return (
    <header
      className={`sticky top-0 z-40 transition-all ${scrolled ? 'border-b border-ink/10' : ''}`}
      style={{ background: scrolled ? 'rgba(250,248,245,0.85)' : 'transparent', backdropFilter: scrolled ? 'blur(12px)' : 'none' }}
    >
      <div className="container-x flex items-center justify-between h-16">
        <a href="/" className="flex items-center gap-2">
          <Logo size={36} />
          <div className="leading-none">
            <div className="font-amiri text-lg text-ink font-medium">صرح</div>
            <div className="text-[8px] text-moss-500 tracking-[2px] mt-0.5">SARH REAL ESTATE</div>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-7">
          {links.map(l => (
            <a key={l.href} href={l.href} className="text-sm text-ink/80 hover:text-ink transition">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://wa.me/966500000000"
            className="bg-ink text-sand px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-ink-900 transition"
          >
            تواصل واتساب
          </a>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden w-10 h-10 flex items-center justify-center text-ink rounded-lg hover:bg-ink/5"
          aria-label="القائمة"
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h12" /></svg>
          )}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-ink/10 bg-cream">
          <div className="container-x py-4 flex flex-col gap-1">
            {links.map(l => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 px-3 text-sm text-ink/85 hover:bg-ink/5 rounded-lg"
              >
                {l.label}
              </a>
            ))}
            <a
              href="https://wa.me/966500000000"
              className="mt-2 bg-ink text-sand py-3 rounded-lg text-sm font-medium text-center"
            >
              تواصل واتساب
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
