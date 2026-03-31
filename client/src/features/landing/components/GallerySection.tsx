import { motion } from 'framer-motion'
import { sectionReveal } from '../motion'

type GallerySectionProps = {
  images: readonly string[]
}

function GallerySection({ images }: GallerySectionProps) {
  return (
    <motion.section
      id="gallery"
      className="mx-auto w-full max-w-7xl px-5 pb-20 md:px-8"
      {...sectionReveal}
    >
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
            Gallery
          </p>
          <h2 className="display-font mt-3 text-5xl text-white md:text-6xl">
            Recent Wrap Stories
          </h2>
        </div>
        <p className="hidden max-w-sm text-sm text-neutral-300 md:block">
          Real projects, studio lighting, and road-ready finish quality.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((imagePath, index) => (
          <motion.figure
            key={imagePath}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.4, delay: index * 0.04 }}
            className="overflow-hidden rounded-2xl border border-white/12"
          >
            <img
              src={imagePath}
              alt="Wrapped car project"
              className="h-64 w-full object-cover transition duration-500 hover:scale-105"
              loading="lazy"
            />
          </motion.figure>
        ))}
      </div>
    </motion.section>
  )
}

export default GallerySection
