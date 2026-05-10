import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import SearchBar from '@/components/SearchBar'
import PropertiesGrid from '@/components/PropertiesGrid'
import Categories from '@/components/Categories'
import Services from '@/components/Services'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <SearchBar />
      <PropertiesGrid />
      <Categories />
      <Services />
      <CTA />
      <Footer />
    </main>
  )
}
