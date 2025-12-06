import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import Cookies from 'js-cookie'
import authService from '../services/auth.service'
import api, { setAuthToken } from '../services/apiClient'

/**
 * AuthContext
 * - Provides: user, loading, login, register, logout, refresh, setUser
 * - Persists token in cookies (30 days) & user in localStorage
 * - Attaches token to api client automatically
 *
 * NOTE: For full production, consider:
 * - Refresh token flow with queueing of requests on token expiry
 * - More robust error handling and telemetry
 */

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(true)

  // initialize from cookies and localStorage
  useEffect(() => {
    try {
      const token = Cookies.get('token')
      const userJson = localStorage.getItem('user')
      if (token && userJson) {
        // attach token and restore user
        setAuthToken(token)
        setUser(JSON.parse(userJson))
      }
    } catch (err) {
      console.warn('Auth init failed', err)
      // Clear corrupted data
      Cookies.remove('token')
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
      setInitializing(false)
    }
  }, [])

  // login: calls backend and stores token + user
  const login = useCallback(async (email, password) => {
    const res = await authService.login({ email, password })
    const payload = res.data
    if (payload?.token) {
      setAuthToken(payload.token)
    }
    // backend may return user under payload.user or payload
    const u = payload.user ?? payload.userData ?? payload
    if (u && u.id === undefined && u._id) u.id = u._id
    setUser(u)
    if (u) localStorage.setItem('user', JSON.stringify(u))
    return u
  }, [])

  // register
  const register = useCallback(async (payload) => {
    const res = await authService.register(payload)
    const data = res.data
    if (data?.token) setAuthToken(data.token)
    const u = data.user ?? data
    setUser(u)
    if (u) localStorage.setItem('user', JSON.stringify(u))
    return u
  }, [])

  // logout
  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch (err) {
      // ignore errors on logout
    } finally {
      setAuthToken(null)
      setUser(null)
      localStorage.removeItem('user')
      Cookies.remove('token')
      // optional: clear other app state on logout (cart, notifications)
    }
  }, [])

  // refresh token (optional — backend must support)
  const refresh = useCallback(async (refreshToken) => {
    const res = await authService.refresh(refreshToken)
    if (res.data?.token) setAuthToken(res.data.token)
    if (res.data?.user) {
      setUser(res.data.user)
      localStorage.setItem('user', JSON.stringify(res.data.user))
    }
    return res.data
  }, [])

  // helper to update user locally & persist
  const updateUser = useCallback((patch) => {
    setUser(prev => {
      const next = { ...(prev || {}), ...patch }
      localStorage.setItem('user', JSON.stringify(next))
      return next
    })
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      setUser: updateUser,
      loading,
      initializing,
      login,
      register,
      logout,
      refresh
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
