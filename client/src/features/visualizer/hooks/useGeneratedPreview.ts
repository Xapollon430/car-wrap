import { useEffect, useState } from 'react'
import { generateFromServer } from '../../../api/generateFromServer'
import type { CatalogItem } from '../../../types/catalog'
import { getErrorMessage } from '../utils/catalogState'

type PreviewState = {
  imageUrl: string | null
  isGenerating: boolean
  errorMessage: string | null
  isImageModalOpen: boolean
}

type UseGeneratedPreviewInput = {
  selectedCar: CatalogItem | null
  selectedWrap: CatalogItem | null
  isCatalogLoading: boolean
  catalogErrorMessage: string | null
}

function createPreviewState(): PreviewState {
  return {
    imageUrl: null,
    isGenerating: false,
    errorMessage: null,
    isImageModalOpen: false,
  }
}

export function useGeneratedPreview({
  selectedCar,
  selectedWrap,
  isCatalogLoading,
  catalogErrorMessage,
}: UseGeneratedPreviewInput) {
  const [preview, setPreview] = useState(createPreviewState)

  useEffect(() => {
    if (selectedCar && selectedWrap) {
      return
    }

    setPreview((current) => {
      if (!current.imageUrl && !current.isImageModalOpen) {
        return current
      }

      return {
        ...current,
        imageUrl: null,
        isImageModalOpen: false,
      }
    })
  }, [selectedCar, selectedWrap])

  async function handleGenerate(): Promise<void> {
    if (!selectedCar || !selectedWrap) {
      return
    }

    setPreview((current) => ({
      ...current,
      isGenerating: true,
      errorMessage: null,
      isImageModalOpen: false,
    }))

    try {
      const result = await generateFromServer({
        carName: selectedCar.label,
        wrapName: selectedWrap.label,
      })

      setPreview((current) => ({
        ...current,
        imageUrl: result.imageUrl,
      }))
    } catch (error) {
      setPreview((current) => ({
        ...current,
        errorMessage: `${getErrorMessage(error, 'Could not generate image')}. Try again.`,
      }))
    } finally {
      setPreview((current) => ({
        ...current,
        isGenerating: false,
      }))
    }
  }

  return {
    previewPanel: {
      selectedCarLabel: selectedCar?.label ?? null,
      selectedWrapLabel: selectedWrap?.label ?? null,
      catalogErrorMessage,
      canGenerate: Boolean(selectedCar && selectedWrap),
      isCatalogLoading,
      isGenerating: preview.isGenerating,
      errorMessage: preview.errorMessage,
      generatedImageUrl: preview.imageUrl,
      onGenerate: () => void handleGenerate(),
      onOpenPreview: () => {
        if (!preview.imageUrl) {
          return
        }

        setPreview((current) => ({
          ...current,
          isImageModalOpen: true,
        }))
      },
    },
    imageModal: {
      isOpen: preview.isImageModalOpen && Boolean(preview.imageUrl),
      imageUrl: preview.imageUrl ?? '',
      onClose: () =>
        setPreview((current) => ({
          ...current,
          isImageModalOpen: false,
        })),
    },
  }
}
