import type { ReactNode } from 'react'

type SearchFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  trailingAction?: ReactNode
}

function SearchField({
  id,
  label,
  value,
  onChange,
  placeholder,
  trailingAction,
}: SearchFieldProps) {
  return (
    <div className="mt-2 flex items-end gap-3">
      <div className="min-w-0 flex-1">
        <label
          htmlFor={id}
          className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-200"
        >
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
      {trailingAction ? <div className="shrink-0">{trailingAction}</div> : null}
    </div>
  )
}

export default SearchField
