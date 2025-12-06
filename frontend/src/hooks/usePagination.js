// src/hooks/usePagination.js
import { useCallback, useMemo, useState } from 'react'

/**
 * usePagination
 *
 * Basic pagination state + helpers.
 *
 * Usage:
 * const { page, limit, setPage, next, prev, offset } = usePagination({ initialPage:1, initialLimit:10 })
 */
export default function usePagination({ initialPage = 1, initialLimit = 10, total = null } = {}) {
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)

  const offset = useMemo(() => (Math.max(1, page) - 1) * limit, [page, limit])

  const next = useCallback(() => setPage((p) => p + 1), [])
  const prev = useCallback(() => setPage((p) => Math.max(1, p - 1)), [])
  const goTo = useCallback((n) => setPage(() => Math.max(1, Number(n) || 1)), [])
  const setPageAndReset = useCallback((n) => { setPage(1); setLimit(n) }, [])

  const pageCount = useMemo(() => {
    if (total == null) return null
    return Math.ceil(total / limit)
  }, [total, limit])

  return {
    page,
    limit,
    offset,
    setPage,
    setLimit,
    setPageAndReset,
    next,
    prev,
    goTo,
    pageCount
  }
}
