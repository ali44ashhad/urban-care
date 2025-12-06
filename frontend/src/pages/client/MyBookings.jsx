import React, { useEffect, useState } from 'react'
import bookingsService from '../../services/bookings.service'
import Button from '../../components/ui/Button'
import BookingList from '../../components/lists/BookingList'
import { useAuthContext } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function MyBookings() {
  const { user } = useAuthContext()
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const res = await bookingsService.list({})
        console.log('Bookings response:', res.data) // Debug log
        let bookingData = res.data || []
        
        // Handle different response formats
        if (!Array.isArray(bookingData)) {
          bookingData = bookingData.items || bookingData.bookings || bookingData.data || []
        }
        
        if (mounted) {
          setBookings(bookingData)
          setFilteredBookings(bookingData)
        }
      } catch (err) {
        console.error('Failed to load bookings:', err)
      } finally { 
        if (mounted) setLoading(false) 
      }
    }
    load()
    return () => mounted = false
  }, [user])

  useEffect(() => {
    if (filter === 'all') {
      setFilteredBookings(bookings)
    } else {
      setFilteredBookings(bookings.filter(b => b.status === filter))
    }
  }, [filter, bookings])

  async function onCancel(b) {
    if (!confirm('Cancel this booking?')) return
    try {
      await bookingsService.cancel(b._id || b.id, 'Cancelled by client')
      setBookings(prev => prev.map(x => x._id === b._id ? { ...x, status: 'cancelled' } : x))
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Booking cancelled', type: 'info' } }))
    } catch (err) {
      alert('Failed to cancel')
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <h2 className="text-xl sm:text-2xl font-bold">My Bookings</h2>
        <Button onClick={() => navigate('/')} className="w-full sm:w-auto">Book a Service</Button>
      </div>

      {/* Status Filters */}
      <div className="mb-6 flex gap-3 flex-wrap">
        {['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            {status !== 'all' && (
              <span className="ml-2 text-xs">
                ({bookings.filter(b => b.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        filteredBookings.length ? (
          <BookingList bookings={filteredBookings} actions={{ onCancel, onComplete: null, onAccept: null, onReject: null }} />
        ) : (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-600">
              {filter === 'all' ? 'No bookings yet.' : `No ${filter} bookings found.`}
            </p>
          </div>
        )
      )}
    </div>
  )
}
