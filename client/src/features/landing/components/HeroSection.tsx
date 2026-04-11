import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

type HeroSectionProps = {
  slug: string
}

function HeroSection({ slug }: HeroSectionProps) {
  return (
    <section
      className="hero-mobile-left-focus relative isolate min-h-svh w-full overflow-hidden"
      style={{
        backgroundImage: "url('/cars/bmwi8.jpg')",
      }}
    >
      <div className="texture-overlay absolute inset-0" />

      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 md:px-10">
        <Link to={`/${slug}`} className="transition hover:opacity-90">
          <p className="display-font text-2xl leading-none text-white md:text-3xl">
            WrapPilot
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
            AI wrap visualizer
          </p>
        </Link>
        <nav className="flex items-center gap-6 text-xs font-semibold uppercase tracking-[0.24em] text-neutral-200/80 md:text-sm">
          <a href="#services" className="transition hover:text-white">
            Services
          </a>
          <a href="#gallery" className="transition hover:text-white">
            Gallery
          </a>
          <Link to={`/${slug}/visualizer`} className="transition hover:text-white">
            Visualizer
          </Link>
        </nav>
      </header>

      <motion.div
        className="relative z-10 flex min-h-svh items-end justify-end px-5 pb-12 pt-28 md:px-10 md:pb-16"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
      >
        <div className="max-w-3xl text-right animate-hero-entrance">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-200/90 md:text-sm">
            WrapPilot
          </p>
          <h1 className="display-font text-6xl leading-[0.9] text-white sm:text-7xl md:text-8xl lg:text-9xl">
            Sell The Wrap Before The Install.
          </h1>
          <p className="mt-6 max-w-xl text-sm text-neutral-200/90 md:text-base">
            Let customers preview real vehicle and finish combinations before
            they ever book a consultation.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
            <Link
              to={`/${slug}/visualizer`}
              className="rounded-full bg-[#ff7a18] px-7 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black transition hover:bg-[#ff8d3a]"
            >
              Open Visualizer
            </Link>
            <a
              href="#gallery"
              className="rounded-full border border-white/45 bg-black/25 px-7 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:border-white"
            >
              See Examples
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

export default HeroSection
