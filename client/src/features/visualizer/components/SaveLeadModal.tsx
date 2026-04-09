import { useState } from 'react'
type SaveLeadModalProps = {
  isOpen: boolean
  generatedImageUrl: string | null
  onClose: () => void
  onSuccess: () => void
}
function SaveLeadModal({
  isOpen,
  generatedImageUrl,
  onClose,
  onSuccess,
}: SaveLeadModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  if (!isOpen) {
    return null
  }

  async function handleSubmit(): Promise<void> {
    if (!generatedImageUrl) {
      setErrorMessage('No generated image found')
      return
    }

    const nextName = name.trim()
    const nextEmail = email.trim()
    const nextPhone = phone.trim()
    if (!nextName || !nextEmail || !nextPhone) {
      setErrorMessage('Name, email, and phone are required')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      setErrorMessage('Please enter a valid email address')
      return
    }

    const imageIdentifier = deriveImageIdentifier(generatedImageUrl)
    if (!imageIdentifier) {
      setErrorMessage('Could not identify the generated image. Please regenerate and try again.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/leads/save-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: nextName,
          email: nextEmail,
          phone: nextPhone,
          imageIdentifier,
          imageUrl: new URL(generatedImageUrl, window.location.origin).toString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Could not submit request')
      }

      setName('')
      setEmail('')
      setPhone('')
      onSuccess()
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message
          ? `${error.message}. Try again.`
          : 'Could not submit request. Try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-black/80 px-4 py-5 backdrop-blur-sm"
      onClick={() => {
        if (!isSubmitting) {
          setErrorMessage(null)
          onClose()
        }
      }}
    >
      <form
        className="glass-surface w-full max-w-lg rounded-2xl p-5 md:p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Save this image"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault()
          void handleSubmit()
        }}
      >
        <h3 className="display-font text-3xl text-white">Save This Image</h3>

        <div className="mt-5 grid gap-3">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" className="w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-[#ff7a18]" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" autoComplete="email" className="w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-[#ff7a18]" />
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Your phone" autoComplete="tel" className="w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-[#ff7a18]" />

          {errorMessage ? <p className="rounded-xl border border-red-400/45 bg-red-500/12 px-3 py-2 text-sm text-red-200">{errorMessage}</p> : null}

          <div className="mt-1 flex items-center justify-end gap-2">
            <button type="button" onClick={() => {
              setErrorMessage(null)
              onClose()
            }} disabled={isSubmitting} className="rounded-full border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-200 transition hover:border-white/35 hover:text-white disabled:cursor-not-allowed disabled:opacity-60">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="rounded-full bg-[#ff7a18] px-5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-black transition hover:bg-[#ff8d3a] disabled:cursor-not-allowed disabled:bg-neutral-600 disabled:text-neutral-300">{isSubmitting ? 'Sending...' : 'Send'}</button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default SaveLeadModal

function deriveImageIdentifier(imageUrl: string): string {
  try {
    const parsed = new URL(imageUrl, window.location.origin)
    const parts = parsed.pathname.split('/').filter(Boolean)
    return decodeURIComponent(parts[parts.length - 1] ?? '')
  } catch {
    return ''
  }
}
