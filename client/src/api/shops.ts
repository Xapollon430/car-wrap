import type { Shop } from '../features/tenant/types'

type ShopErrorCode = 'not-found' | 'inactive' | 'unknown'

export class ShopRequestError extends Error {
  readonly code: ShopErrorCode

  constructor(
    message: string,
    code: ShopErrorCode,
  ) {
    super(message)
    this.name = 'ShopRequestError'
    this.code = code
  }
}

type ErrorResponse = {
  error?: string
}

export async function fetchShop(slug: string): Promise<Shop> {
  const response = await fetch(`/api/shops/${encodeURIComponent(slug)}`)

  if (!response.ok) {
    throw new ShopRequestError(
      await readErrorMessage(response, 'Could not load shop'),
      mapShopErrorCode(response.status),
    )
  }

  return readJson<Shop>(response)
}

function mapShopErrorCode(status: number): ShopErrorCode {
  if (status === 404) {
    return 'not-found'
  }
  if (status === 403) {
    return 'inactive'
  }
  return 'unknown'
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
