import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const services = [
  {
    id: "01",
    name: "Color Shift Wraps",
    description:
      "Satin, gloss, metallic, and iridescent finishes installed with panel-perfect edges.",
  },
  {
    id: "02",
    name: "Fleet Branding",
    description:
      "Consistent multi-vehicle branding with durable film and production-grade color control.",
  },
  {
    id: "03",
    name: "Paint Protection + Wrap",
    description:
      "Hybrid wrap systems that blend style, chip resistance, and long-term surface protection.",
  },
];

const gallery = [
  "/cars/bmwm4.jpg",
  "/cars/mustang.jpg",
  "/cars/mercedes.jpg",
  "/cars/corvette.jpg",
  "/cars/cybertruck.jpg",
  "/cars/teslamodels.jpg",
];

const testimonials = [
  {
    quote:
      "The finish looked factory-perfect. Every edge and reflection held up exactly as promised.",
    name: "Jordan M.",
    role: "BMW M3 Owner",
  },
  {
    quote:
      "Fast turnaround, zero shortcuts. Our branded fleet finally looks cohesive and premium.",
    name: "Ari V.",
    role: "Operations Lead",
  },
  {
    quote:
      "The visualizer matched the final install shockingly well. It made choosing finish easy.",
    name: "Selena R.",
    role: "Tesla Model Y Owner",
  },
];

const sectionReveal = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.24 },
  transition: { duration: 0.55, ease: "easeOut" as const },
};

function LandingPage() {
  return (
    <div className="bg-[#060606] text-neutral-100">
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
            className="display-font text-2xl transition hover:text-[#ffb37a] md:text-3xl"
          >
            Lux Garage Wrap
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
          transition={{ duration: 0.75, ease: "easeOut" }}
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
              <p className="text-sm font-semibold text-[#ff7a18]">
                {service.id}
              </p>
              <h3 className="text-2xl font-semibold text-white">
                {service.name}
              </h3>
              <p className="text-sm leading-relaxed text-neutral-300">
                {service.description}
              </p>
            </li>
          ))}
        </ul>
      </motion.section>

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
          {gallery.map((imagePath, index) => (
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
            <blockquote
              key={item.name}
              className="border-t border-white/18 pt-5"
            >
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
    </div>
  );
}

export default LandingPage;
