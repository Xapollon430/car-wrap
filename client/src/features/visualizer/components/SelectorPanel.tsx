import { motion } from 'framer-motion'
import type { CatalogKind } from '../../../api/catalog'
import type { CatalogItem } from '../../../types/catalog'
import LoadingIndicator from './LoadingIndicator'
import NoticeText from './NoticeText'
import SearchField from './SearchField'
import SelectorGrid from './SelectorGrid'
import SelectorPager from './SelectorPager'
import UploadIconButton from './UploadIconButton'

type SelectorPanelProps = {
  kind: CatalogKind
  query: string
  onQueryChange: (value: string) => void
  onUploadClick: () => void
  isUploading: boolean
  errorMessage: string | null
  isLoading: boolean
  items: CatalogItem[]
  allItemCount: number
  selectedId: string | null
  onSelect: (id: string) => void
  deletingId: string | null
  onDelete: (item: CatalogItem) => void
  currentPage: number
  totalPages: number
  onPreviousPage: () => void
  onNextPage: () => void
}

function SelectorPanel({
  kind,
  query,
  onQueryChange,
  onUploadClick,
  isUploading,
  errorMessage,
  isLoading,
  items,
  allItemCount,
  selectedId,
  onSelect,
  deletingId,
  onDelete,
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
}: SelectorPanelProps) {
  const pluralLabel = kind === 'cars' ? 'cars' : 'wraps'
  const singularLabel = kind === 'cars' ? 'car' : 'wrap'
  const searchLabel = `Search ${pluralLabel}`
  const emptyMessage =
    allItemCount === 0
      ? `No ${pluralLabel} uploaded yet.`
      : `No ${pluralLabel} match "${query}".`

  return (
    <section
      className="glass-surface flex h-full flex-col rounded-2xl p-4 md:p-5"
      aria-label={`${singularLabel} options`}
    >
      {errorMessage ? (
        <NoticeText message={errorMessage} tone="error" className="mt-4" />
      ) : null}

      <SearchField
        id={`search-${pluralLabel}`}
        label={searchLabel}
        value={query}
        onChange={onQueryChange}
        placeholder={`Type to filter ${pluralLabel}`}
        trailingAction={
          <UploadIconButton
            label={isUploading ? `Uploading ${singularLabel}` : `Upload ${singularLabel}`}
            isBusy={isUploading}
            onClick={onUploadClick}
          />
        }
      />

      <div className="flex min-h-[24rem] flex-1 flex-col">
        {isLoading ? (
          <LoadingIndicator
            label={`Loading ${pluralLabel}`}
            message={`Loading ${pluralLabel}...`}
            className="mt-3"
          />
        ) : items.length > 0 ? (
          <>
            <motion.div
              key={`${kind}-${currentPage}-${query.trim().toLowerCase()}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="mt-3"
            >
              <SelectorGrid
                items={items}
                selectedId={selectedId}
                onSelect={onSelect}
                deletingId={deletingId}
                onDelete={onDelete}
                selectionLabelPrefix={`Select ${singularLabel}`}
              />
            </motion.div>
            <div className="mt-auto pt-4">
              <SelectorPager
                kind={kind}
                currentPage={currentPage}
                totalPages={totalPages}
                onPrevious={onPreviousPage}
                onNext={onNextPage}
              />
            </div>
          </>
        ) : (
          <NoticeText message={emptyMessage} className="mt-3" />
        )}
      </div>
    </section>
  )
}

export default SelectorPanel
