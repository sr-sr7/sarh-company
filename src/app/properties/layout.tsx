import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'عقارات للبيع والإيجار | صرح العقارية',
  description: 'تصفح جميع عقارات صرح العقارية — فلل، شقق، أراضي، استراحات وشاليهات في بريدة وعنيزة والقصيم.',
  alternates: {
    canonical: 'https://sarh-company.com/properties',
  },
  openGraph: {
    title: 'عقارات للبيع والإيجار | صرح العقارية',
    description: 'تصفح جميع عقارات صرح العقارية — فلل، شقق، أراضي، استراحات وشاليهات في بريدة وعنيزة والقصيم.',
    url: 'https://sarh-company.com/properties',
    siteName: 'صرح العقارية',
    locale: 'ar_SA',
    type: 'website',
  },
}

export default function PropertiesLayout({ children }: { children: React.ReactNode }) {
  return children
}
