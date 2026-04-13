import type { CatalogKind } from '../../../api/catalog'
import BaseModal from '../../../components/BaseModal'
import NoticeText from './NoticeText'

type UploadCatalogModalProps = {
  isOpen: boolean
  kind: CatalogKind | null
  name: string
  onNameChange: (value: string) => void
  onFileChange: (file: File | null) => void
  onUpload: () => void
  isBusy: boolean
  errorMessage: string | null
  onClose: () => void
}

function UploadCatalogModal({
  isOpen,
  kind,
  name,
  onNameChange,
  onFileChange,
  onUpload,
  isBusy,
  errorMessage,
  onClose,
}: UploadCatalogModalProps) {
  if (!isOpen || !kind) {
    return null
  }

  const label = kind === 'cars' ? 'Car' : 'Wrap'

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      closeDisabled={isBusy}
      ariaLabel={`Upload ${label}`}
      contentClassName="glass-surface max-w-md rounded-2xl p-5 md:p-6"
    >
      <h3 className="display-font pr-12 text-3xl text-white">Upload {label}</h3>

      <form
        className="mt-5 grid gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          onUpload()
        }}
      >
        <input
          type="text"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder={`${label} name`}
          className="w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-[#ff7a18]"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
          className="w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-neutral-200 file:mr-3 file:rounded-md file:border-0 file:bg-[#1b1b1b] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:uppercase file:tracking-[0.1em] file:text-neutral-200"
        />

        {errorMessage ? (
          <NoticeText message={errorMessage} tone="error" />
        ) : null}

        <div className="mt-1 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="rounded-full border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-200 transition hover:border-white/35 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isBusy}
            className="rounded-full bg-[#ff7a18] px-5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-black transition hover:bg-[#ff8d3a] disabled:cursor-not-allowed disabled:bg-neutral-600 disabled:text-neutral-300"
          >
            {isBusy ? 'Uploading...' : `Upload ${label}`}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}

export default UploadCatalogModal
