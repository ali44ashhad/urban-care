// src/hooks/useFetch.js
import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * useFetch
 *
 * Params:
 * - fn: async function that returns a promise (e.g. () => api.get('/services'))
 * - deps: dependency array to refetch when changed
 * - opts:
 *    - immediate: boolean (default true) -> run on mount
 *    - onSuccess: callback(data)
 *    - onError: callback(error)
 *    - transform: fn(res) -> data (useful to pluck res.data)
 *    - pollingInterval: number in ms (optional)
 *
 * Returns: { data, loading, error, refresh, cancel }
 */
export default function useFetch(fn, deps = [], opts = {}) {
  const {
    immediate = true,
    onSuccess,
    onError,
    transform = (res) => (res && res.data !== undefined ? res.data : res),
    pollingInterval = null
  } = opts

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(Boolean(immediate))
  const [error, setError] = useState(null)

  const mountedRef = useRef(true)
  const abortRef = useRef({ cancelled: false })

  const fetchOnce = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    abortRef.current.cancelled = false
    try {
      const res = await fn(...args)
      if (abortRef.current.cancelled || !mountedRef.current) return
      const out = transform(res)
      setData(out)
      onSuccess?.(out)
      return out
    } catch (err) {
      if (abortRef.current.cancelled || !mountedRef.current) return
      setError(err)
      onError?.(err)
      throw err
    } finally {
      if (!abortRef.current.cancelled && mountedRef.current) setLoading(false)
    }
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
    deps.concat([fn, transform, onSuccess, onError])
  )

  // initial effect + optional polling
  useEffect(() => {
    mountedRef.current = true
    if (immediate) fetchOnce()

    let intervalId = null
    if (pollingInterval && typeof pollingInterval === 'number') {
      intervalId = setInterval(() => {
        fetchOnce().catch(() => {})
      }, pollingInterval)
    }

    return () => {
      mountedRef.current = false
      abortRef.current.cancelled = true
      if (intervalId) clearInterval(intervalId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps.concat([immediate, pollingInterval]))

  const refresh = useCallback(() => fetchOnce(), [fetchOnce])
  const cancel = useCallback(() => { abortRef.current.cancelled = true }, [])

  return { data, loading, error, refresh, cancel }
}
