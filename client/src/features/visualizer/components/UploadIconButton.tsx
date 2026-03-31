type UploadIconButtonProps = {
  label: string
  isBusy: boolean
  onClick: () => void
}

function UploadIconButton({
  label,
  isBusy,
  onClick,
}: UploadIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isBusy}
      aria-label={label}
      title={label}
      className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/[0.04] text-lg leading-none text-neutral-100 transition hover:scale-[1.03] hover:border-white/35 hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isBusy ? (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[#ff7a18]"
        />
      ) : (
        <span aria-hidden="true" className="translate-y-[-0.5px]">
          +
        </span>
      )}
    </button>
  )
}

export default UploadIconButton
