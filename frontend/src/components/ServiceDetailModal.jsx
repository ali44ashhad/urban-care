import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './ui/Button'
import RatingStars from './ui/RatingStars'
import reviewsService from '../services/reviews.service'
import categoriesService from '../services/categories.service'
import LoadingSpinner from './ui/LoadingSpinner'
import { useAuthContext } from '../context/AuthContext'
import { createSlug, getWarrantyDisplayDays } from '../utils/formatters'

export default function ServiceDetailModal({ service, onClose, onAddToCart }) {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const [selectedVariant, setSelectedVariant] = useState(service?.pricingOptions?.[0] || null)
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [categorySlug, setCategorySlug] = useState(null)

  useEffect(() => {
    loadReviews()
    loadCategorySlug()
  }, [service])

  async function loadCategorySlug() {
    if (!service?.category) return
    try {
      const res = await categoriesService.list()
      const categories = res.data?.items || res.data || []
      const matchedCategory = categories.find(cat => 
        cat.name === service.category || cat.name?.toLowerCase() === service.category?.toLowerCase()
      )
      if (matchedCategory) {
        setCategorySlug(matchedCategory.slug)
      }
    } catch (err) {
      console.warn('Failed to load category slug:', err)
    }
  }

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
    // Check if user is logged in
    if (!user) {
      // Show warning toast
      window.dispatchEvent(new CustomEvent('app:toast', {
        detail: { message: 'Please login to add service to cart', type: 'warning' }
      }))
      
      // Close modal
      onClose()
      
      // Redirect to login with return URL
      navigate('/auth/login', { state: { from: window.location.pathname } })
      return
    }

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

  const warrantyDays = getWarrantyDisplayDays(service)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col min-h-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-3 shrink-0">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 line-clamp-2 min-w-0 flex-1">{service.title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 p-2 -m-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors touch-manipulation"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0">
          {/* Service Image */}
          {(service.image || service.images?.[0]) && (
            <div className="mb-4 sm:mb-6 rounded-lg sm:rounded-xl overflow-hidden -mx-4 sm:mx-0 first:mt-0">
              <img
                src={service.image || service.images[0]}
                alt={service.title}
                className="w-full h-44 sm:h-56 md:h-64 object-cover"
              />
            </div>
          )}

          {/* Category */}
          {service.category && (
            <div className="mb-4 sm:mb-6">
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">Category</h3>
              {categorySlug ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    navigate(`/services/${createSlug(categorySlug)}`)
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors group text-sm sm:text-base touch-manipulation"
                >
                  <span className="font-semibold">{service.category}</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <span className="inline-flex items-center px-3 py-2 sm:px-4 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm sm:text-base">
                  {service.category}
                </span>
              )}
            </div>
          )}

          {/* Description */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2">Service Description</h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-words">{service.description}</p>
          </div>

          {/* Warranty */}
          <div className="mb-4 sm:mb-6 flex items-start sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-green-50 rounded-lg sm:rounded-xl border border-green-100">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-0.5 sm:mt-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-semibold text-green-800 text-sm sm:text-base">{warrantyDays} days warranty included</span>
          </div>

          {/* Pricing Options */}
          {service.pricingOptions && service.pricingOptions.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Choose Your Plan</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {service.pricingOptions.map((option, idx) => (
                  <div
                    key={idx}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedVariant(option)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedVariant(option) }}
                    className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all touch-manipulation min-h-[60px] flex flex-col justify-center ${
                      selectedVariant?.name === option.name
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 active:border-blue-400'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 mb-0.5 text-sm sm:text-base">{option.name}</div>
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">₹{option.price}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Base Price if no pricing options */}
          {(!service.pricingOptions || service.pricingOptions.length === 0) && (
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2">Pricing</h3>
              <div className="text-2xl sm:text-3xl font-bold text-green-600">₹{service.basePrice}</div>
            </div>
          )}

          {/* Inclusions */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">What's Included</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {(service.inclusions || [
                'Professional service',
                'Quality materials used',
                'Post-service cleanup',
                `${warrantyDays}-day warranty on service`
              ]).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 text-sm sm:text-base break-words">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Terms & Conditions */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Terms & Conditions</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1 flex-shrink-0">•</span>
                <span className="break-words">Service duration: {service.durationMin || 60} minutes approximately</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1 flex-shrink-0">•</span>
                <span className="break-words">Payment on delivery (POD) - Pay after service completion</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1 flex-shrink-0">•</span>
                <span className="break-words">{warrantyDays}-day warranty from service completion date</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1 flex-shrink-0">•</span>
                <span className="break-words">Cancellation allowed up to 2 hours before scheduled time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1 flex-shrink-0">•</span>
                <span className="break-words">Verified and trained professionals</span>
              </li>
            </ul>
          </div>

          {/* Warranty Info */}
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl">
            <div className="flex items-start gap-2 sm:gap-3">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div className="min-w-0">
                <div className="font-semibold text-green-900 mb-0.5 sm:mb-1 text-sm sm:text-base">{warrantyDays}-Day Service Warranty</div>
                <p className="text-xs sm:text-sm text-green-800 break-words">
                  If you face any issues within {warrantyDays} days of service completion, we'll send our technician
                  to resolve it at no extra cost. Warranty slip will be provided after service.
                </p>
              </div>
            </div>
          </div>

          {/* Customer Reviews */}
          {reviews.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="truncate">Customer Reviews ({reviews.length})</span>
              </h3>
              <div className="space-y-3 sm:space-y-4 max-h-48 sm:max-h-72 md:max-h-96 overflow-y-auto overscroll-contain">
                {reviews.map((review) => (
                  <div key={review._id || review.id} className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-base flex-shrink-0">
                          {review.clientId?.name?.[0] || 'U'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{review.clientId?.name || 'Anonymous'}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                      <RatingStars rating={review.rating} size="sm" className="flex-shrink-0" />
                    </div>
                    {review.title && (
                      <h4 className="font-semibold text-gray-900 mb-0.5 text-sm sm:text-base">{review.title}</h4>
                    )}
                    <p className="text-gray-700 text-xs sm:text-sm break-words">{review.comment || review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loadingReviews && (
            <LoadingSpinner />
          )}
        </div>

        {/* Footer - Sticky Add to Cart */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 sm:px-6 sm:py-4 shrink-0 pb-[env(safe-area-inset-bottom)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center justify-between sm:block">
              <div className="text-xs sm:text-sm text-gray-600">Total Amount</div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">₹{currentPrice}</div>
            </div>
            <div className="flex gap-2 sm:gap-3 flex-col-reverse sm:flex-row">
              <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto min-h-[44px] touch-manipulation">
                {user?.role === 'admin' ? 'Close' : 'Cancel'}
              </Button>
              {user?.role !== 'admin' && (
                <Button onClick={handleAddToCart} className="w-full sm:min-w-[180px] min-h-[48px] touch-manipulation">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
