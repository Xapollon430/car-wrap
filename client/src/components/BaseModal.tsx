import * as Dialog from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'

type BaseModalProps = {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  ariaLabel: string
  contentClassName?: string
  closeButtonClassName?: string
  closeDisabled?: boolean
}

function BaseModal({
  isOpen,
  onClose,
  children,
  ariaLabel,
  contentClassName = '',
  closeButtonClassName = '',
  closeDisabled = false,
}: BaseModalProps) {
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !closeDisabled) {
          onClose()
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <Dialog.Content
            aria-label={ariaLabel}
            onEscapeKeyDown={(event) => {
              if (closeDisabled) {
                event.preventDefault()
              }
            }}
            onPointerDownOutside={(event) => {
              if (closeDisabled) {
                event.preventDefault()
              }
            }}
            className={`relative w-full max-h-[calc(100vh-2rem)] overflow-y-auto focus:outline-none ${contentClassName}`}
          >
            {children}
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close modal"
                disabled={closeDisabled}
                className={`absolute right-4 top-4 h-9 w-9 rounded-full border border-white/20 bg-black/45 text-xl leading-none text-white transition hover:border-white/35 disabled:cursor-not-allowed disabled:opacity-60 ${closeButtonClassName}`}
              >
                ×
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default BaseModal
