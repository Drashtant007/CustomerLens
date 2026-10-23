import { useEffect, useState } from "react"

import {
  loadCustomerLensData,
  type CustomerLensData,
} from "@/data/customerlens"

type CustomerLensState = {
  data: CustomerLensData | null
  loading: boolean
  error: string | null
}

export function useCustomerLensData(): CustomerLensState {
  const [state, setState] = useState<CustomerLensState>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let mounted = true

    loadCustomerLensData()
      .then((data) => {
        if (!mounted) {
          return
        }

        setState({
          data,
          loading: false,
          error: null,
        })
      })
      .catch((error: unknown) => {
        if (!mounted) {
          return
        }

        setState({
          data: null,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to load CustomerLens data.",
        })
      })

    return () => {
      mounted = false
    }
  }, [])

  return state
}