import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import PromoWidget from '@/components/PromoWidget'
import CapacitorInit from '@/components/CapacitorInit'
import PushNotifications from '@/components/PushNotifications'
import CompareBar  from '@/components/CompareBar'

export const metadata: Metadata = {
  title:       'شركة صرح العقارية - القصيم | بريدة',
  description: 'شركة صرح العقارية في القصيم — بريدة. نقدم خدمات عقارية متكاملة من بيع وإيجار وتطوير في منطقة القصيم والمملكة العربية السعودية.',
  manifest:    '/manifest.json',
  themeColor:  '#1e3a34',
  icons: {
    icon:      '/icon-512.png',
    shortcut:  '/icon-512.png',
    apple:     '/icon-192.png',
  },
  appleWebApp: { capable: true, title: 'صرح العقارية', statusBarStyle: 'black-translucent' },
  openGraph: {
    siteName:    'شركة صرح العقارية',
    title:       'شركة صرح العقارية - القصيم | بريدة',
    description: 'شركة صرح العقارية في القصيم — بريدة. نقدم خدمات عقارية متكاملة من بيع وإيجار وتطوير في منطقة القصيم والمملكة العربية السعودية.',
    locale:      'ar_SA',
    type:        'website',
    url:         'https://sarh-company.com',
    images:      [{ url: 'https://sarh-company.com/icon-512.png', width: 512, height: 512, alt: 'شركة صرح العقارية' }],
  },
  twitter: {
    card:        'summary',
    title:       'شركة صرح العقارية - القصيم | بريدة',
    description: 'خدمات عقارية متكاملة في القصيم — بريدة',
    images:      ['https://sarh-company.com/icon-512.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&family=Amiri:wght@400;700&display=swap" rel="stylesheet" />
        <meta name="mobile-web-app-capable"      content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <link rel="icon"             type="image/png" href="/icon-512.png" />
        <link rel="shortcut icon"    type="image/png" href="/icon-512.png" />
        <link rel="apple-touch-icon"               href="/icon-192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateAgent",
            "name": "شركة صرح العقارية",
            "alternateName": "SARH Real Estate",
            "url": "https://sarh-company.com",
            "logo": "https://sarh-company.com/icon-512.png",
            "image": "https://sarh-company.com/icon-512.png",
            "description": "شركة صرح العقارية في القصيم — بريدة. نقدم خدمات عقارية متكاملة من بيع وإيجار وتطوير.",
            "telephone": "+966552226345",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "بريدة",
              "addressRegion": "القصيم",
              "addressCountry": "SA"
            },
            "areaServed": "المملكة العربية السعودية",
            "sameAs": ["https://wa.me/966552226345"]
          })}}
        />
      </head>
      <body className="font-tajawal bg-cream text-green-dark antialiased">
        {children}
        <CapacitorInit />
        <PushNotifications />
        <PromoWidget />
        <CompareBar />

        {/* Google Analytics */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-L8HPBT7YXT" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-L8HPBT7YXT');
        `}</Script>
      </body>
    </html>
  )
}
