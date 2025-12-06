import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'

/**
 * bookings: array
 * actions: { onAccept, onReject, onCancel, onComplete } as needed
 */
export default function BookingList({ bookings = [], actions = {} }) {
  const navigate = useNavigate()
  
  if (!bookings.length) return <div className="text-gray-600">No bookings</div>

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      warranty_requested: 'bg-orange-100 text-orange-800',
      warranty_claimed: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const handleViewDetails = (booking) => {
    navigate(`/client/bookings/${booking._id || booking.id}`)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {bookings.map(b => {
        const service = b.serviceId || b.service
        
        return (
          <div 
            key={b._id || b.id} 
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col md:flex-row">
              {/* Service Image - Left Side */}
              <div className="md:w-64 md:flex-shrink-0">
                <div className="h-56 md:h-full bg-gradient-to-br from-blue-100 to-indigo-100 relative flex items-center justify-center">
                  {(service?.image || service?.images?.[0]) ? (
                    <img
                      src={service.image || service.images[0]}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                  {/* Status Badge */}
                  <div className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-xs font-bold shadow-md ${getStatusBadge(b.status)}`}>
                    {b.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Booking Details - Right Side */}
              <div className="flex-1 p-6">
                {/* Header */}
                <div className="mb-5">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {service?.title || 'Service'}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {service?.category && (
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium">
                        {service.category}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      ID: <span className="font-mono font-semibold">#{(b._id || b.id || '').slice(-8)}</span>
                    </span>
                  </div>
                </div>

                {/* Details in 2 Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4 mb-6">
                  {/* Column 1 */}
                  <div className="space-y-4">
                    {/* Date & Time */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium mb-1">Scheduled Date & Time</p>
                        <p className="text-sm font-semibold text-gray-900">{formatDate(b.slot?.date)}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{b.slot?.startTime || 'Time not set'}</p>
                      </div>
                    </div>

                    {/* Price */}
                    {b.price && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium mb-1">Total Amount</p>
                          <p className="text-xl font-bold text-gray-900">₹{b.price}</p>
                          <p className="text-xs text-green-600 mt-0.5">💰 Pay on Delivery</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Column 2 */}
                  <div className="space-y-4">
                    {/* Address */}
                    {b.address && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium mb-1">Service Address</p>
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1">{b.address.line1}</p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {b.address.city}{b.address.state && `, ${b.address.state}`} {b.address.pincode}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Provider Info */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium mb-1">Service Provider</p>
                        {b.providerId ? (
                          <>
                            <p className="text-sm font-semibold text-gray-900">{b.providerId?.name || 'Provider'}</p>
                            {b.providerId?.companyName && (
                              <p className="text-xs text-gray-600 mt-0.5">{b.providerId.companyName}</p>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-yellow-600 font-medium">⏳ To be assigned</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                  <Button 
                    size="sm" 
                    onClick={() => handleViewDetails(b)}
                    className="flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Full Details
                  </Button>

                  {(b.status === 'accepted' || b.status === 'pending') && actions.onCancel && (
                    <Button size="sm" variant="secondary" onClick={() => actions.onCancel(b)}>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel Booking
                    </Button>
                  )}

                  {b.status === 'completed' && (
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => navigate('/client/reviews')}
                      className="flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      Write Review
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
