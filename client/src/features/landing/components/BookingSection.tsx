import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { sectionReveal } from '../motion'
import type { Shop } from '../../tenant/types'

type BookingSectionProps = {
  slug: string
  shop: Shop
}

function BookingSection({ slug, shop }: BookingSectionProps) {
  const accentStyle = shop.accentColor
    ? { backgroundColor: shop.accentColor }
    : undefined

  return (
    <motion.section
      className="mx-auto w-full max-w-6xl px-5 pb-24 md:px-8"
      {...sectionReveal}
    >
      <div className="glass-surface flex flex-col gap-5 rounded-3xl p-6 md:flex-row md:items-end md:justify-between md:p-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
            Launch Now
          </p>
          <h2 className="display-font mt-3 text-5xl text-white md:text-6xl">
            Start With {shop.shopName}
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-neutral-300">
            Open the visualizer, build a preview, and capture the lead while the
            customer is still excited.
          </p>
        </div>
        <Link
          to={`/${slug}/visualizer`}
          style={accentStyle}
          className="rounded-full px-8 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-black transition hover:brightness-110"
        >
          Open Visualizer
        </Link>
      </div>
    </motion.section>
  )
}

export default BookingSection
