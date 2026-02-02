import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import { readDraft, writeDraft } from './bookingStore'
import { useAuthContext } from '../../../context/AuthContext'
import bookingsService from '../../../services/bookings.service'

export default function AddressForm() {
  const navigate = useNavigate()
  const draft = readDraft()
  const { user } = useAuthContext()
  
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  
  const [form, setForm] = useState({
    name: draft.client?.name || user?.name || '',
    phone: draft.client?.phone || user?.phone || '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    label: 'Home' // Home, Work, Other
  })
  
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Get cart items
  const cartItems = draft.items || (draft.service ? [{ service: draft.service }] : [])

  useEffect(() => {
    loadSavedAddresses()
  }, [])

  function loadSavedAddresses() {
    try {
      const userId = user?._id || user?.id || 'guest'
      const key = `savedAddresses_${userId}`
      const saved = localStorage.getItem(key)
      if (saved) {
        const addresses = JSON.parse(saved)
        setSavedAddresses(addresses)
        
        // Auto-select first address if available
        if (addresses.length > 0 && !selectedAddressId) {
          setSelectedAddressId(addresses[0].id)
        }
      }
    } catch (err) {
      console.error('Failed to load addresses:', err)
    }
  }

  function saveAddressToStorage(address) {
    try {
      const userId = user?._id || user?.id || 'guest'
      const key = `savedAddresses_${userId}`
      
      const newAddress = {
        id: editingAddressId || Date.now().toString(),
        ...address,
        createdAt: new Date().toISOString()
      }
      
      let addresses = [...savedAddresses]
      
      if (editingAddressId) {
        // Update existing
        addresses = addresses.map(a => a.id === editingAddressId ? newAddress : a)
      } else {
        // Add new
        addresses.push(newAddress)
      }
      
      localStorage.setItem(key, JSON.stringify(addresses))
      setSavedAddresses(addresses)
      setSelectedAddressId(newAddress.id)
      setShowAddForm(false)
      setEditingAddressId(null)
      resetForm()
    } catch (err) {
      console.error('Failed to save address:', err)
      setError('Failed to save address')
    }
  }

  function deleteAddress(addressId) {
    if (!confirm('Delete this address?')) return
    
    try {
      const userId = user?._id || user?.id || 'guest'
      const key = `savedAddresses_${userId}`
      
      const addresses = savedAddresses.filter(a => a.id !== addressId)
      localStorage.setItem(key, JSON.stringify(addresses))
      setSavedAddresses(addresses)
      
      if (selectedAddressId === addressId) {
        setSelectedAddressId(addresses[0]?.id || null)
      }
    } catch (err) {
      console.error('Failed to delete address:', err)
    }
  }

  function editAddress(address) {
    setForm({
      name: address.name,
      phone: address.phone,
      addressLine: address.addressLine,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      label: address.label
    })
    setEditingAddressId(address.id)
    setShowAddForm(true)
  }

  function resetForm() {
    setForm({
      name: user?.name || '',
      phone: user?.phone || '',
      addressLine: '',
      city: '',
      state: '',
      pincode: '',
      label: 'Home'
    })
  }

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function handleAddAddress() {
    const v = validateForm()
    if (v) { setError(v); return }
    
    saveAddressToStorage(form)
    setError(null)
  }

  function validateForm() {
    if (!form.name) return 'Name required'
    if (!form.phone || form.phone.length < 10) return 'Enter valid 10-digit phone number'
    if (!form.addressLine) return 'Address required'
    if (!form.city) return 'City required'
    if (!form.state) return 'State required'
    if (!form.pincode || form.pincode.length !== 6) return 'Enter valid 6-digit pincode'
    return null
  }

  function calculateTotal() {
    return cartItems.reduce((sum, item) => {
      const price = item.selectedOption?.price || item.service?.basePrice || 0
      return sum + price
    }, 0)
  }

  async function proceedToBooking() {
    if (!selectedAddressId) {
      setError('Please select or add an address')
      return
    }
    
    const selectedAddress = savedAddresses.find(a => a.id === selectedAddressId)
    if (!selectedAddress) {
      setError('Selected address not found')
      return
    }
    
    setSubmitting(true)
    setError(null)
    
    try {
      // Create bookings for all cart items
      const bookingPromises = cartItems.map(item => {
        return bookingsService.create({
          serviceId: item.service?._id || item.service?.id,
          slot: draft.slot,
          address: { 
            line1: selectedAddress.addressLine,
            city: selectedAddress.city,
            state: selectedAddress.state,
            pincode: selectedAddress.pincode
          },
          price: item.selectedOption?.price || item.service?.basePrice || 0,
          client: { 
            name: selectedAddress.name, 
            phone: selectedAddress.phone 
          }
        })
      })
      
      const results = await Promise.all(bookingPromises)
      const firstBooking = results[0].data
      
      // Clear draft and cart
      sessionStorage.removeItem('bookingDraft')
      
      // Dispatch event to update cart count in header
      window.dispatchEvent(new Event('cartUpdated'))
      
      // Navigate to confirmation
      navigate(`/client/booking/confirmation?bookingId=${firstBooking._id || firstBooking.id}`)
    } catch (err) {
      console.error('Booking creation failed:', err)
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Delivery Address</h1>
          <p className="text-gray-600 mt-2">Select or add a delivery address for your service</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Address Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Saved Addresses */}
            {savedAddresses.length > 0 && !showAddForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
              >
                <h2 className="text-xl font-semibold mb-4">Saved Addresses</h2>
                
                <div className="space-y-3">
                  {savedAddresses.map((address) => (
                    <div
                      key={address.id}
                      onClick={() => setSelectedAddressId(address.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedAddressId === address.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              address.label === 'Home' ? 'bg-green-100 text-green-700' :
                              address.label === 'Work' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {address.label}
                            </span>
                            {selectedAddressId === address.id && (
                              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          
                          <h3 className="font-semibold text-gray-900">{address.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{address.phone}</p>
                          <p className="text-sm text-gray-700 mt-2">
                            {address.addressLine}, {address.city}, {address.state} - {address.pincode}
                          </p>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); editAddress(address) }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteAddress(address.id) }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Add New Address Button */}
            {!showAddForm && (
              <button
                onClick={() => { setShowAddForm(true); setEditingAddressId(null); resetForm() }}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-semibold">Add New Address</span>
              </button>
            )}

            {/* Add/Edit Address Form */}
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
              >
                <h2 className="text-xl font-semibold mb-4">
                  {editingAddressId ? 'Edit Address' : 'Add New Address'}
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                      label="Full Name *" 
                      value={form.name} 
                      onChange={(e) => setField('name', e.target.value)}
                      placeholder="Enter your name"
                    />
                    <Input 
                      label="Phone Number *" 
                      value={form.phone} 
                      onChange={(e) => setField('phone', e.target.value)}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                    />
                  </div>
                  
                  <Input 
                    label="Address Line *" 
                    value={form.addressLine} 
                    onChange={(e) => setField('addressLine', e.target.value)}
                    placeholder="House no., Building name, Street"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    City *
  </label>
  <select
    value={form.city}
    onChange={(e) => setField('city', e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
  >
    <option value="">Select City</option>
    <option value="Other">Other Locations</option>
    <option value="Akshay Nagar">Akshay Nagar</option>
  </select>
</div>

                    <Input 
                      label="State *" 
                      value={form.state} 
                      onChange={(e) => setField('state', e.target.value)}
                      placeholder="State"
                    />
                    <Input 
                      label="Pincode *" 
                      value={form.pincode} 
                      onChange={(e) => setField('pincode', e.target.value)}
                      placeholder="6-digit pincode"
                      maxLength={6}
                    />
                  </div>
                  
                  {/* Address Label */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                    <div className="flex gap-3">
                      {['Home', 'Work', 'Other'].map(label => (
                        <button
                          key={label}
                          onClick={() => setField('label', label)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            form.label === label
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}

                  <div className="flex gap-3">
                    <Button onClick={handleAddAddress}>
                      {editingAddressId ? 'Update Address' : 'Save Address'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => { setShowAddForm(false); setEditingAddressId(null); resetForm(); setError(null) }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            {!showAddForm && savedAddresses.length > 0 && (
              <div className="flex items-center gap-3">
                <Button 
                  onClick={proceedToBooking} 
                  disabled={!selectedAddressId || submitting}
                  size="lg"
                  className="flex-1"
                >
                  {submitting ? 'Creating Booking...' : 'Confirm Booking →'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/client/booking/select-slot')}
                  disabled={submitting}
                  size="lg"
                >
                  ← Back
                </Button>
              </div>
            )}
          </div>

          {/* Right - Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 sticky top-4"
            >
              <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>

              {/* Slot Info */}
              {draft.slot && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-semibold text-blue-900">Scheduled Time</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    {new Date(draft.slot.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm font-bold text-blue-900">{draft.slot.label}</p>
                </div>
              )}

              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
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
                <span className="text-lg font-bold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-blue-600">₹{calculateTotal()}</span>
              </div>

              {/* Info */}
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex gap-2">
                  <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>14-day service warranty</span>
                </div>
                <div className="flex gap-2">
                  <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Pay after service completion</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
