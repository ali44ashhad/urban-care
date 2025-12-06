import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './ui/Button'
import RatingStars from './ui/RatingStars'
import reviewsService from '../services/reviews.service'
import LoadingSpinner from './ui/LoadingSpinner'

export default function ServiceDetailModal({ service, onClose, onAddToCart }) {
  const navigate = useNavigate()
  const [selectedVariant, setSelectedVariant] = useState(service?.pricingOptions?.[0] || null)
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(false)

  useEffect(() => {
    loadReviews()
  }, [service])

  async function loadReviews() {
    if (!service?._id && !service?.id) return
    setLoadingReviews(true)
    try {
      const res = await reviewsService.listByService(service._id || service.id)
      setReviews(res.data?.items || res.data || [])
    } catch (err) {
      console.warn('Failed to load reviews:', err)
    } finally {
      setLoadingReviews(false)
    }
  }

  if (!service) return null

  const handleAddToCart = () => {
    // Store service in session for booking flow
    const cartItem = {
      service,
      selectedOption: selectedVariant || {
        name: 'Standard',
        price: service.basePrice,
        description: service.description
      }
    }
    
    sessionStorage.setItem('bookingDraft', JSON.stringify(cartItem))
    
    // Dispatch event to update cart count
    window.dispatchEvent(new Event('cartUpdated'))
    
    if (onAddToCart) {
      onAddToCart(service)
    }
    
    // Show success toast
    window.dispatchEvent(new CustomEvent('app:toast', {
      detail: { message: 'Service added to cart!', type: 'success' }
    }))
    
    // Close modal
    onClose()
    
    // Navigate to cart page
    navigate('/client/cart')
  }

  const currentPrice = selectedVariant?.price || service.basePrice

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{service.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Service Image */}
          {(service.image || service.images?.[0]) && (
            <div className="mb-6 rounded-xl overflow-hidden">
              <img 
                src={service.image || service.images[0]} 
                alt={service.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Description</h3>
            <p className="text-gray-700 leading-relaxed">{service.description}</p>
          </div>

          {/* Pricing Options */}
          {service.pricingOptions && service.pricingOptions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Choose Your Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {service.pricingOptions.map((option, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedVariant(option)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedVariant?.name === option.name
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 mb-1">{option.name}</div>
                    <div className="text-2xl font-bold text-blue-600">₹{option.price}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Base Price if no pricing options */}
          {(!service.pricingOptions || service.pricingOptions.length === 0) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pricing</h3>
              <div className="text-3xl font-bold text-green-600">₹{service.basePrice}</div>
            </div>
          )}

          {/* Inclusions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Included</h3>
            <ul className="space-y-2">
              {(service.inclusions || [
                'Professional service',
                'Quality materials used',
                'Post-service cleanup',
                '14-day warranty on service'
              ]).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Terms & Conditions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Terms & Conditions</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Service duration: {service.durationMin || 60} minutes approximately</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Payment on delivery (POD) - Pay after service completion</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>14-day warranty from service completion date</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Cancellation allowed up to 2 hours before scheduled time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Verified and trained professionals</span>
              </li>
            </ul>
          </div>

          {/* Warranty Info */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <div className="font-semibold text-green-900 mb-1">14-Day Service Warranty</div>
                <p className="text-sm text-green-800">
                  If you face any issues within 14 days of service completion, we'll send our technician 
                  to resolve it at no extra cost. Warranty slip will be provided after service.
                </p>
              </div>
            </div>
          </div>

          {/* Customer Reviews */}
          {reviews.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Customer Reviews ({reviews.length})
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {reviews.map((review) => (
                  <div key={review._id || review.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {review.clientId?.name?.[0] || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{review.clientId?.name || 'Anonymous'}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('en-IN', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                      </div>
                      <RatingStars rating={review.rating} size="sm" />
                    </div>
                    {review.title && (
                      <h4 className="font-semibold text-gray-900 mb-1">{review.title}</h4>
                    )}
                    <p className="text-gray-700 text-sm">{review.comment || review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loadingReviews && (
            <LoadingSpinner />
          )}
        </div>

        {/* Footer - Sticky Add to Cart Button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-gray-600">Total Amount</div>
              <div className="text-3xl font-bold text-gray-900">₹{currentPrice}</div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleAddToCart} className="min-w-[180px]">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
