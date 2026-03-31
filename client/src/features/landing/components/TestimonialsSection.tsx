import { motion } from 'framer-motion'
import { sectionReveal } from '../motion'

type Testimonial = {
  quote: string
  name: string
  role: string
}

type TestimonialsSectionProps = {
  testimonials: readonly Testimonial[]
}

function TestimonialsSection({
  testimonials,
}: TestimonialsSectionProps) {
  return (
    <motion.section
      className="mx-auto w-full max-w-6xl px-5 pb-20 md:px-8"
      {...sectionReveal}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
        Testimonials
      </p>
      <h2 className="display-font mt-3 text-5xl text-white md:text-6xl">
        Trusted By Owners Who Notice Details
      </h2>
      <div className="mt-10 grid gap-7 md:grid-cols-3">
        {testimonials.map((item) => (
          <blockquote key={item.name} className="border-t border-white/18 pt-5">
            <p className="text-sm leading-relaxed text-neutral-200">
              “{item.quote}”
            </p>
            <footer className="mt-5">
              <p className="text-sm font-semibold text-white">{item.name}</p>
              <p className="text-xs uppercase tracking-[0.16em] text-neutral-400">
                {item.role}
              </p>
            </footer>
          </blockquote>
        ))}
      </div>
    </motion.section>
  )
}

export default TestimonialsSection
