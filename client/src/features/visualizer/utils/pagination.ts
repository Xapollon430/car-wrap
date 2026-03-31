import type { CatalogItem } from '../../../types/catalog'

export const PAGE_SIZE = 6

export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase()
}

export function filterCatalogItems(
  items: CatalogItem[],
  query: string,
): CatalogItem[] {
  const normalizedQuery = normalizeQuery(query)

  if (!normalizedQuery) {
    return items
  }

  return items.filter((item) =>
    item.label.toLowerCase().includes(normalizedQuery),
  )
}

export function paginateItems<T>(items: T[], page: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const currentPage = Math.min(Math.max(page, 1), totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE

  return {
    currentPage,
    totalPages,
    visibleItems: items.slice(startIndex, startIndex + PAGE_SIZE),
  }
}
