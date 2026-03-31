import BookingSection from '../features/landing/components/BookingSection'
import GallerySection from '../features/landing/components/GallerySection'
import HeroSection from '../features/landing/components/HeroSection'
import ServicesSection from '../features/landing/components/ServicesSection'
import TestimonialsSection from '../features/landing/components/TestimonialsSection'
import {
  gallery,
  services,
  testimonials,
} from '../features/landing/content'

function LandingPage() {
  return (
    <div className="bg-[#060606] text-neutral-100">
      <HeroSection />
      <ServicesSection services={services} />
      <GallerySection images={gallery} />
      <TestimonialsSection testimonials={testimonials} />
      <BookingSection />
    </div>
  )
}

export default LandingPage
