import { useEffect, useRef } from 'react'

type ImageModalProps = {
  isOpen: boolean
  imageUrl: string
  caption: string | null
  onClose: () => void
}

function ImageModal({ isOpen, imageUrl, caption, onClose }: ImageModalProps) {
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
      className="modal-backdrop"
      data-testid="image-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Generated preview"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="modal-close"
          aria-label="Close preview"
          onClick={onClose}
        >
          ×
        </button>
        <img className="modal-image" src={imageUrl} alt="Generated result" />
        {caption ? <p className="modal-caption">{caption}</p> : null}
      </div>
    </div>
  )
}

export default ImageModal
