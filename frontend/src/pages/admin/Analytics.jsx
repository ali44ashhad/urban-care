import React, { useEffect, useState } from 'react'
import adminService from '../../services/admin.service'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('30d')

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const res = await adminService.analytics({ range })
        if (mounted) setData(res.data || {})
      } catch (err) { 
        console.warn('Analytics endpoint not available', err)
        // Provide fallback empty data
        if (mounted) setData({ bookingsCount: 0, revenue: 0, avgRating: 0 })
      } finally { if (mounted) setLoading(false) }
    }
    load()
    return () => (mounted = false)
  }, [range])

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Analytics</h2>
        <div className="flex gap-2">
          <button className={`px-3 py-2 rounded ${range==='7d' ? 'bg-blue-600 text-white' : 'bg-white'}`} onClick={() => setRange('7d')}>7d</button>
          <button className={`px-3 py-2 rounded ${range==='30d' ? 'bg-blue-600 text-white' : 'bg-white'}`} onClick={() => setRange('30d')}>30d</button>
          <button className={`px-3 py-2 rounded ${range==='90d' ? 'bg-blue-600 text-white' : 'bg-white'}`} onClick={() => setRange('90d')}>90d</button>
        </div>
      </div>

      <Card>
        {loading ? <div><LoadingSpinner /></div> : !data ? <div className="text-gray-500">No analytics data</div> : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg shadow">
              <div className="text-sm text-gray-500">Bookings</div>
              <div className="text-2xl font-bold mt-2">{data.bookingsCount ?? 0}</div>
              <div className="text-sm text-gray-500 mt-1">in selected range</div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow">
              <div className="text-sm text-gray-500">Revenue</div>
              <div className="text-2xl font-bold mt-2">₹{data.revenue ?? 0}</div>
              <div className="text-sm text-gray-500 mt-1">estimated</div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow">
              <div className="text-sm text-gray-500">Avg Rating</div>
              <div className="text-2xl font-bold mt-2">{data.avgRating ?? '—'}</div>
              <div className="text-sm text-gray-500 mt-1">across services</div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
