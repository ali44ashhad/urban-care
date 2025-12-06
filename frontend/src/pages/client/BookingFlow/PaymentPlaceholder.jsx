import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import Select from '../../../components/ui/Select'
import bookingsService from '../../../services/bookings.service'
import paymentsService from '../../../services/payments.service'
import { readDraft, writeDraft, clearDraft } from './bookingStore'
import { useAuthContext } from '../../../context/AuthContext'

export default function PaymentPlaceholder() {
  const navigate = useNavigate()
  const draft = readDraft()
  const { user } = useAuthContext()
  const [paymentMethod, setPaymentMethod] = useState(draft.paymentMethod || 'POD')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!draft.service || !draft.slot || !draft.address) {
    return <div className="p-6">Booking information incomplete. Please restart booking.</div>
  }

  const computedAmount = (() => {
    const base = draft.service.basePrice || 0
    const variantModifier = (draft.service.variants?.find(v=>v.name===draft.variant)?.priceModifier) || 0
    return base + variantModifier
  })()

  async function handlePayAndCreate() {
    setLoading(true); setError(null)
    try {
      if (paymentMethod === 'ONLINE') {
        // create order on backend for payment provider
        const orderRes = await paymentsService.createOrder({
          amount: computedAmount * 100, // paise if INR
          currency: 'INR',
          bookingReference: 'temp'
        })
      }

      // Create booking in backend
      const payload = {
        serviceId: draft.service._id || draft.service.id,
        slot: {
          date: new Date(draft.slot.date),
          startTime: draft.slot.startTime,
          endTime: draft.slot.endTime
        },
        address: {
          line1: draft.address.addressLine || draft.address.line1,
          city: draft.address.city,
          state: draft.address.state,
          pincode: draft.address.pincode,
          label: draft.address.label
        },
        price: computedAmount,
        paymentMethod: paymentMethod
      }

      const res = await bookingsService.create(payload)
      clearDraft()
      navigate(`/client/booking/confirmation?bookingId=${res.data._id || res.data.id}`)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || err.message || 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Payment</h2>

      <div className="bg-white p-6 rounded-2xl shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="text-sm text-gray-500">Service</div>
            <div className="font-semibold">{draft.service.title}</div>
            <div className="text-sm text-gray-500">Slot: {draft.slot.date} • {draft.slot.label || draft.slot.startTime}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Amount</div>
            <div className="text-lg font-bold">₹{computedAmount}</div>
          </div>
        </div>

        <div>
          <Select label="Payment method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} options={[
            { value: 'POD', label: 'Pay on Delivery (Cash/Card to technician)' },
            { value: 'ONLINE', label: 'Pay online (Razorpay / Stripe)' }
          ]} />
        </div>

        {error && <div className="text-red-600">{error}</div>}

        <div className="flex gap-3">
          <Button onClick={handlePayAndCreate} loading={loading}>Confirm & Pay</Button>
          <Button variant="ghost" onClick={() => navigate('/client/booking/address')}>Back</Button>
        </div>
      </div>
    </div>
  )
}
