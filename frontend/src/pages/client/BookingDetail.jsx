import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import bookingsService from '../../services/bookings.service'
import reviewsService from '../../services/reviews.service'
import Button from '../../components/ui/Button'
import WarrantyForm from '../../components/forms/WarrantyForm'
import RatingStars from '../../components/ui/RatingStars'
import Input from '../../components/ui/Input'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function BookingDetail() {
  const { id } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showWarranty, setShowWarranty] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const res = await bookingsService.get(id)
        if (mounted) {
          setBooking(res.data)
          // Check if user has already reviewed this booking
          checkExistingReview(res.data)
        }
      } catch (err) {
        console.warn(err)
      } finally { if (mounted) setLoading(false) }
    }
    load()
    return () => mounted = false
  }, [id])

  async function checkExistingReview(bookingData) {
    try {
      // Check if a review exists for this booking
      const res = await reviewsService.list({ bookingId: id })
      if (res.data && res.data.length > 0) {
        setHasReviewed(true)
      }
    } catch (err) {
      console.warn('Could not check existing review:', err)
    }
  }

  async function handleCancel() {
    if (!confirm('Cancel booking?')) return
    try {
      await bookingsService.cancel(id, 'Cancelled by client')
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Booking cancelled', type: 'info' } }))
      navigate('/client/bookings')
    } catch (err) { alert('Cancel failed') }
  }

  async function handleReviewSubmit() {
    if (!reviewText.trim()) {
      alert('Please write your review')
      return
    }
    setSubmitting(true)
    try {
      await reviewsService.create({
        bookingId: id,
        rating,
        text: reviewText,
        title: `Review for ${booking.service?.title || 'service'}`
      })
      window.dispatchEvent(new CustomEvent('app:toast', { 
        detail: { message: 'Review submitted successfully', type: 'success' } 
      }))
      setShowReview(false)
      setReviewText('')
      setRating(5)
      setHasReviewed(true) // Update state to hide review button
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner/>
  if (!booking) return <div className="p-6">Not found</div>

  const canReview = booking.status === 'completed' && !hasReviewed
  const service = booking.serviceId || booking.service
  
  // Check if warranty period is still valid
  const isWarrantyValid = booking.status === 'completed' && booking.warrantyExpiresAt && new Date(booking.warrantyExpiresAt) > new Date()
  const canRequestWarranty = isWarrantyValid && !booking.warrantyRequests?.length
  const canCancel = !['cancelled', 'completed', 'rejected'].includes(booking.status)

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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/client/bookings')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to My Bookings
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          {/* Header with Service Image */}
          <div className="relative h-64 bg-gradient-to-br from-blue-100 to-indigo-100">
            {(service?.image || service?.images?.[0]) ? (
              <img
                src={service.image || service.images[0]}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {/* Status Badge */}
            <div className={`absolute top-6 right-6 px-4 py-2 rounded-full text-sm font-bold shadow-lg ${getStatusBadge(booking.status)}`}>
              {booking.status.replace('_', ' ').toUpperCase()}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Title Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {service?.title || 'Service'}
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                {service?.category && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {service.category}
                  </span>
                )}
                <span className="text-sm text-gray-500">
                  Booking ID: <span className="font-mono font-semibold">#{(booking._id || '').slice(-8)}</span>
                </span>
              </div>
            </div>

            {/* Details Grid - 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Date & Time */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 font-medium mb-1">Scheduled Date & Time</p>
                    <p className="text-lg font-bold text-gray-900">{formatDate(booking.slot?.date)}</p>
                    <p className="text-sm text-gray-600 mt-1">Time: {booking.slot?.startTime || 'Not set'}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 font-medium mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">₹{booking.price || 0}</p>
                    <p className="text-sm text-green-600 mt-1">💰 Pay on Delivery</p>
                  </div>
                </div>

                {/* Address */}
                {booking.address && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 font-medium mb-1">Service Address</p>
                      <p className="text-base font-semibold text-gray-900">{booking.address.line1}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {booking.address.city}, {booking.address.state} - {booking.address.pincode}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Provider Info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 font-medium mb-1">Service Provider</p>
                    {booking.providerId ? (
                      <>
                        <p className="text-base font-semibold text-gray-900">{booking.providerId?.name || 'N/A'}</p>
                        {booking.providerId?.companyName && (
                          <p className="text-sm text-gray-600 mt-1">{booking.providerId.companyName}</p>
                        )}
                        {booking.providerId?.phone && (
                          <p className="text-sm text-gray-600 mt-1">📞 {booking.providerId.phone}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-base text-yellow-600 font-medium">⏳ To be assigned by admin</p>
                    )}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 font-medium mb-1">Payment Method</p>
                    <p className="text-base font-semibold text-gray-900">{booking.paymentMethod || 'POD'}</p>
                    <p className="text-sm text-gray-600 mt-1">Pay after service completion</p>
                  </div>
                </div>
              </div>
            </div>

        {/* Warranty Slip Display */}
        {booking.status === 'completed' && booking.warrantySlip && (
          <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
            <h3 className="font-semibold mb-2 text-green-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Warranty Slip
            </h3>
            <div className="space-y-2">
              <div className="text-sm text-gray-700">
                {booking.warrantyExpiresAt && (
                  <div>
                    <strong>Valid until:</strong>{' '}
                    {new Date(booking.warrantyExpiresAt).toLocaleDateString()} (14 days from completion)
                  </div>
                )}
                {isWarrantyValid ? (
                  <div className="text-green-600 font-medium mt-1">✓ Warranty is active</div>
                ) : booking.warrantyExpiresAt && (
                  <div className="text-red-600 font-medium mt-1">✗ Warranty has expired</div>
                )}
              </div>
              <a
                href={booking.warrantySlip}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Warranty Slip
              </a>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {canCancel && (
            <Button variant="secondary" onClick={handleCancel}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel Booking
            </Button>
          )}
          {canReview && (
            <Button onClick={() => setShowReview(true)}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Write Review
            </Button>
          )}
          {canRequestWarranty && (
            <Button onClick={() => setShowWarranty(true)}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Request Warranty
            </Button>
          )}
        </div>
        </div>
      </div>

      {/* Review Form */}
      {showReview && (
        <div className="mt-6 bg-white p-4 sm:p-6 rounded-2xl shadow">
          <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                ))}
                <span className="ml-2 text-gray-600">{rating} star{rating > 1 ? 's' : ''}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience with this service..."
                rows="4"
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleReviewSubmit} loading={submitting}>
                Submit Review
              </Button>
              <Button variant="ghost" onClick={() => setShowReview(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Warranty Form */}
      {showWarranty && (
        <div className="mt-6">
          <WarrantyForm bookingId={booking._id} onSubmitted={() => {
            setShowWarranty(false)
            window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Warranty request submitted', type: 'success' } }))
          }} />
        </div>
      )}
      </div>
    </div>
  )
}
