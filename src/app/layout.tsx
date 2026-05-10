import type { Metadata, Viewport } from 'next'
import { Tajawal, Amiri } from 'next/font/google'
import './globals.css'

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '700', '900'],
  variable: '--font-tajawal',
  display: 'swap',
})

const amiri = Amiri({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-amiri',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'صرح | SARH Real Estate — عقارات القصيم',
  description: 'صرح العقارية — متخصصون في عقارات القصيم. بريدة، عنيزة، الرس.',
  keywords: ['عقارات القصيم', 'بريدة', 'عنيزة', 'فلل', 'أراضي', 'صرح العقارية'],
  openGraph: {
    title: 'صرح | عقارات القصيم',
    description: 'متخصصون في عقارات القصيم بمعايير الأصالة والتميّز',
    locale: 'ar_SA',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#1e3a34',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${amiri.variable}`}>
      <body>{children}</body>
    </html>
  )
}
