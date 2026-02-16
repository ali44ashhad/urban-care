import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import categoriesService from '../services/categories.service'

/**
 * Single source of truth for categories. Fetches once, caches 5 min
 * so Hero, ServiceCategories, CategoryServices don't each call the API.
 */
const CategoriesContext = createContext(null)

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fetchedAt = useRef(0)

  const fetchCategories = useCallback(async (force = false) => {
    const now = Date.now()
    if (!force && categories.length > 0 && now - fetchedAt.current < CACHE_TTL_MS) {
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await categoriesService.list({ isActive: 'true' })
      const items = res.data?.items ?? res.data ?? []
      setCategories(Array.isArray(items) ? items : [])
      fetchedAt.current = Date.now()
    } catch (err) {
      console.error('CategoriesContext: failed to load categories', err)
      setError(err)
      if (categories.length === 0) setCategories([])
    } finally {
      setLoading(false)
    }
  }, [categories.length])

  useEffect(() => {
    if (categories.length === 0 && !loading) {
      fetchCategories()
    }
  }, [])

  const value = {
    categories,
    loading,
    error,
    refetch: () => fetchCategories(true)
  }

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories() {
  const ctx = useContext(CategoriesContext)
  if (!ctx) throw new Error('useCategories must be used within CategoriesProvider')
  return ctx
}

/** Use when component may render outside provider (e.g. admin); returns empty array if no provider */
export function useCategoriesOptional() {
  const ctx = useContext(CategoriesContext)
  if (!ctx) return { categories: [], loading: false, error: null, refetch: () => {} }
  return ctx
}
