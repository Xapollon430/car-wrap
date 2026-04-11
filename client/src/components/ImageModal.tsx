import BaseModal from './BaseModal'

type ImageModalProps = {
  isOpen: boolean
  imageUrl: string
  onClose: () => void
}

function ImageModal({ isOpen, imageUrl, onClose }: ImageModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="Generated preview"
      contentClassName="relative max-w-6xl overflow-hidden rounded-2xl border border-white/20 bg-black/60 p-3"
    >
      <img
        src={imageUrl}
        alt="Generated result"
        className="max-h-[86vh] w-full rounded-xl object-contain"
      />
    </BaseModal>
  )
}

export default ImageModal
