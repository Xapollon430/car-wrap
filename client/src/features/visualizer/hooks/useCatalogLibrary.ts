import { useCallback, useEffect, useState } from 'react'
import {
  deleteCatalogItem,
  fetchCatalog,
  uploadCatalogItem,
  type CatalogKind,
} from '../../../api/catalog'
import type { CatalogItem } from '../../../types/catalog'
import {
  createCatalogState,
  createPageState,
  createQueryState,
  createSelectionState,
  createUploadFormState,
  createUploadState,
  findSelectedItem,
  getErrorMessage,
  resolveSelectedId,
  type UploadFormState,
  updateUploadForm,
} from '../utils/catalogState'
import { filterCatalogItems, paginateItems } from '../utils/pagination'

type PreferredSelection = {
  kind: CatalogKind
  id: string
}

export function useCatalogLibrary() {
  const [catalog, setCatalog] = useState(createCatalogState)
  const [selectedIds, setSelectedIds] = useState(createSelectionState)
  const [queries, setQueries] = useState(createQueryState)
  const [pages, setPages] = useState(createPageState)
  const [uploadState, setUploadState] = useState(createUploadState)

  const loadCatalog = useCallback(
    async (preferredSelection?: PreferredSelection): Promise<void> => {
      setCatalog((current) => ({
        ...current,
        isLoading: true,
        errorMessage: null,
      }))

      try {
        const result = await fetchCatalog()
        const preferredCarId =
          preferredSelection?.kind === 'cars' ? preferredSelection.id : undefined
        const preferredWrapId =
          preferredSelection?.kind === 'wraps'
            ? preferredSelection.id
            : undefined

        setCatalog({
          cars: result.cars,
          wraps: result.wraps,
          isLoading: false,
          errorMessage: null,
        })
        setSelectedIds((current) => ({
          cars: resolveSelectedId(result.cars, current.cars, preferredCarId),
          wraps: resolveSelectedId(result.wraps, current.wraps, preferredWrapId),
        }))
      } catch (error) {
        setCatalog((current) => ({
          ...current,
          isLoading: false,
          errorMessage: `${getErrorMessage(error, 'Could not load catalog')}. Try again.`,
        }))
      }
    },
    [],
  )

  useEffect(() => {
    void loadCatalog()
  }, [loadCatalog])

  const selectedCar = findSelectedItem(catalog.cars, selectedIds.cars)
  const selectedWrap = findSelectedItem(catalog.wraps, selectedIds.wraps)
  const filteredCars = filterCatalogItems(catalog.cars, queries.cars)
  const filteredWraps = filterCatalogItems(catalog.wraps, queries.wraps)
  const carPagination = paginateItems(filteredCars, pages.cars)
  const wrapPagination = paginateItems(filteredWraps, pages.wraps)
  const activeUploadForm = uploadState.modalKind
    ? uploadState[uploadState.modalKind]
    : null

  function setSelectedId(kind: CatalogKind, id: string): void {
    setSelectedIds((current) => ({
      ...current,
      [kind]: id,
    }))
  }

  function setPage(kind: CatalogKind, page: number): void {
    setPages((current) => ({
      ...current,
      [kind]: Math.max(1, page),
    }))
  }

  function handleSearchChange(kind: CatalogKind, value: string): void {
    setQueries((current) => ({
      ...current,
      [kind]: value,
    }))
    setPages((current) => ({
      ...current,
      [kind]: 1,
    }))
  }

  function updateActiveUploadForm(
    updater: (form: UploadFormState) => UploadFormState,
  ): void {
    setUploadState((current) => {
      if (!current.modalKind) {
        return current
      }

      return updateUploadForm(current, current.modalKind, updater)
    })
  }

  function openUploadModal(kind: CatalogKind): void {
    setUploadState((current) => ({
      ...updateUploadForm(current, kind, (form) => ({
        ...form,
        errorMessage: null,
      })),
      modalKind: kind,
    }))
  }

  function closeUploadModal(): void {
    setUploadState((current) => {
      if (current.cars.isUploading || current.wraps.isUploading) {
        return current
      }

      return {
        ...current,
        modalKind: null,
      }
    })
  }

  function handleUploadNameChange(value: string): void {
    updateActiveUploadForm((form) => ({
      ...form,
      name: value,
      errorMessage: null,
    }))
  }

  function handleUploadFileChange(file: File | null): void {
    updateActiveUploadForm((form) => ({
      ...form,
      file,
      errorMessage: null,
    }))
  }

  async function handleUpload(kind: CatalogKind): Promise<void> {
    const name = uploadState[kind].name.trim()
    const file = uploadState[kind].file

    if (!name || !file) {
      setUploadState((current) =>
        updateUploadForm(current, kind, (form) => ({
          ...form,
          errorMessage: 'Name and image file are required',
        })),
      )
      return
    }

    setUploadState((current) =>
      updateUploadForm(current, kind, (form) => ({
        ...form,
        isUploading: true,
        errorMessage: null,
      })),
    )

    try {
      const uploadedItem = await uploadCatalogItem({ kind, name, file })
      await loadCatalog({ kind, id: uploadedItem.id })

      setUploadState((current) => ({
        ...updateUploadForm(current, kind, () => createUploadFormState()),
        modalKind: null,
      }))
    } catch (error) {
      setUploadState((current) =>
        updateUploadForm(current, kind, (form) => ({
          ...form,
          errorMessage: `${getErrorMessage(error, 'Upload failed')}. Try again.`,
        })),
      )
    } finally {
      setUploadState((current) =>
        updateUploadForm(current, kind, (form) => ({
          ...form,
          isUploading: false,
        })),
      )
    }
  }

  function handleActiveUploadSubmit(): void {
    if (!uploadState.modalKind) {
      return
    }

    void handleUpload(uploadState.modalKind)
  }

  async function handleDelete(
    kind: CatalogKind,
    item: CatalogItem,
  ): Promise<void> {
    const confirmed = window.confirm(
      `Delete "${item.label}"? This removes it from catalog and storage.`,
    )

    if (!confirmed) {
      return
    }

    setUploadState((current) =>
      updateUploadForm(current, kind, (form) => ({
        ...form,
        deletingId: item.id,
        errorMessage: null,
      })),
    )

    try {
      await deleteCatalogItem({ kind, id: item.id })
      await loadCatalog()
    } catch (error) {
      setUploadState((current) =>
        updateUploadForm(current, kind, (form) => ({
          ...form,
          errorMessage: `${getErrorMessage(error, 'Delete failed')}. Try again.`,
        })),
      )
    } finally {
      setUploadState((current) =>
        updateUploadForm(current, kind, (form) => ({
          ...form,
          deletingId: null,
        })),
      )
    }
  }

  function createSelectorPanel(kind: CatalogKind) {
    const allItems = catalog[kind]
    const pagination = kind === 'cars' ? carPagination : wrapPagination

    return {
      kind,
      query: queries[kind],
      onQueryChange: (value: string) => handleSearchChange(kind, value),
      onUploadClick: () => openUploadModal(kind),
      isUploading: uploadState[kind].isUploading,
      errorMessage: uploadState[kind].errorMessage,
      isLoading: catalog.isLoading,
      items: pagination.visibleItems,
      allItemCount: allItems.length,
      selectedId: selectedIds[kind],
      onSelect: (id: string) => setSelectedId(kind, id),
      deletingId: uploadState[kind].deletingId,
      onDelete: (item: CatalogItem) => void handleDelete(kind, item),
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      onPreviousPage: () => setPage(kind, pagination.currentPage - 1),
      onNextPage: () => setPage(kind, pagination.currentPage + 1),
    }
  }

  return {
    carPanel: createSelectorPanel('cars'),
    wrapPanel: createSelectorPanel('wraps'),
    uploadModal: {
      isOpen: uploadState.modalKind !== null,
      kind: uploadState.modalKind,
      name: activeUploadForm?.name ?? '',
      onNameChange: handleUploadNameChange,
      onFileChange: handleUploadFileChange,
      onUpload: handleActiveUploadSubmit,
      isBusy: activeUploadForm?.isUploading ?? false,
      errorMessage: activeUploadForm?.errorMessage ?? null,
      onClose: closeUploadModal,
    },
    selectedCar,
    selectedWrap,
    isCatalogLoading: catalog.isLoading,
    catalogErrorMessage: catalog.errorMessage,
  }
}
