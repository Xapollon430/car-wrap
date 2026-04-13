import { Link } from 'react-router-dom'
import WrapPilotFooter from '../components/WrapPilotFooter'
import BookingSection from '../features/landing/components/BookingSection'
import GallerySection from '../features/landing/components/GallerySection'
import HeroSection from '../features/landing/components/HeroSection'
import ServicesSection from '../features/landing/components/ServicesSection'
import TestimonialsSection from '../features/landing/components/TestimonialsSection'
import { DEFAULT_TENANT_SLUG } from '../features/tenant/types'
import { useShop } from '../features/tenant/useShop'
import { useTenantSlug } from '../features/tenant/useTenantSlug'
import {
  gallery,
  services,
  testimonials,
} from '../features/landing/content'

function LandingPage() {
  const slug = useTenantSlug()
  const shopState = useShop(slug)

  if (shopState.status === 'loading') {
    return (
      <TenantStateScreen
        title="Loading shop..."
        body="Fetching tenant branding and destination settings."
      />
    )
  }

  if (shopState.status !== 'ready') {
    return (
      <TenantStateScreen
        title={
          shopState.status === 'inactive' ? 'Shop unavailable' : 'Shop not found'
        }
        body={
          shopState.errorMessage ??
          'This WrapPilot tenant is not available right now.'
        }
      />
    )
  }

  return (
    <div className="bg-[#060606] text-neutral-100">
      <HeroSection slug={slug} shop={shopState.shop} />
      <ServicesSection services={services} />
      <GallerySection images={gallery} />
      <TestimonialsSection testimonials={testimonials} />
      <BookingSection slug={slug} shop={shopState.shop} />
      <WrapPilotFooter />
    </div>
  )
}

export default LandingPage

type TenantStateScreenProps = {
  title: string
  body: string
}

function TenantStateScreen({ title, body }: TenantStateScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060606] px-5 text-neutral-100">
      <div className="glass-surface w-full max-w-xl rounded-3xl p-8 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
          WrapPilot
        </p>
        <h1 className="display-font mt-4 text-5xl text-white">{title}</h1>
        <p className="mt-4 text-sm text-neutral-300">{body}</p>
        <Link
          to={`/${DEFAULT_TENANT_SLUG}`}
          className="mt-6 inline-flex rounded-full border border-white/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-200 transition hover:border-white hover:text-white"
        >
          Open Demo Tenant
        </Link>
      </div>
    </div>
  )
}
