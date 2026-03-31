import { useEffect, useRef } from 'react'

type ImageModalProps = {
  isOpen: boolean
  imageUrl: string
  onClose: () => void
}

function ImageModal({ isOpen, imageUrl, onClose }: ImageModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/85 px-4 py-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Generated preview"
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-6xl overflow-hidden rounded-2xl border border-white/20 bg-black/60 p-3"
      >
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close preview"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 h-9 w-9 rounded-full border border-white/25 bg-black/60 text-xl leading-none text-white transition hover:border-white"
        >
          ×
        </button>
        <img
          src={imageUrl}
          alt="Generated result"
          className="max-h-[86vh] w-full rounded-xl object-contain"
        />
      </div>
    </div>
  )
}

export default ImageModal
