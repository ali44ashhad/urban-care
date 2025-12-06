import React, { useEffect, useState } from 'react'
import Button from '../ui/Button'
import notificationsService from '../../services/notifications.service'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function NotificationsPanel({ onClose = ()=>{}, onReadAll = ()=>{} }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    notificationsService.list().then(res => { if (mounted) setItems(res.data) }).catch(()=>{}).finally(()=> mounted && setLoading(false))
    return () => mounted = false
  }, [])

  async function markRead(id) {
    try {
      await notificationsService.markRead(id)
      setItems(prev => prev.map(i => i._id === id ? { ...i, read: true } : i))
    } catch (err) { console.warn(err) }
  }

  async function markAll() {
    try {
      await Promise.all(items.filter(i => !i.read).map(i => notificationsService.markRead(i._id)))
      setItems(prev => prev.map(i => ({ ...i, read: true })))
      onReadAll()
    } catch (err) { console.warn(err) }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Notifications</div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={markAll}>Mark all read</Button>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>

      <div className="max-h-72 overflow-auto space-y-2">
        {loading ? (
              <LoadingSpinner />
        ) : items.length === 0 ? (
          <div className="text-gray-500">No notifications</div>
        ) : items.map(it => (
          <div key={it._id} className={`p-3 rounded-lg ${it.read ? 'bg-gray-50' : 'bg-white'}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium text-sm">{it.title || it.type}</div>
                <div className="text-xs text-gray-500 mt-1">{it.payload?.message || it.message}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(it.createdAt).toLocaleString()}</div>
              </div>
              {!it.read && <button onClick={() => markRead(it._id)} className="text-sm text-blue-600">Mark read</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
