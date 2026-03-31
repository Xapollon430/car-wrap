import type { CatalogKind } from '../../../api/catalog'
import type { CatalogItem } from '../../../types/catalog'

export type CatalogState = {
  cars: CatalogItem[]
  wraps: CatalogItem[]
  isLoading: boolean
  errorMessage: string | null
}

export type SelectionState = Record<CatalogKind, string | null>
export type QueryState = Record<CatalogKind, string>
export type PageState = Record<CatalogKind, number>

export type UploadFormState = {
  name: string
  file: File | null
  errorMessage: string | null
  isUploading: boolean
  deletingId: string | null
}

export type UploadState = {
  modalKind: CatalogKind | null
  cars: UploadFormState
  wraps: UploadFormState
}

const INITIAL_UPLOAD_FORM_STATE: UploadFormState = {
  name: '',
  file: null,
  errorMessage: null,
  isUploading: false,
  deletingId: null,
}

export function createCatalogState(): CatalogState {
  return {
    cars: [],
    wraps: [],
    isLoading: true,
    errorMessage: null,
  }
}

export function createSelectionState(): SelectionState {
  return {
    cars: null,
    wraps: null,
  }
}

export function createQueryState(): QueryState {
  return {
    cars: '',
    wraps: '',
  }
}

export function createPageState(): PageState {
  return {
    cars: 1,
    wraps: 1,
  }
}

export function createUploadFormState(): UploadFormState {
  return { ...INITIAL_UPLOAD_FORM_STATE }
}

export function createUploadState(): UploadState {
  return {
    modalKind: null,
    cars: createUploadFormState(),
    wraps: createUploadFormState(),
  }
}

export function updateUploadForm(
  state: UploadState,
  kind: CatalogKind,
  updater: (form: UploadFormState) => UploadFormState,
): UploadState {
  return {
    ...state,
    [kind]: updater(state[kind]),
  }
}

export function resolveSelectedId(
  items: CatalogItem[],
  currentId: string | null,
  preferredId?: string,
): string | null {
  if (preferredId) {
    return preferredId
  }

  if (!currentId) {
    return null
  }

  return items.some((item) => item.id === currentId) ? currentId : null
}

export function findSelectedItem(
  items: CatalogItem[],
  selectedId: string | null,
): CatalogItem | null {
  return items.find((item) => item.id === selectedId) ?? null
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}
