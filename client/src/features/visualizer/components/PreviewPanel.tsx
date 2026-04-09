import { useState } from 'react'
import NoticeText from './NoticeText'
import SaveLeadModal from './SaveLeadModal'

type PreviewPanelProps = {
  selectedCarLabel: string | null
  selectedWrapLabel: string | null
  catalogErrorMessage: string | null
  canGenerate: boolean
  isCatalogLoading: boolean
  isGenerating: boolean
  errorMessage: string | null
  generatedImageUrl: string | null
  onGenerate: () => void
  onOpenPreview: () => void
}

function PreviewPanel({
  selectedCarLabel,
  selectedWrapLabel,
  catalogErrorMessage,
  canGenerate,
  isCatalogLoading,
  isGenerating,
  errorMessage,
  generatedImageUrl,
  onGenerate,
  onOpenPreview,
}: PreviewPanelProps) {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)

  return (
    <>
      <section
        className="glass-surface rounded-2xl p-4 md:p-5"
        aria-label="result preview"
      >
      <h2 className="text-lg font-semibold text-white">Preview</h2>
      <div className="mt-3 space-y-2 text-sm">
        <p className="text-neutral-300">
          Car:{' '}
          <span className="font-semibold text-white">
            {selectedCarLabel ?? 'Not selected'}
          </span>
        </p>
        <p className="text-neutral-300">
          Wrap:{' '}
          <span className="font-semibold text-white">
            {selectedWrapLabel ?? 'Not selected'}
          </span>
        </p>
      </div>

      {catalogErrorMessage ? (
        <NoticeText
          message={catalogErrorMessage}
          tone="error"
          className="mt-4"
        />
      ) : null}

      <button
        type="button"
        disabled={!canGenerate || isGenerating || isCatalogLoading}
        onClick={onGenerate}
        className="mt-5 w-full rounded-xl bg-[#ff7a18] px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black transition hover:bg-[#ff8d3a] disabled:cursor-not-allowed disabled:bg-neutral-600 disabled:text-neutral-300"
      >
        {isGenerating ? 'Generating...' : 'Generate'}
      </button>

      {errorMessage ? (
        <NoticeText message={errorMessage} tone="error" className="mt-4" />
      ) : null}

      {isGenerating ? (
        <div className="mt-6 flex items-center justify-center">
          <span
            aria-label="Generating preview"
            className="h-10 w-10 animate-spin rounded-full border-2 border-white/25 border-t-[#ff7a18]"
          />
        </div>
      ) : generatedImageUrl ? (
        <figure className="mt-5">
          <button
            type="button"
            className="w-full overflow-hidden rounded-xl border border-white/15 bg-black/30"
            onClick={onOpenPreview}
            aria-label="Open fullscreen preview"
            title="Open fullscreen preview"
          >
            <img
              src={generatedImageUrl}
              alt="Generated result"
              className="aspect-[16/10] w-full object-cover transition duration-300 hover:scale-[1.02]"
            />
          </button>
          <figcaption className="mt-2 text-xs text-neutral-400">
            Click image for fullscreen.
          </figcaption>
          <button
            type="button"
            onClick={() => {
              setIsSaveModalOpen(true)
            }}
            className="mt-3 w-full rounded-xl border border-white/20 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:border-white/40 hover:bg-white/5"
          >
            Save this image
          </button>
        </figure>
      ) : null}
      </section>

      <SaveLeadModal
        isOpen={isSaveModalOpen}
        generatedImageUrl={generatedImageUrl}
        onClose={() => setIsSaveModalOpen(false)}
        onSuccess={() => {
          setIsSaveModalOpen(false)
        }}
      />
    </>
  )
}

export default PreviewPanel
