import React, { useState, useEffect, useRef } from 'react'
import NotificationsPanel from './NotificationsPanel'
import notificationsService from '../../services/notifications.service'
import { useAuthContext } from '../../context/AuthContext'

export default function NotificationBell() {
  const { user } = useAuthContext()
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    if (!user) { setCount(0); return }
    let mounted = true
    notificationsService.list().then(res => { if (mounted) setCount(res.data.filter(n => !n.read).length) }).catch(()=>{})
    return () => mounted = false
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
