import React, { useState, useEffect, useRef } from 'react'
import NotificationsPanel from './NotificationsPanel'
import notificationsService from '../../services/notifications.service'
import { useAuthContext } from '../../context/AuthContext'

export default function NotificationBell() {
  const { user } = useAuthContext()
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const previousCountRef = useRef(0)

  // Function to play notification sound
  const playNotificationSound = () => {
    try {
      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Configure sound (pleasant notification tone)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
      oscillator.type = 'sine'

      // Volume envelope
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      // Play sound
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (err) {
      console.warn('Could not play notification sound:', err)
    }
  }

  useEffect(() => {
    if (!user) { setCount(0); return }
    
    let mounted = true
    
    // Load notifications immediately
    const loadNotifications = () => {
      notificationsService.list().then(res => { 
        if (mounted) {
          const unreadCount = res.data.filter(n => n.status === 'queued').length
          
          // Play sound if there are new notifications
          if (unreadCount > previousCountRef.current && previousCountRef.current !== 0) {
            playNotificationSound()
          }
          
          previousCountRef.current = unreadCount
          setCount(unreadCount)
        }
      }).catch(()=>{})
    }
    
    loadNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [user])

  useEffect(() => {
    function onDocClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)} className="relative p-2 rounded-md hover:bg-gray-100">
        <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        {count > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5">{count}</span>}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 z-50">
          <NotificationsPanel onClose={() => setOpen(false)} onReadAll={() => setCount(0)} />
        </div>
      )}
    </div>
  )
}
