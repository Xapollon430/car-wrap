import type { CatalogKind } from '../../../api/catalog'

type SelectorPagerProps = {
  kind: CatalogKind
  currentPage: number
  totalPages: number
  onPrevious: () => void
  onNext: () => void
}

function SelectorPager({
  kind,
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}: SelectorPagerProps) {
  const label = kind === 'cars' ? 'cars' : 'wraps'

  return (
    <div className="mt-auto flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentPage === 1}
        aria-label={`Previous ${label} page`}
        className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-sm text-neutral-200 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:border-white/8 disabled:text-neutral-500"
      >
        <span aria-hidden="true">&lsaquo;</span>
      </button>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
        Page {currentPage} of {totalPages}
      </p>
      <button
        type="button"
        onClick={onNext}
        disabled={currentPage === totalPages}
        aria-label={`Next ${label} page`}
        className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-sm text-neutral-200 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:border-white/8 disabled:text-neutral-500"
      >
        <span aria-hidden="true">&rsaquo;</span>
      </button>
    </div>
  )
}

export default SelectorPager
