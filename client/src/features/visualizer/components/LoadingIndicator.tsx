type LoadingIndicatorProps = {
  label: string
  message: string
  className?: string
}

function LoadingIndicator({
  label,
  message,
  className = '',
}: LoadingIndicatorProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={`flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-neutral-300 ${className}`.trim()}
    >
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[#ff7a18]"
      />
      <span>{message}</span>
    </div>
  )
}

export default LoadingIndicator
