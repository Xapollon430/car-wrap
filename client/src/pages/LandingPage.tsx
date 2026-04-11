import BookingSection from '../features/landing/components/BookingSection'
import GallerySection from '../features/landing/components/GallerySection'
import HeroSection from '../features/landing/components/HeroSection'
import ServicesSection from '../features/landing/components/ServicesSection'
import TestimonialsSection from '../features/landing/components/TestimonialsSection'
import { useTenantSlug } from '../features/tenant/useTenantSlug'
import {
  gallery,
  services,
  testimonials,
} from '../features/landing/content'

function LandingPage() {
  const slug = useTenantSlug()

  return (
    <div className="bg-[#060606] text-neutral-100">
      <HeroSection slug={slug} />
      <ServicesSection services={services} />
      <GallerySection images={gallery} />
      <TestimonialsSection testimonials={testimonials} />
      <BookingSection slug={slug} />
    </div>
  )
}

export default LandingPage
