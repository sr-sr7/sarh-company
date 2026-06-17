import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import PromoWidget     from '@/components/PromoWidget'
import InstallPrompt   from '@/components/InstallPrompt'
import WaterDropIntro  from '@/components/WaterDropIntro'
import CapacitorInit   from '@/components/CapacitorInit'
import PushNotifications from '@/components/PushNotifications'
import CompareBar      from '@/components/CompareBar'

// ── Viewport (themeColor moved here — fixes Next.js warning) ──
export const viewport: Viewport = {
  themeColor:          '#1e3a34',
  width:               'device-width',
  initialScale:        1,
  viewportFit:         'cover',
}

// ── SEO Metadata ──
export const metadata: Metadata = {
  metadataBase: new URL('https://sarh-company.com'),
  title: {
    default:  'شركة صرح العقارية — القصيم | بريدة',
    template: '%s | صرح العقارية',
  },
  description: 'شركة صرح العقارية في القصيم — بريدة. نقدم خدمات عقارية متكاملة من بيع وإيجار وتطوير في منطقة القصيم والمملكة العربية السعودية.',
  keywords:    ['عقارات القصيم', 'عقارات بريدة', 'شقق للبيع القصيم', 'فلل للبيع بريدة', 'صرح العقارية', 'عقارات للإيجار القصيم'],
  manifest:    '/manifest.json',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates:  { canonical: 'https://sarh-company.com' },
  icons: {
    icon:  [{ url: '/icon-512.png', type: 'image/png' }],
    apple: [{ url: '/icon-192.png' }],
  },
  appleWebApp: { capable: true, title: 'صرح العقارية', statusBarStyle: 'black-translucent' },
  openGraph: {
    siteName:    'شركة صرح العقارية',
    title:       'شركة صرح العقارية — القصيم | بريدة',
    description: 'خدمات عقارية متكاملة من بيع وإيجار وتطوير في منطقة القصيم والمملكة العربية السعودية.',
    locale:      'ar_SA',
    type:        'website',
    url:         'https://sarh-company.com',
    images:      [{ url: '/icon-512.png', width: 512, height: 512, alt: 'شركة صرح العقارية' }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'شركة صرح العقارية — القصيم | بريدة',
    description: 'خدمات عقارية متكاملة في القصيم — بريدة',
    images:      ['/icon-512.png'],
  },
}

const jsonLd = {
  '@context':    'https://schema.org',
  '@type':       'RealEstateAgent',
  name:          'شركة صرح العقارية',
  alternateName: 'SARH Real Estate',
  url:           'https://sarh-company.com',
  logo:          'https://sarh-company.com/icon-512.png',
  image:         'https://sarh-company.com/icon-512.png',
  description:   'شركة صرح العقارية في القصيم — بريدة. خدمات عقارية متكاملة من بيع وإيجار وتطوير.',
  telephone:     '+966552226345',
  address: {
    '@type':          'PostalAddress',
    addressLocality:  'بريدة',
    addressRegion:    'القصيم',
    addressCountry:   'SA',
  },
  areaServed: 'المملكة العربية السعودية',
  sameAs:     ['https://wa.me/966552226345'],
  openingHours: 'Mo-Sa 08:00-22:00',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* Preconnect for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&family=Amiri:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <meta name="mobile-web-app-capable"       content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192.png" />

        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-tajawal bg-cream text-green-dark antialiased">
        {children}
        <WaterDropIntro />
        <InstallPrompt />
        <CapacitorInit />
        <PushNotifications />
        <PromoWidget />
        <CompareBar />

        {/* Google Analytics — deferred so it doesn't block render */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-L8HPBT7YXT" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-L8HPBT7YXT', { anonymize_ip: true });
        `}</Script>
      </body>
    </html>
  )
}
