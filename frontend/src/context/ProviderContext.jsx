import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuthContext } from './AuthContext'
import bookingsService from '../services/bookings.service'

const ProviderContext = createContext()

export function ProviderProvider({ children }) {
  const { user } = useAuthContext()
  const [provider, setProvider] = useState(null)
  const [assignedBookings, setAssignedBookings] = useState([])
  const [loadingProvider, setLoadingProvider] = useState(true)

  // Load provider profile from user data
  useEffect(() => {
    if (user && user.role === 'provider') {
      setProvider({
        _id: user._id || user.id,
        name: user.name,
        email: user.email,
        companyName: user.companyName,
        serviceNames: user.serviceNames || [],
        profile: user.profile || {}
      })
      setLoadingProvider(false)
    } else {
      setProvider(null)
      setLoadingProvider(false)
    }
  }, [user])

  // Load bookings assigned to this provider
  const loadAssignedBookings = useCallback(async () => {
    if (!user || user.role !== 'provider') {
      setAssignedBookings([])
      return
    }

    try {
      const response = await bookingsService.list({ providerId: user._id || user.id })
      let bookingData = response.data || []
      
      if (!Array.isArray(bookingData)) {
        bookingData = bookingData.items || bookingData.bookings || bookingData.data || []
      }
      
      if (!Array.isArray(bookingData)) {
        bookingData = []
      }
      
      setAssignedBookings(bookingData)
    } catch (error) {
      console.error('Failed to load assigned bookings:', error)
      setAssignedBookings([])
    }
  }, [user])

  const value = {
    provider,
    assignedBookings,
    loadAssignedBookings,
    loadingProvider
  }

  return (
    <ProviderContext.Provider value={value}>
      {children}
    </ProviderContext.Provider>
  )
}

export function useProviderContext() {
  const context = useContext(ProviderContext)
  if (!context) {
    throw new Error('useProviderContext must be used within a ProviderProvider')
  }
  return context
}
