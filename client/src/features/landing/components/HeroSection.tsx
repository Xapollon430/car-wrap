import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

function HeroSection() {
  return (
    <section
      className="hero-mobile-left-focus relative isolate min-h-svh w-full overflow-hidden"
      style={{
        backgroundImage: "url('/cars/bmwi8.jpg')",
      }}
    >
      <div className="texture-overlay absolute inset-0" />

      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 md:px-10">
        <a
          href="https://luxgaragedmv.com/"
          target="_blank"
          rel="noreferrer"
          aria-label="Lux Garage Wrap"
          className="transition hover:opacity-90"
        >
          <img
            src="/lux-garage-logo-rev-1455.png"
            alt="Lux Garage Wrap"
            className="block h-7 w-auto md:h-9"
          />
        </a>
        <nav className="flex items-center gap-6 text-xs font-semibold uppercase tracking-[0.24em] text-neutral-200/80 md:text-sm">
          <a href="#services" className="transition hover:text-white">
            Services
          </a>
          <a href="#gallery" className="transition hover:text-white">
            Gallery
          </a>
          <a
            href="https://luxgaragedmv.com/"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-white"
          >
            Book
          </a>
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
            Lux Garage Wrap • DMV
          </p>
          <h1 className="display-font text-6xl leading-[0.9] text-white sm:text-7xl md:text-8xl lg:text-9xl">
            Premium Wraps. Real Presence.
          </h1>
          <p className="mt-6 max-w-xl text-sm text-neutral-200/90 md:text-base">
            Precision installation, premium finishes, and photoreal previews
            for builds that stand out cleanly.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
            <Link
              to="/visualizer"
              className="rounded-full bg-[#ff7a18] px-7 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black transition hover:bg-[#ff8d3a]"
            >
              Explore
            </Link>
            <a
              href="https://luxgaragedmv.com/"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/45 bg-black/25 px-7 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:border-white"
            >
              Book A Wrap
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

export default HeroSection
