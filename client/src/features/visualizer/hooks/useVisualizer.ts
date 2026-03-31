import { useCatalogLibrary } from './useCatalogLibrary'
import { useGeneratedPreview } from './useGeneratedPreview'

export function useVisualizer() {
  const catalog = useCatalogLibrary()
  const preview = useGeneratedPreview({
    selectedCar: catalog.selectedCar,
    selectedWrap: catalog.selectedWrap,
    isCatalogLoading: catalog.isCatalogLoading,
    catalogErrorMessage: catalog.catalogErrorMessage,
  })

  return {
    carPanel: catalog.carPanel,
    wrapPanel: catalog.wrapPanel,
    uploadModal: catalog.uploadModal,
    previewPanel: preview.previewPanel,
    imageModal: preview.imageModal,
  }
}
