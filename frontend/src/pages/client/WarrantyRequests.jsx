import React, { useEffect, useState } from 'react'
import warrantyService from '../../services/warranty.service'
import { useAuthContext } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function WarrantyRequests() {
  const { user } = useAuthContext()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const res = await warrantyService.list({ userId: user?.id })
        if (mounted) setItems(res.data || [])
      } catch (err) { console.warn(err) } finally { if (mounted) setLoading(false) }
    }
    load()
    return () => mounted = false
  }, [user])

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Warranty Requests</h2>
      {loading ?     <LoadingSpinner /> : (
        items.length ? (
          <div className="space-y-3">
            {items.map(w => (
              <div key={w._id} className="bg-white p-4 rounded-xl shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Booking: {w.bookingId}</div>
                    <div className="text-sm text-gray-600">{w.issueDetails}</div>
                  </div>
                  <div className="text-sm">{w.status}</div>
                </div>
              </div>
            ))}
          </div>
        ) : <div className="text-gray-600">No warranty requests</div>
      )}
    </div>
  )
}
