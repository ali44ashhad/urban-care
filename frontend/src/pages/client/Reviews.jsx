import React, { useEffect, useState } from 'react'
import reviewsService from '../../services/reviews.service'
import bookingsService from '../../services/bookings.service'
import RatingStars from '../../components/ui/RatingStars'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useAuthContext } from '../../context/AuthContext'

export default function Reviews() {
  const { user } = useAuthContext()
  const [myBookings, setMyBookings] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(5)
  const [editingReview, setEditingReview] = useState(null)

  useEffect(() => {
    loadData()
  }, [user])

  async function loadData() {
    setLoading(true)
    try {
      const bres = await bookingsService.list()
      // Include completed + warranty_requested/warranty_claimed so client can review even after claiming warranty
      const reviewableStatuses = ['completed', 'warranty_requested', 'warranty_claimed']
      const completedBookings = (bres.data?.items || bres.data || []).filter(b => reviewableStatuses.includes(b.status))
      setMyBookings(completedBookings)
      
      // Load client's own reviews
      const rres = await reviewsService.list({ clientId: user?.id || user?._id })
      const reviewData = rres.data?.items || rres.data || []
      setReviews(reviewData)
    } catch (err) {
      console.warn('Error loading reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  async function submit() {
    if (!selectedBooking) {
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Select a booking to review', type: 'error' } }))
      return
    }
    if (!comment.trim()) {
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Write your review comment', type: 'error' } }))
      return
    }
    
    try {
      await reviewsService.create({ 
        bookingId: selectedBooking._id || selectedBooking.id, 
        rating, 
        title: title.trim(),
        comment: comment.trim()
      })
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Review submitted for approval', type: 'success' } }))
      
      // Reset form
      setTitle('')
      setComment('')
      setRating(5)
      setSelectedBooking(null)
      
      // Reload reviews
      loadData()
    } catch (err) {
      window.dispatchEvent(new CustomEvent('app:toast', { 
        detail: { message: err.response?.data?.message || 'Failed to submit review', type: 'error' } 
      }))
    }
  }

  async function handleEdit(review) {
    setEditingReview(review)
    setTitle(review.title || '')
    setComment(review.comment || review.text || '')
    setRating(review.rating)
  }

  async function saveEdit() {
    if (!comment.trim()) {
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Comment is required', type: 'error' } }))
      return
    }

    try {
      await reviewsService.update(editingReview._id || editingReview.id, {
        title: title.trim(),
        comment: comment.trim(),
        rating
      })
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Review updated', type: 'success' } }))
      
      // Reset edit form
      setEditingReview(null)
      setTitle('')
      setComment('')
      setRating(5)
      
      // Reload
      loadData()
    } catch (err) {
      window.dispatchEvent(new CustomEvent('app:toast', { 
        detail: { message: err.response?.data?.message || 'Failed to update review', type: 'error' } 
      }))
    }
  }

  function cancelEdit() {
    setEditingReview(null)
    setTitle('')
    setComment('')
    setRating(5)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-3 sm:py-8 sm:px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Your Reviews</h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Write New Review */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Write a Review
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Choose Completed Booking</label>
                  <select 
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    value={selectedBooking?._id || ''} 
                    onChange={(e) => {
                      const b = myBookings.find(x => x._id === e.target.value)
                      setSelectedBooking(b)
                    }}
                  >
                    <option value="">Select a completed booking</option>
                    {myBookings.map(b => (
                      <option key={b._id} value={b._id}>
                        {b.serviceId?.title || b.service?.title} — {new Date(b.slot?.date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Rating</label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <RatingStars rating={rating} size="lg" />
                    <input 
                      type="range" 
                      min="1" 
                      max="5" 
                      value={rating} 
                      onChange={(e) => setRating(Number(e.target.value))} 
                      className="flex-1"
                    />
                    <span className="text-base sm:text-lg font-semibold text-gray-900">{rating}/5</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Review Title (Optional)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Excellent Service!"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Your Review</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience..."
                    rows={4}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={submit} disabled={!selectedBooking || !comment.trim()}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Submit Review
                  </Button>
                </div>
              </div>
            </div>

            {/* My Reviews List */}
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">My Reviews ({reviews.length})</h3>
              
              {reviews.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-gray-200">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <p className="text-gray-600 text-sm sm:text-base">You haven't written any reviews yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(r => {
                    const service = r.bookingId?.serviceId
                    const isEditing = editingReview?._id === r._id
                    
                    return (
                      <div key={r._id} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200">
                        {isEditing ? (
                          /* Edit Mode */
                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                              <h4 className="text-base sm:text-lg font-semibold text-gray-900">Edit Review</h4>
                              <Button variant="ghost" size="sm" onClick={cancelEdit}>
                                Cancel
                              </Button>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-2 block">Rating</label>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                <RatingStars rating={rating} />
                                <input type="range" min="1" max="5" value={rating} onChange={(e) => setRating(Number(e.target.value))} className="flex-1" />
                                <span className="font-semibold">{rating}/5</span>
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-2 block">Title (Optional)</label>
                              <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-4 py-2.5"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-2 block">Comment</label>
                              <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                className="w-full rounded-xl border border-gray-300 px-4 py-2.5"
                              />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                              <Button onClick={saveEdit} disabled={!comment.trim()}>Save Changes</Button>
                              <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          /* Display Mode */
                          <div className="flex flex-col sm:flex-row gap-4">
                            {/* Service Image */}
                            {service && (
                              <div className="flex-shrink-0 mb-3 sm:mb-0">
                                {service.image || service.images?.[0] ? (
                                  <img
                                    src={service.image || service.images[0]}
                                    alt={service.title}
                                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                                    {service.title?.[0] || 'S'}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Review Content */}
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-3">
                                <div>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1 sm:mb-2">
                                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{service?.title || 'Service'}</h4>
                                    <RatingStars rating={r.rating} size="sm" />
                                  </div>
                                  {service?.category && (
                                    <p className="text-xs sm:text-sm text-gray-500">{service.category}</p>
                                  )}
                                </div>
                                
                                {/* Status Badge */}
                                {r.isApproved ? (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full self-start">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Published
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full self-start">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Pending Approval
                                  </span>
                                )}
                              </div>

                              {r.title && (
                                <h5 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">{r.title}</h5>
                              )}

                              <p className="text-gray-700 leading-relaxed mb-2 sm:mb-3 text-sm sm:text-base">{r.comment || r.text}</p>

                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="text-xs text-gray-500">
                                  {new Date(r.createdAt).toLocaleDateString('en-IN', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </div>

                                <Button variant="ghost" size="sm" onClick={() => handleEdit(r)}>
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
