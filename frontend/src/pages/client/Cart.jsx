import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../../components/ui/Button'

export default function Cart() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [selectedLocation, setSelectedLocation] = useState('')

  useEffect(() => {
    loadCart()
    // Load selected location
    const location = localStorage.getItem('selectedLocation') || 'Akshay Nagar'
    setSelectedLocation(location)
  }, [])

  const loadCart = () => {
    const draft = sessionStorage.getItem('bookingDraft')
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        // Handle both old format (service) and new format (items array)
        if (parsed.items && Array.isArray(parsed.items)) {
          setCartItems(parsed.items)
        } else if (parsed.service) {
          setCartItems([parsed])
        } else {
          setCartItems([])
        }
      } catch (err) {
        console.error('Failed to parse cart:', err)
        setCartItems([])
      }
    }
  }

  const handleRemoveFromCart = (indexToRemove) => {
    const draft = sessionStorage.getItem('bookingDraft')
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        
        // Remove specific item from array
        if (parsed.items && Array.isArray(parsed.items)) {
          parsed.items = parsed.items.filter((_, index) => index !== indexToRemove)
          
          // If no items left, clear the cart completely
          if (parsed.items.length === 0) {
            sessionStorage.removeItem('bookingDraft')
            setCartItems([])
          } else {
            // Update cart with remaining items
            sessionStorage.setItem('bookingDraft', JSON.stringify(parsed))
            setCartItems(parsed.items)
          }
        } else {
          // Old format - clear everything
          sessionStorage.removeItem('bookingDraft')
          setCartItems([])
        }
        
        // Dispatch event to update cart count in header
        window.dispatchEvent(new Event('cartUpdated'))
        window.dispatchEvent(new CustomEvent('app:toast', {
          detail: { message: 'Item removed from cart', type: 'info' }
        }))
      } catch (err) {
        console.error('Failed to remove item:', err)
      }
    }
  }

  const handleProceedToBooking = () => {
    if (cartItems.length === 0) return
    navigate('/client/booking/select-slot')
  }

  const handleContinueShopping = () => {
    navigate('/')
  }

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.selectedOption?.price || item.service?.basePrice || 0
      return sum + price
    }, 0)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
          <p className="text-gray-600 mt-2">Review your selected services before booking</p>
        </div>

        {cartItems.length === 0 ? (
          // Empty Cart
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-12 text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Browse our services and add them to your cart</p>
            <Button onClick={handleContinueShopping} size="lg">
              Browse Services
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm p-6"
                >
                  <div className="flex gap-4">
                    {/* Service Image */}
                    <div className="flex-shrink-0">
                      {item.service?.images?.[0] ? (
                        <img
                          src={item.service.images[0]}
                          alt={item.service.title}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                          {(item.service?.title || 'S')[0]}
                        </div>
                      )}
                    </div>

                    {/* Service Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {item.service?.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.service?.category}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveFromCart(index)}
                          className="text-red-500 hover:text-red-700 transition p-2 rounded-lg hover:bg-red-50"
                          title="Remove from cart"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      {/* Selected Option */}
                      {item.selectedOption && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.selectedOption.name}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {item.selectedOption.description}
                              </div>
                            </div>
                            <div className="text-lg font-bold text-blue-600">
                              ₹{item.selectedOption.price}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Service Features */}
                      {item.service?.inclusions && item.service.inclusions.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs text-gray-500 mb-2">Includes:</div>
                          <div className="flex flex-wrap gap-2">
                            {item.service.inclusions.slice(0, 3).map((inc, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full"
                              >
                                ✓ {inc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Location Badge */}
                      <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Service available in {selectedLocation}, Bangalore
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Continue Shopping Button */}
              <button
                onClick={handleContinueShopping}
                className="w-full py-3 text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2 hover:bg-blue-50 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Continue Shopping
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-sm p-6 sticky top-24"
              >
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Service Charge</span>
                    <span>₹0</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹0</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-blue-600">₹{calculateTotal()}</span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex items-start gap-2 text-gray-600">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>14-day service warranty</span>
                  </div>
                  <div className="flex items-start gap-2 text-gray-600">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Pay on Delivery (POD)</span>
                  </div>
                  <div className="flex items-start gap-2 text-gray-600">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Professional service agents</span>
                  </div>
                </div>

                {/* Proceed Button */}
                <Button
                  onClick={handleProceedToBooking}
                  size="lg"
                  className="w-full"
                  disabled={cartItems.length === 0}
                >
                  Proceed to Book Slot →
                </Button>

                {/* Info */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                  <div className="flex gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>You'll select a convenient time slot in the next step</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
