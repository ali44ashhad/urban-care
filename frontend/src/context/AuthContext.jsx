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

  // login: Step 1 - send OTP to phone number
  // If otpData and code provided, it's Step 2 - verify OTP
  // If resend is true, resend OTP
  const login = useCallback(async (phone, otpData = null, code = null, resend = false) => {
    if (resend && otpData) {
      // Resend OTP
      const res = await authService.resendOTP({ phone: otpData.phone })
      return res.data
    }

    if (otpData && code) {
      // Step 2: Verify OTP
      const res = await authService.verifyLogin({
        phone: otpData.phone,
        code: code,
        userId: otpData.userId // Optional, can find by phone
      })
      const payload = res.data
      
      // Check if user needs to register
      if (payload?.requiresRegistration) {
        throw new Error('User not found. Please register first.')
      }
      
      if (payload?.token) {
        setAuthToken(payload.token)
        Cookies.set('token', payload.token, { expires: 30 })
      }
      const u = payload.user ?? payload
      if (u && u.id === undefined && u._id) u.id = u._id
      setUser(u)
      if (u) localStorage.setItem('user', JSON.stringify(u))
      return u
    }

    // Step 1: Initial login - send OTP to phone
    const res = await authService.login({ phone })
    return res.data
  }, [])

  // register: Step 1 - create user and send OTP
  // If otpData and code provided, it's Step 2 - verify OTP
  const register = useCallback(async (payload, otpData = null, code = null) => {
    if (otpData && code) {
      // Step 2: Verify OTP and complete registration
      const res = await authService.verifyRegistration({
        userId: otpData.userId,
        phone: otpData.phone,
        code: code
      })
      const data = res.data
      if (data?.token) setAuthToken(data.token)
      const u = data.user ?? data
      setUser(u)
      if (u) localStorage.setItem('user', JSON.stringify(u))
      return u
    }

    // Step 1: Initial registration - create user and send OTP
    const res = await authService.register(payload)
    return res.data
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

  // permanently delete account (client/provider only); then logout. Same email/phone can sign up as new account.
  const deleteAccount = useCallback(async () => {
    await authService.deleteAccount()
    setAuthToken(null)
    setUser(null)
    localStorage.removeItem('user')
    Cookies.remove('token')
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
      deleteAccount,
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
