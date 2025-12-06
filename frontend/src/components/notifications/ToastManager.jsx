import React, { useEffect, useState } from 'react'
import clsx from 'clsx'

function Toast({ id, message, type = 'info', onRemove }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(id), 4000)
    return () => clearTimeout(t)
  }, [id, onRemove])

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warn: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  }
  return (
    <div className={clsx('px-4 py-2 rounded-lg border shadow-sm', colors[type] || colors.info)}>
      {message}
    </div>
  )
}

export default function ToastManager() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    function handler(e) {
      const { message, type = 'info', duration = 4000 } = e.detail || {}
      const id = Math.random().toString(36).slice(2,9)
      setToasts(t => [{ id, message, type, duration }, ...t])
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration)
    }
    window.addEventListener('app:toast', handler)
    return () => window.removeEventListener('app:toast', handler)
  }, [])

  function remove(id) { setToasts(t => t.filter(x => x.id !== id)) }

  return (
    <div className="fixed right-4 bottom-6 z-60 flex flex-col gap-3">
      {toasts.map(t => <Toast key={t.id} {...t} onRemove={remove} />)}
    </div>
  )
}
