import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import notificationsService from '../services/notifications.service'
import bookingsService from '../services/bookings.service'
import { useAuthContext } from './AuthContext'

/**
 * NotificationContext
 *
 * - Loads notifications for logged-in user
 * - Exposes methods to push local notifications, refresh, and mark-read helpers
 * - Keeps unread count handy
 *
 * Notes:
 * - For real-time updates, consider combining with useSocket (subscribe to "notification" events)
 * - notificationsService.list() expected to return array with { _id, title, message, createdAt, read, payload }
 */

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const { user, initializing } = useAuthContext()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const load = useCallback(async () => {
    // Don't load if still initializing auth or no user
    if (initializing) {
      return;
    }
    
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    
    setLoading(true);
    try {
      const res = await notificationsService.list();
      // Handle both array and object responses
      let items = res.data || [];
      if (!Array.isArray(items)) {
        items = items.notifications || items.data || [];
      }
      if (!Array.isArray(items)) {
        items = [];
      }
      setNotifications(items);
      setUnreadCount(items.filter(i => !i.read).length);
    } catch (err) {
      console.warn('Failed to load notifications', err);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [user, initializing]);

  useEffect(() => {
    load()
    // NOTE: you can also subscribe to realtime socket notifications here if available
  }, [load])

  const push = useCallback((item) => {
    setNotifications(prev => [item, ...prev])
    setUnreadCount(c => c + (item.read ? 0 : 1))
  }, [])

  const markRead = useCallback(async (id) => {
    try {
      await notificationsService.markRead(id)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.warn('Failed to mark read', err)
    }
  }, [])

  const markAllRead = useCallback(async () => {
    try {
      await notificationsService.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.warn('Failed to mark all read', err)
    }
  }, [])

  // helper to create booking-related notifications locally (optional)
  const notifyBookingCreated = useCallback((booking) => {
    const n = {
      _id: `local-${Date.now()}`,
      title: 'Booking Confirmed',
      message: `Your booking for ${booking.service?.title || booking.serviceId} is confirmed.`,
      createdAt: new Date().toISOString(),
      read: false,
      payload: { bookingId: booking._id || booking.id }
    }
    push(n)
  }, [push])

  return (
    <NotificationContext.Provider value={{
      notifications,
      loadNotifications: load,
      loading,
      unreadCount,
      pushNotification: push,
      markRead,
      markAllRead,
      notifyBookingCreated
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotificationContext must be used within NotificationProvider')
  return ctx
}
