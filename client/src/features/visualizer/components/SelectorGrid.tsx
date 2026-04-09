import type { CatalogItem } from "../../../types/catalog";

type SelectorGridProps = {
  items: CatalogItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  deletingId: string | null;
  onDelete: (item: CatalogItem) => void;
  selectionLabelPrefix: string;
};

function SelectorGrid({
  items,
  selectedId,
  onSelect,
  deletingId,
  onDelete,
  selectionLabelPrefix,
}: SelectorGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-2.5">
      {items.map((item) => {
        const isSelected = selectedId === item.id;
        const isDeleting = deletingId === item.id;

        return (
          <li key={item.id}>
            <div
              className={`relative rounded-xl border p-1.5 transition ${
                isSelected
                  ? "border-[#ff7a18] bg-[#ff7a18]/10"
                  : "border-white/15 bg-black/35 hover:border-white/30"
              }`}
            >
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onDelete(item);
                }}
                disabled={isDeleting}
                aria-label={`Delete ${item.label}`}
                title={`Delete ${item.label}`}
                className="absolute right-3 top-3 z-10 grid h-7 w-7 place-items-center rounded-full border border-red-300/50 bg-black/65 text-xs font-bold text-red-200 transition hover:border-red-200/80 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "…" : "✕"}
              </button>

              <button
                type="button"
                onClick={() => onSelect(item.id)}
                aria-pressed={isSelected}
                aria-label={`${selectionLabelPrefix} ${item.label}`}
                className="w-full cursor-pointer text-left"
              >
                <img
                  src={item.imagePath}
                  alt={item.label}
                  loading="lazy"
                  className="aspect-[16/10] w-full rounded-lg object-cover"
                />
                <span className="mt-1.5 block min-h-10 line-clamp-2 text-sm leading-5 text-neutral-100">
                  {item.label}
                </span>
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default SelectorGrid;
