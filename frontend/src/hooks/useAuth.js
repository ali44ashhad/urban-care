// src/hooks/useAuth.js
import { useContext } from 'react'
import { useAuthContext } from '../context/AuthContext'

/**
 * useAuth
 * Thin wrapper around AuthContext to keep imports consistent across the app.
 *
 * Usage:
 * const { user, login, logout, register, loading } = useAuth()
 */
export default function useAuth() {
  return useAuthContext()
}
