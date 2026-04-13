import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ImageModal from '../components/ImageModal'
import WrapPilotFooter from '../components/WrapPilotFooter'
import { DEFAULT_TENANT_SLUG } from '../features/tenant/types'
import { useShop } from '../features/tenant/useShop'
import PreviewPanel from '../features/visualizer/components/PreviewPanel'
import { useTenantSlug } from '../features/tenant/useTenantSlug'
import SelectorPanel from '../features/visualizer/components/SelectorPanel'
import UploadCatalogModal from '../features/visualizer/components/UploadCatalogModal'
import { useVisualizer } from '../features/visualizer/hooks/useVisualizer'

function VisualizerPage() {
  const slug = useTenantSlug()
  const shopState = useShop(slug)
  const { carPanel, wrapPanel, previewPanel, uploadModal, imageModal } =
    useVisualizer()

  if (shopState.status === 'loading') {
    return (
      <VisualizerStateScreen
        title="Loading shop..."
        body="Preparing the branded wrap visualizer experience."
      />
    )
  }

  if (shopState.status !== 'ready') {
    return (
      <VisualizerStateScreen
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

  const accentStyle = shopState.shop.accentColor
    ? { color: shopState.shop.accentColor }
    : undefined

  return (
    <div className="flex min-h-screen flex-col bg-[#070707] text-neutral-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,122,24,0.16),transparent_32%),radial-gradient(circle_at_90%_22%,rgba(255,255,255,0.08),transparent_20%)]" />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/55 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-3 md:px-8">
          <Link to={`/${slug}`} className="transition hover:opacity-90">
            {shopState.shop.logoUrl ? (
              <img
                src={shopState.shop.logoUrl}
                alt={shopState.shop.shopName}
                className="block h-8 w-auto md:h-10"
              />
            ) : (
              <p className="display-font text-2xl leading-none text-white md:text-3xl">
                {shopState.shop.shopName}
              </p>
            )}
          </Link>
          <Link
            to={`/${slug}`}
            className="rounded-full border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-200 transition hover:border-white hover:text-white"
          >
            Back To Home
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-5 py-5 md:px-8 md:py-6">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-4"
        >
          <p
            style={accentStyle}
            className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em]"
          >
            {shopState.shop.shopName}
          </p>
          <h1 className="display-font text-3xl leading-[0.94] text-white md:text-5xl">
            Build Your Wrap Preview
          </h1>
        </motion.section>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_1.1fr_0.9fr]">
          <SelectorPanel {...carPanel} />
          <SelectorPanel {...wrapPanel} />
          <PreviewPanel {...previewPanel} slug={slug} />
        </div>
      </main>

      <WrapPilotFooter />

      <UploadCatalogModal {...uploadModal} />
      <ImageModal {...imageModal} />
    </div>
  )
}

export default VisualizerPage

type VisualizerStateScreenProps = {
  title: string
  body: string
}

function VisualizerStateScreen({
  title,
  body,
}: VisualizerStateScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070707] px-5 text-neutral-100">
      <div className="glass-surface w-full max-w-xl rounded-3xl p-8 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
          WrapPilot
        </p>
        <h1 className="display-font mt-4 text-5xl text-white">{title}</h1>
        <p className="mt-4 text-sm text-neutral-300">{body}</p>
        <Link
          to={`/${DEFAULT_TENANT_SLUG}/visualizer`}
          className="mt-6 inline-flex rounded-full border border-white/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-200 transition hover:border-white hover:text-white"
        >
          Open Demo Visualizer
        </Link>
      </div>
    </div>
  )
}
