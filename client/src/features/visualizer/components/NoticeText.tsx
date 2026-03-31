type NoticeTone = 'muted' | 'error'

type NoticeTextProps = {
  message: string
  tone?: NoticeTone
  className?: string
}

function NoticeText({
  message,
  tone = 'muted',
  className = '',
}: NoticeTextProps) {
  const baseClassName =
    tone === 'error'
      ? 'rounded-xl border border-red-400/45 bg-red-500/12 px-3 py-2 text-sm text-red-200'
      : 'text-sm text-neutral-400'

  return <p className={`${baseClassName} ${className}`.trim()}>{message}</p>
}

export default NoticeText
