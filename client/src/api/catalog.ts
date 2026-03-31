import type { CatalogItem } from '../types/catalog'

export type CatalogKind = 'cars' | 'wraps'

type CatalogResponse = {
  cars: CatalogItem[]
  wraps: CatalogItem[]
}

type UploadResponse = {
  item?: CatalogItem
}

type UploadUrlResponse = {
  uploadUrl?: string
  fileName?: string
  mimeType?: string
}

type ErrorResponse = {
  error?: string
}

export async function fetchCatalog(): Promise<CatalogResponse> {
  const response = await fetch('/api/catalog')

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Could not load catalog'))
  }

  return readJson<CatalogResponse>(response)
}

export async function uploadCatalogItem(input: {
  kind: CatalogKind
  name: string
  file: File
}): Promise<CatalogItem> {
  const createResponse = await fetch(`/api/catalog/${input.kind}/upload-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: input.name,
      fileName: input.file.name,
      contentType: input.file.type,
    }),
  })

  if (!createResponse.ok) {
    throw new Error(
      await readErrorMessage(createResponse, 'Could not create upload URL'),
    )
  }

  const uploadTarget = await readJson<UploadUrlResponse>(createResponse)
  if (!uploadTarget.uploadUrl || !uploadTarget.fileName || !uploadTarget.mimeType) {
    throw new Error('Upload target response is incomplete')
  }

  const uploadResponse = await fetch(uploadTarget.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': uploadTarget.mimeType,
    },
    body: input.file,
  })
  if (!uploadResponse.ok) {
    throw new Error('Direct upload to storage failed')
  }

  const commitResponse = await fetch(`/api/catalog/${input.kind}/commit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: input.name,
      fileName: uploadTarget.fileName,
      mimeType: uploadTarget.mimeType,
    }),
  })

  if (!commitResponse.ok) {
    throw new Error(await readErrorMessage(commitResponse, 'Could not save catalog'))
  }

  const payload = await readJson<UploadResponse>(commitResponse)
  if (!payload.item) {
    throw new Error('Upload succeeded but no catalog item was returned')
  }

  return payload.item
}

export async function deleteCatalogItem(input: {
  kind: CatalogKind
  id: string
}): Promise<void> {
  const response = await fetch(
    `/api/catalog/${input.kind}/${encodeURIComponent(input.id)}`,
    {
      method: 'DELETE',
    },
  )

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Could not delete catalog item'))
  }
}

async function readErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const errorBody = await readJson<ErrorResponse>(response)
    if (errorBody.error) {
      return errorBody.error
    }
  } catch {
    // Ignore parse failures and use fallback.
  }

  return fallback
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T
}
