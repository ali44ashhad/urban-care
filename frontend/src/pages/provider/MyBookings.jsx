import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProviderContext } from '../../context/ProviderContext'
import bookingsService from '../../services/bookings.service'

export default function MyBookings() {
  const { assignedBookings, loadAssignedBookings, loadingProvider } = useProviderContext()
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadAssignedBookings()
  }, [loadAssignedBookings])

  async function handleQuickAccept(bookingId, e) {
    e.stopPropagation()
    if (!confirm('Accept this booking?')) return
    
    setActionLoading(bookingId)
    try {
      await bookingsService.acceptBooking(bookingId)
      await loadAssignedBookings()
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Booking accepted', type: 'success' } }))
    } catch (err) {
      console.error('Accept error:', err)
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Failed to accept booking', type: 'error' } }))
    } finally {
      setActionLoading(null)
    }
  }
function formatDate(dateString) {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

  async function handleQuickReject(bookingId, e) {
    e.stopPropagation()
    const reason = prompt('Reason for rejection:')
    if (!reason) return
    
    setActionLoading(bookingId)
    try {
      await bookingsService.rejectBooking(bookingId, reason)
      await loadAssignedBookings()
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Booking rejected', type: 'info' } }))
    } catch (err) {
      console.error('Reject error:', err)
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Failed to reject booking', type: 'error' } }))
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    loadAssignedBookings()
  }, [loadAssignedBookings])

  const filteredBookings = assignedBookings.filter(b => {
    if (statusFilter === 'all') return true
    return b.status === statusFilter
  })

  const statusCounts = {
    all: assignedBookings.length,
    pending: assignedBookings.filter(b => b.status === 'pending').length,
    accepted: assignedBookings.filter(b => b.status === 'accepted').length,
    in_progress: assignedBookings.filter(b => b.status === 'in_progress').length,
    completed: assignedBookings.filter(b => b.status === 'completed').length,
    cancelled: assignedBookings.filter(b => b.status === 'cancelled').length
  }

  function getStatusBadge(status) {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-purple-100 text-purple-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    }
    return badges[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-600 mt-1">Manage your assigned bookings</p>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')} ({count})
          </button>
        ))}
      </div>

      {loadingProvider ? (
        <div className="text-center py-8 text-gray-500">Loading bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No bookings found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookings.map(b => (
            <div
              key={b._id || b.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/provider/bookings/${b._id || b.id}`)}
            >
              {/* Service Image */}
              <div className="h-32 bg-gradient-to-br from-blue-100 to-indigo-100 relative flex items-center justify-center">
                {(b.service?.image || b.serviceId?.image || b.service?.images?.[0] || b.serviceId?.images?.[0]) ? (
                  <img
                    src={b.service?.image || b.serviceId?.image || b.service?.images?.[0] || b.serviceId?.images?.[0]}
                    alt={b.service?.title || b.serviceId?.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                )}
                {/* Status Badge */}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(b.status)}`}>
                  {b.status}
                </div>
              </div>

              {/* Booking Details */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                  {b.service?.title || b.serviceId?.title || 'Service'}
                </h3>
                <div className="text-sm space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                <span>{formatDate(b.slot?.date)}</span>

                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{b.client?.name || b.clientId?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-green-600 text-lg">
                    ₹{b.price || 0}
                  </div>
                </div>

                {/* Quick Actions for Pending Bookings */}
                {b.status === 'pending' && (
                  <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleQuickAccept(b._id || b.id, e)}
                      disabled={actionLoading === (b._id || b.id)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:bg-gray-300"
                    >
                      {actionLoading === (b._id || b.id) ? 'Processing...' : '✓ Accept'}
                    </button>
                    <button
                      onClick={(e) => handleQuickReject(b._id || b.id, e)}
                      disabled={actionLoading === (b._id || b.id)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium disabled:bg-gray-300"
                    >
                      {actionLoading === (b._id || b.id) ? 'Processing...' : '✕ Reject'}
                    </button>
                  </div>
                )}

                {/* View Details Button */}
                <button
                  onClick={() => navigate(`/provider/bookings/${b._id || b.id}`)}
                  className="w-full mt-3 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
