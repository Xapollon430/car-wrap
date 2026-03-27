import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  deleteCatalogItem,
  fetchCatalog,
  uploadCatalogItem,
  type CatalogKind,
} from '../api/catalog'
import { generateFromServer } from '../api/generateFromServer'
import ImageModal from '../components/ImageModal'
import SelectorGrid from '../components/SelectorGrid'
import type { CatalogItem } from '../types/catalog'

function VisualizerPage() {
  const [cars, setCars] = useState<CatalogItem[]>([])
  const [wraps, setWraps] = useState<CatalogItem[]>([])
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null)
  const [selectedWrapId, setSelectedWrapId] = useState<string | null>(null)
  const [carSearchQuery, setCarSearchQuery] = useState('')
  const [wrapSearchQuery, setWrapSearchQuery] = useState('')
  const [isCatalogLoading, setIsCatalogLoading] = useState(true)
  const [catalogErrorMessage, setCatalogErrorMessage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [uploadModalKind, setUploadModalKind] = useState<CatalogKind | null>(null)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [carUploadName, setCarUploadName] = useState('')
  const [carUploadFile, setCarUploadFile] = useState<File | null>(null)
  const [carUploadError, setCarUploadError] = useState<string | null>(null)
  const [isUploadingCar, setIsUploadingCar] = useState(false)
  const [deletingCarId, setDeletingCarId] = useState<string | null>(null)

  const [wrapUploadName, setWrapUploadName] = useState('')
  const [wrapUploadFile, setWrapUploadFile] = useState<File | null>(null)
  const [wrapUploadError, setWrapUploadError] = useState<string | null>(null)
  const [isUploadingWrap, setIsUploadingWrap] = useState(false)
  const [deletingWrapId, setDeletingWrapId] = useState<string | null>(null)

  useEffect(() => {
    void loadCatalog()
  }, [])

  const selectedCar = useMemo(
    () => cars.find((car) => car.id === selectedCarId) ?? null,
    [cars, selectedCarId],
  )
  const selectedWrap = useMemo(
    () => wraps.find((wrap) => wrap.id === selectedWrapId) ?? null,
    [wraps, selectedWrapId],
  )

  const canGenerate = selectedCar !== null && selectedWrap !== null
  const normalizedCarQuery = carSearchQuery.trim().toLowerCase()
  const normalizedWrapQuery = wrapSearchQuery.trim().toLowerCase()

  const filteredCars = useMemo(
    () => cars.filter((car) => car.label.toLowerCase().includes(normalizedCarQuery)),
    [cars, normalizedCarQuery],
  )
  const filteredWraps = useMemo(
    () => wraps.filter((wrap) => wrap.label.toLowerCase().includes(normalizedWrapQuery)),
    [wraps, normalizedWrapQuery],
  )

  async function loadCatalog(
    preferredSelection?: { kind: CatalogKind; id: string },
  ): Promise<void> {
    setIsCatalogLoading(true)
    setCatalogErrorMessage(null)

    try {
      const result = await fetchCatalog()
      setCars(result.cars)
      setWraps(result.wraps)

      setSelectedCarId((current) => {
        if (preferredSelection?.kind === 'cars') {
          return preferredSelection.id
        }
        if (!current) {
          return null
        }
        return result.cars.some((item) => item.id === current) ? current : null
      })

      setSelectedWrapId((current) => {
        if (preferredSelection?.kind === 'wraps') {
          return preferredSelection.id
        }
        if (!current) {
          return null
        }
        return result.wraps.some((item) => item.id === current) ? current : null
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load catalog'
      setCatalogErrorMessage(`${message}. Try again.`)
    } finally {
      setIsCatalogLoading(false)
    }
  }

  async function handleGenerate(): Promise<void> {
    if (!selectedCar || !selectedWrap) {
      return
    }

    setIsGenerating(true)
    setIsModalOpen(false)
    setErrorMessage(null)

    try {
      const result = await generateFromServer({
        carName: selectedCar.label,
        wrapName: selectedWrap.label,
      })
      setGeneratedImageUrl(result.imageUrl)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not generate image'
      setErrorMessage(`${message}. Try again.`)
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleUpload(kind: CatalogKind): Promise<void> {
    const isCar = kind === 'cars'
    const name = isCar ? carUploadName.trim() : wrapUploadName.trim()
    const file = isCar ? carUploadFile : wrapUploadFile

    if (!name || !file) {
      const message = 'Name and image file are required'
      if (isCar) {
        setCarUploadError(message)
      } else {
        setWrapUploadError(message)
      }
      return
    }

    if (isCar) {
      setIsUploadingCar(true)
      setCarUploadError(null)
    } else {
      setIsUploadingWrap(true)
      setWrapUploadError(null)
    }

    try {
      const uploadedItem = await uploadCatalogItem({ kind, name, file })
      await loadCatalog({ kind, id: uploadedItem.id })

      if (isCar) {
        setCarUploadName('')
        setCarUploadFile(null)
      } else {
        setWrapUploadName('')
        setWrapUploadFile(null)
      }
      setUploadModalKind(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed'
      if (isCar) {
        setCarUploadError(`${message}. Try again.`)
      } else {
        setWrapUploadError(`${message}. Try again.`)
      }
    } finally {
      if (isCar) {
        setIsUploadingCar(false)
      } else {
        setIsUploadingWrap(false)
      }
    }
  }

  function openUploadModal(kind: CatalogKind): void {
    setUploadModalKind(kind)
    if (kind === 'cars') {
      setCarUploadError(null)
      return
    }
    setWrapUploadError(null)
  }

  function closeUploadModal(): void {
    if (isUploadingCar || isUploadingWrap) {
      return
    }
    setUploadModalKind(null)
  }

  function handleUploadNameChange(value: string): void {
    if (uploadModalKind === 'cars') {
      setCarUploadName(value)
      setCarUploadError(null)
      return
    }
    if (uploadModalKind === 'wraps') {
      setWrapUploadName(value)
      setWrapUploadError(null)
    }
  }

  function handleUploadFileChange(file: File | null): void {
    if (uploadModalKind === 'cars') {
      setCarUploadFile(file)
      setCarUploadError(null)
      return
    }
    if (uploadModalKind === 'wraps') {
      setWrapUploadFile(file)
      setWrapUploadError(null)
    }
  }

  function handleActiveUploadSubmit(): void {
    if (!uploadModalKind) {
      return
    }
    void handleUpload(uploadModalKind)
  }

  async function handleDelete(kind: CatalogKind, item: CatalogItem): Promise<void> {
    const confirmed = window.confirm(
      `Delete "${item.label}"? This removes it from catalog and storage.`,
    )
    if (!confirmed) {
      return
    }

    const isCar = kind === 'cars'
    if (isCar) {
      setDeletingCarId(item.id)
      setCarUploadError(null)
    } else {
      setDeletingWrapId(item.id)
      setWrapUploadError(null)
    }

    try {
      await deleteCatalogItem({ kind, id: item.id })
      await loadCatalog()

      const removedWasSelected =
        (isCar && selectedCarId === item.id) || (!isCar && selectedWrapId === item.id)
      if (removedWasSelected) {
        setGeneratedImageUrl(null)
        setIsModalOpen(false)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Delete failed'
      if (isCar) {
        setCarUploadError(`${message}. Try again.`)
      } else {
        setWrapUploadError(`${message}. Try again.`)
      }
    } finally {
      if (isCar) {
        setDeletingCarId(null)
      } else {
        setDeletingWrapId(null)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#070707] text-neutral-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,122,24,0.16),transparent_32%),radial-gradient(circle_at_90%_22%,rgba(255,255,255,0.08),transparent_20%)]" />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/55 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <div>
            <a
              href="https://luxgaragedmv.com/"
              target="_blank"
              rel="noreferrer"
              className="display-font text-3xl leading-none transition hover:text-[#ffb37a]"
            >
              Lux Garage Wrap
            </a>
            <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400">Visualizer</p>
          </div>
          <Link
            to="/"
            className="rounded-full border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-200 transition hover:border-white hover:text-white"
          >
            Back To Landing
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8"
        >
          <h1 className="display-font text-5xl leading-[0.9] text-white md:text-7xl">
            Build Your Wrap Preview
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-neutral-300">
            Upload references, search fast, and generate a studio-style wrap preview from your selected pair.
          </p>
        </motion.section>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_1.1fr_0.9fr]">
          <section className="glass-surface rounded-2xl p-4 md:p-5" aria-label="car options">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">Cars</h2>
              <button
                type="button"
                onClick={() => openUploadModal('cars')}
                disabled={isUploadingCar}
                className="rounded-full border border-white/20 bg-white/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-100 transition hover:border-white/35 hover:bg-white/14 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploadingCar ? 'Uploading...' : 'Upload Car'}
              </button>
            </div>
            {carUploadError ? <ErrorText message={carUploadError} /> : null}

            <SearchInput
              id="search-cars"
              label="Search cars"
              value={carSearchQuery}
              onChange={setCarSearchQuery}
              placeholder="Type to filter cars"
            />

            {isCatalogLoading ? (
              <HintText message="Loading catalog..." />
            ) : filteredCars.length > 0 ? (
              <SelectorGrid
                items={filteredCars}
                selectedId={selectedCarId}
                onSelect={setSelectedCarId}
                deletingId={deletingCarId}
                onDelete={(item) => void handleDelete('cars', item)}
              />
            ) : (
              <HintText
                message={
                  cars.length === 0
                    ? 'No cars uploaded yet.'
                    : `No cars match "${carSearchQuery}".`
                }
              />
            )}
          </section>

          <section className="glass-surface rounded-2xl p-4 md:p-5" aria-label="wrap options">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">Wraps</h2>
              <button
                type="button"
                onClick={() => openUploadModal('wraps')}
                disabled={isUploadingWrap}
                className="rounded-full border border-white/20 bg-white/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-100 transition hover:border-white/35 hover:bg-white/14 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploadingWrap ? 'Uploading...' : 'Upload Wrap'}
              </button>
            </div>
            {wrapUploadError ? <ErrorText message={wrapUploadError} /> : null}

            <SearchInput
              id="search-wraps"
              label="Search wraps"
              value={wrapSearchQuery}
              onChange={setWrapSearchQuery}
              placeholder="Type to filter wraps"
            />

            {isCatalogLoading ? (
              <HintText message="Loading catalog..." />
            ) : filteredWraps.length > 0 ? (
              <SelectorGrid
                items={filteredWraps}
                selectedId={selectedWrapId}
                onSelect={setSelectedWrapId}
                deletingId={deletingWrapId}
                onDelete={(item) => void handleDelete('wraps', item)}
              />
            ) : (
              <HintText
                message={
                  wraps.length === 0
                    ? 'No wraps uploaded yet.'
                    : `No wraps match "${wrapSearchQuery}".`
                }
              />
            )}
          </section>

          <section className="glass-surface rounded-2xl p-4 md:p-5" aria-label="result preview">
            <h2 className="text-lg font-semibold text-white">Preview</h2>
            <div className="mt-3 space-y-2 text-sm">
              <p className="text-neutral-300">
                Car: <span className="font-semibold text-white">{selectedCar?.label ?? 'Not selected'}</span>
              </p>
              <p className="text-neutral-300">
                Wrap:{' '}
                <span className="font-semibold text-white">{selectedWrap?.label ?? 'Not selected'}</span>
              </p>
            </div>

            {catalogErrorMessage ? <ErrorText message={catalogErrorMessage} /> : null}

            <button
              type="button"
              disabled={!canGenerate || isGenerating || isCatalogLoading}
              onClick={() => void handleGenerate()}
              className="mt-5 w-full rounded-xl bg-[#ff7a18] px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black transition hover:bg-[#ff8d3a] disabled:cursor-not-allowed disabled:bg-neutral-600 disabled:text-neutral-300"
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>

            {errorMessage ? <ErrorText message={errorMessage} /> : null}
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
                  onClick={() => setIsModalOpen(true)}
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
              </figure>
            ) : null}
          </section>
        </div>
      </main>

      <UploadCatalogModal
        isOpen={uploadModalKind !== null}
        kind={uploadModalKind}
        name={uploadModalKind === 'cars' ? carUploadName : wrapUploadName}
        onNameChange={handleUploadNameChange}
        onFileChange={handleUploadFileChange}
        onUpload={handleActiveUploadSubmit}
        isBusy={
          uploadModalKind === 'cars'
            ? isUploadingCar
            : uploadModalKind === 'wraps'
              ? isUploadingWrap
              : false
        }
        errorMessage={uploadModalKind === 'cars' ? carUploadError : wrapUploadError}
        onClose={closeUploadModal}
      />

      <ImageModal
        isOpen={isModalOpen && Boolean(generatedImageUrl)}
        imageUrl={generatedImageUrl ?? ''}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

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
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-black/80 px-4 py-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-surface w-full max-w-lg rounded-2xl p-5 md:p-6"
        role="dialog"
        aria-modal="true"
        aria-label={`Upload ${label}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="display-font text-3xl text-white">Upload {label}</h3>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-full border border-white/20 bg-white/5 text-xl leading-none text-white transition hover:border-white/35"
          >
            ×
          </button>
        </div>

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
            <p className="rounded-xl border border-red-400/45 bg-red-500/12 px-3 py-2 text-sm text-red-200">
              {errorMessage}
            </p>
          ) : null}

          <div className="mt-1 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-200 transition hover:border-white/35 hover:text-white"
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
      </div>
    </div>
  )
}

type SearchInputProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}

function SearchInput({ id, label, value, onChange, placeholder }: SearchInputProps) {
  return (
    <div className="mt-4">
      <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-[#ff7a18]"
      />
    </div>
  )
}

function HintText({ message }: { message: string }) {
  return <p className="mt-4 text-sm text-neutral-400">{message}</p>
}

function ErrorText({ message }: { message: string }) {
  return (
    <p className="mt-4 rounded-xl border border-red-400/45 bg-red-500/12 px-3 py-2 text-sm text-red-200">
      {message}
    </p>
  )
}

export default VisualizerPage
