import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import DatePicker from '../../../components/ui/DatePicker'
import TimeSlotPicker from '../../../components/ui/TimeSlotPicker'
import Button from '../../../components/ui/Button'
import { readDraft, writeDraft } from './bookingStore'
import bookingsService from '../../../services/bookings.service'
import servicesService from '../../../services/services.service'

export default function SelectSlot() {
  const navigate = useNavigate()
  const draft = readDraft()
  const [date, setDate] = useState(draft.slot?.date || new Date().toISOString().slice(0,10))
  const [slots, setSlots] = useState(draft.availableSlots || [])
  const [selectedSlotId, setSelectedSlotId] = useState(draft.slot?.id || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Get cart items (handle both old and new format)
  const cartItems = draft.items || (draft.service ? [{ service: draft.service }] : [])

  useEffect(() => {
    // Check if cart is empty
    if (cartItems.length === 0) {
      navigate('/client/cart')
      return
    }
    
    loadSlots()
  }, [date])

  async function loadSlots() {
    if (cartItems.length === 0) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Generate time slots for the selected date
      const sample = generateTimeSlots()
      setSlots(sample)
    } catch (err) {
      console.error('Failed to load slots:', err)
      setError('Failed to load time slots')
    } finally {
      setLoading(false)
    }
  }

  function generateTimeSlots() {
    const slots = []
    const hours = [9, 10, 11, 12, 14, 15, 16, 17, 18, 19]
    
    hours.forEach((hour, idx) => {
      const startTime = `${hour.toString().padStart(2, '0')}:00`
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`
      
      slots.push({
        id: `slot-${idx}`,
        label: `${startTime} - ${endTime}`,
        startTime,
        endTime,
        available: true
      })
    })
    
    return slots
  }

  function calculateTotal() {
    return cartItems.reduce((sum, item) => {
      const price = item.selectedOption?.price || item.service?.basePrice || 0
      return sum + price
    }, 0)
  }

  function proceed() {
    if (!selectedSlotId) {
      alert('Please select a time slot')
      return
    }
    
    const slot = slots.find(s => s.id === selectedSlotId)
    writeDraft({ 
      slot: { 
        id: selectedSlotId, 
        date, 
        ...slot 
      }, 
      availableSlots: slots 
    })
    navigate('/client/booking/address')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Select Date & Time</h1>
          <p className="text-gray-600 mt-2">Choose a convenient time slot for your service</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Date & Time Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Select Date
              </h2>
              <DatePicker label="" value={date} onChange={setDate} />
            </motion.div>

            {/* Time Slots */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Available Time Slots
              </h2>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-600">{error}</p>
                </div>
              ) : (
                <TimeSlotPicker 
                  slots={slots} 
                  selected={selectedSlotId} 
                  onSelect={setSelectedSlotId} 
                />
              )}
            </motion.div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3">
              <Button onClick={proceed} size="lg" className="flex-1">
                Continue to Address →
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/client/cart')}
                size="lg"
              >
                ← Back to Cart
              </Button>
            </div>
          </div>

          {/* Right - Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 sticky top-4"
            >
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                      {item.service?.images?.[0] ? (
                        <img
                          src={item.service.images[0]}
                          alt={item.service.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-800 truncate">
                        {item.service?.title}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {item.service?.category}
                      </p>
                      <p className="text-sm font-bold text-green-600 mt-1">
                        ₹{item.selectedOption?.price || item.service?.basePrice}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Slot Info */}
              {selectedSlotId && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-semibold text-blue-900">Selected Slot</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm font-bold text-blue-900">
                    {slots.find(s => s.id === selectedSlotId)?.label}
                  </p>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2 mb-4 pb-4 border-b">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'service' : 'services'})</span>
                  <span>₹{calculateTotal()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Service Charge</span>
                  <span>₹0</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-blue-600">₹{calculateTotal()}</span>
              </div>

              {/* Info */}
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex gap-2">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xs text-green-700">
                    <p className="font-semibold mb-1">Safe & Secure</p>
                    <p>Pay after service completion</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
