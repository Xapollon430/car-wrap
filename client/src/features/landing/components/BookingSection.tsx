import { motion } from 'framer-motion'
import { sectionReveal } from '../motion'

function BookingSection() {
  return (
    <motion.section
      className="mx-auto w-full max-w-6xl px-5 pb-24 md:px-8"
      {...sectionReveal}
    >
      <div className="glass-surface flex flex-col gap-5 rounded-3xl p-6 md:flex-row md:items-end md:justify-between md:p-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
            Book Now
          </p>
          <h2 className="display-font mt-3 text-5xl text-white md:text-6xl">
            Start With Lux Garage Wrap
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-neutral-300">
            Visit our official site to schedule your wrap consultation and
            install.
          </p>
        </div>
        <a
          href="https://luxgaragedmv.com/"
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-[#ff7a18] px-8 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-black transition hover:bg-[#ff8d3a]"
        >
          Book At Lux Garage
        </a>
      </div>
    </motion.section>
  )
}

export default BookingSection
