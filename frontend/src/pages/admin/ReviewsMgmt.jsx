import React, { useEffect, useState } from 'react'
import reviewsService from '../../services/reviews.service'
import ReviewList from '../../components/lists/ReviewList'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function ReviewsMgmt() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const res = await reviewsService.list({ pending: true }) // filter for moderation if supported
        let reviewData = res.data || []
        if (!Array.isArray(reviewData)) {
          reviewData = reviewData.items || reviewData.reviews || reviewData.data || []
        }
        if (!Array.isArray(reviewData)) {
          reviewData = []
        }
        if (mounted) setReviews(reviewData)
      } catch (err) { 
        console.warn(err)
        if (mounted) setReviews([])
      } finally { if (mounted) setLoading(false) }
    }
    load()
    return () => mounted = false
  }, [])

  async function handleApprove(r) {
    try {
      await reviewsService.approve(r._id || r.id)
      // Remove from list after approval
      setReviews(prev => prev.filter(x => x._id !== r._id))
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Review approved and published', type: 'success' } }))
    } catch (err) { alert('Operation failed') }
  }

  async function handleRemove(r) {
    if (!confirm('Remove this review?')) return
    try {
      await reviewsService.remove(r._id || r.id)
      setReviews(prev => prev.filter(x => x._id !== r._id))
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Review removed', type: 'info' } }))
    } catch (err) { alert('Operation failed') }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Reviews Moderation</h2>

      <Card>
        {loading ? <LoadingSpinner /> : reviews.length === 0 ? <div className="text-gray-500">No reviews to moderate</div> : (
          <ReviewList reviews={reviews} actions={{ onApprove: handleApprove, onRemove: handleRemove }} />
        )}
      </Card>
    </div>
  )
}
