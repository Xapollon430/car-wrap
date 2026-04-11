import { useParams } from 'react-router-dom'
import { DEFAULT_TENANT_SLUG } from './types'

export function useTenantSlug(): string {
  const { slug } = useParams<{ slug: string }>()
  const normalized = slug?.trim().toLowerCase() ?? ''

  if (!normalized || !/^[a-z0-9-]+$/.test(normalized)) {
    return DEFAULT_TENANT_SLUG
  }

  return normalized
}
