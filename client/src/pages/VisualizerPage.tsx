import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ImageModal from '../components/ImageModal'
import PreviewPanel from '../features/visualizer/components/PreviewPanel'
import SelectorPanel from '../features/visualizer/components/SelectorPanel'
import UploadCatalogModal from '../features/visualizer/components/UploadCatalogModal'
import { useVisualizer } from '../features/visualizer/hooks/useVisualizer'

function VisualizerPage() {
  const { carPanel, wrapPanel, previewPanel, uploadModal, imageModal } =
    useVisualizer()

  return (
    <div className="min-h-screen bg-[#070707] text-neutral-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,122,24,0.16),transparent_32%),radial-gradient(circle_at_90%_22%,rgba(255,255,255,0.08),transparent_20%)]" />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/55 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-3 md:px-8">
          <Link to="/" className="transition hover:opacity-90">
            <p className="display-font text-2xl leading-none text-white md:text-3xl">
              WrapPilot
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
              AI wrap visualizer
            </p>
          </Link>
          <Link
            to="/"
            className="rounded-full border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-200 transition hover:border-white hover:text-white"
          >
            Back To Home
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-5 py-5 md:px-8 md:py-6">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-4"
        >
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
            WrapPilot
          </p>
          <h1 className="display-font text-3xl leading-[0.94] text-white md:text-5xl">
            Build Your Wrap Preview
          </h1>
        </motion.section>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_1.1fr_0.9fr]">
          <SelectorPanel {...carPanel} />
          <SelectorPanel {...wrapPanel} />
          <PreviewPanel {...previewPanel} />
        </div>
      </main>

      <UploadCatalogModal {...uploadModal} />
      <ImageModal {...imageModal} />
    </div>
  )
}

export default VisualizerPage
