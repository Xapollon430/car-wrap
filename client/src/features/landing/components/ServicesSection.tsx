import { motion } from 'framer-motion'
import { sectionReveal } from '../motion'

type Service = {
  id: string
  name: string
  description: string
}

type ServicesSectionProps = {
  services: readonly Service[]
}

function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <motion.section
      id="services"
      className="mx-auto w-full max-w-6xl px-5 py-20 md:px-8"
      {...sectionReveal}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
        Services
      </p>
      <h2 className="display-font mt-3 text-5xl text-white md:text-6xl">
        Built Clean. Installed Right.
      </h2>
      <ul className="mt-10 divide-y divide-white/12 border-y border-white/12">
        {services.map((service) => (
          <li
            key={service.id}
            className="grid gap-4 py-7 md:grid-cols-[80px_1fr_1.2fr] md:items-center"
          >
            <p className="text-sm font-semibold text-[#ff7a18]">{service.id}</p>
            <h3 className="text-2xl font-semibold text-white">{service.name}</h3>
            <p className="text-sm leading-relaxed text-neutral-300">
              {service.description}
            </p>
          </li>
        ))}
      </ul>
    </motion.section>
  )
}

export default ServicesSection
