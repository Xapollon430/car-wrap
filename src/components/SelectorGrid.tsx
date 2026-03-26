import type { CatalogItem } from '../types/catalog'

type SelectorGridProps = {
  items: CatalogItem[]
  selectedId: string | null
  onSelect: (id: string) => void
}

function SelectorGrid({ items, selectedId, onSelect }: SelectorGridProps) {
  return (
    <ul className="selector-grid">
      {items.map((item) => {
        const isSelected = selectedId === item.id

        return (
          <li key={item.id}>
            <button
              type="button"
              className={`selector-card ${isSelected ? 'is-selected' : ''}`}
              onClick={() => onSelect(item.id)}
              aria-pressed={isSelected}
            >
              <img src={item.imagePath} alt={item.label} loading="lazy" />
              <span>{item.label}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export default SelectorGrid
