import { useEffect, useState } from 'react'
import { fetchShop, ShopRequestError } from '../../api/shops'
import type { Shop } from './types'

type ShopState =
  | { requestedSlug: string; status: 'loading'; shop: null; errorMessage: null }
  | { requestedSlug: string; status: 'ready'; shop: Shop; errorMessage: null }
  | {
      requestedSlug: string
      status: 'not-found'
      shop: null
      errorMessage: string
    }
  | {
      requestedSlug: string
      status: 'inactive'
      shop: null
      errorMessage: string
    }
  | { requestedSlug: string; status: 'error'; shop: null; errorMessage: string }

export function useShop(slug: string): ShopState {
  const [state, setState] = useState<ShopState>(() => ({
    requestedSlug: slug,
    status: 'loading',
    shop: null,
    errorMessage: null,
  }))

  useEffect(() => {
    let isCancelled = false

    void fetchShop(slug)
      .then((shop) => {
        if (isCancelled) {
          return
        }

        setState({
          requestedSlug: slug,
          status: 'ready',
          shop,
          errorMessage: null,
        })
      })
      .catch((error: unknown) => {
        if (isCancelled) {
          return
        }

        if (error instanceof ShopRequestError) {
          if (error.code === 'unknown') {
            setState({
              requestedSlug: slug,
              status: 'error',
              shop: null,
              errorMessage: error.message,
            })
            return
          }

          setState({
            requestedSlug: slug,
            status: error.code,
            shop: null,
            errorMessage: error.message,
          })
          return
        }

        setState({
          requestedSlug: slug,
          status: 'error',
          shop: null,
          errorMessage: 'Could not load shop',
        })
      })

    return () => {
      isCancelled = true
    }
  }, [slug])

  if (state.requestedSlug !== slug) {
    return {
      requestedSlug: slug,
      status: 'loading',
      shop: null,
      errorMessage: null,
    }
  }

  return state
}
