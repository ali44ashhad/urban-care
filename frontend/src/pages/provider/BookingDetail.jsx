import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import bookingsService from '../../services/bookings.service'
import servicesService from '../../services/services.service'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

export default function BookingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [warrantyFile, setWarrantyFile] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [showAddExtraModal, setShowAddExtraModal] = useState(false)
  const [servicesList, setServicesList] = useState([])
  const [selectedExtraServiceId, setSelectedExtraServiceId] = useState('')
  const [extraPrice, setExtraPrice] = useState('')
  const [addingExtra, setAddingExtra] = useState(false)

  useEffect(() => {
    loadBooking()
  }, [id])

  async function loadBooking() {
    setLoading(true)
    try {
      const res = await bookingsService.getById(id)
      setBooking(res.data)
    } catch (err) {
      console.error('Load booking error:', err)
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Failed to load booking', type: 'error' } }))
      navigate('/provider/bookings')
    } finally {
      setLoading(false)
    }
  }
function formatDate(dateString) {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

  async function handleAccept() {
    if (!confirm('Accept this booking?')) return
    setActionLoading(true)
    try {
      await bookingsService.acceptBooking(id)
      await loadBooking()
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Booking accepted', type: 'success' } }))
    } catch (err) {
      console.error('Accept error:', err)
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Failed to accept booking', type: 'error' } }))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }
    
    setActionLoading(true)
    try {
      await bookingsService.rejectBooking(id, rejectReason)
      await loadBooking()
      setShowRejectModal(false)
      setRejectReason('')
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Booking rejected', type: 'info' } }))
    } catch (err) {
      console.error('Reject error:', err)
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Failed to reject booking', type: 'error' } }))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCancel() {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation')
      return
    }
    
    setActionLoading(true)
    try {
      await bookingsService.cancel(id, cancelReason)
      await loadBooking()
      setShowCancelModal(false)
      setCancelReason('')
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Booking cancelled', type: 'info' } }))
    } catch (err) {
      console.error('Cancel error:', err)
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Failed to cancel booking', type: 'error' } }))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleStart() {
    if (!confirm('Start this job?')) return
    setActionLoading(true)
    try {
      await bookingsService.startJob(id)
      await loadBooking()
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Job started', type: 'success' } }))
    } catch (err) {
      console.error('Start error:', err)
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Failed to start job', type: 'error' } }))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleComplete() {
    if (!confirm('Mark this job as completed?')) return
    setActionLoading(true)
    try {
      await bookingsService.completeJob(id)
      await loadBooking()
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Job completed', type: 'success' } }))
    } catch (err) {
      console.error('Complete error:', err)
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Failed to complete job', type: 'error' } }))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleWarrantyUpload() {
    if (!warrantyFile) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', warrantyFile)
      await bookingsService.uploadWarrantySlip(id, formData)
      await loadBooking()
      setWarrantyFile(null)
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Warranty slip uploaded', type: 'success' } }))
    } catch (err) {
      console.error('Upload error:', err)
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Failed to upload warranty slip', type: 'error' } }))
    } finally {
      setUploading(false)
    }
  }

  async function loadServices() {
    try {
      const res = await servicesService.list({ limit: 100 })
      const list = res.data?.items || []
      setServicesList(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error('Load services error:', err)
      setServicesList([])
    }
  }

  function openAddExtraModal() {
    setSelectedExtraServiceId('')
    setExtraPrice('')
    loadServices()
    setShowAddExtraModal(true)
  }

  async function handleAddExtraService() {
    if (!selectedExtraServiceId) {
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Select a service', type: 'error' } }))
      return
    }
    setAddingExtra(true)
    try {
      const payload = { serviceId: selectedExtraServiceId }
      if (extraPrice !== '' && extraPrice !== null) payload.price = Number(extraPrice)
      await bookingsService.addExtraService(id, payload)
      await loadBooking()
      setShowAddExtraModal(false)
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Extra service added. Client will confirm.', type: 'success' } }))
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to add'
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: msg, type: 'error' } }))
    } finally {
      setAddingExtra(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="text-center py-8 text-gray-500">Loading booking details...</div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="text-center py-8 text-gray-500">Booking not found</div>
      </div>
    )
  }

  const service = booking.service || booking.serviceId || {}
  const client = booking.client || booking.clientId || {}
  const address = booking.address || {}
  const imageUrl = service.image || service.images?.[0]

  const statusBadgeClass = {
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    rejected: 'bg-red-100 text-red-700'
  }[booking.status] || 'bg-gray-100 text-gray-700'

  const canAccept = booking.status === 'pending'
  const canReject = booking.status === 'pending'
  const canCancel = ['accepted', 'in_progress'].includes(booking.status)
  const canStart = booking.status === 'accepted'
  const canComplete = booking.status === 'in_progress'
  const canUploadWarranty = booking.status === 'completed' && !booking.warrantySlipUrl

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-4">
        <Button variant="secondary" size="sm" onClick={() => navigate('/provider/bookings')}>
          ← Back to Bookings
        </Button>
      </div>

      <div className="space-y-6">
        {/* Header Card */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Service Image */}
            <div className="w-full sm:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-indigo-100">
              {imageUrl ? (
                <img src={imageUrl} alt={service.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              )}
            </div>

            {/* Service Details */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{service.title || 'Service'}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusBadgeClass}`}>
                  {booking.status}
                </span>
              </div>
              <p className="text-gray-600 mb-3">{service.description}</p>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-green-600">₹{booking.price || service.basePrice || 0}</span>
                <span className="text-sm text-gray-500">Booking ID: #{(booking._id || booking.id || '').slice(-8)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Client Information */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Client Information</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">{client.name || 'N/A'}</span>
            </div>
            {/* {client.email && (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{client.email}</span>
              </div>
            )} */}
            {client.phone && (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${client.phone}`} className="text-blue-600 hover:underline">{client.phone}</a>
              </div>
            )}
          </div>
        </Card>

        {/* Schedule & Location */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Schedule & Location</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
             <span className="font-medium">
  {formatDate(booking.slot?.date)}
</span>

            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{booking.slot?.label || booking.slot?.startTime || 'N/A'}</span>
            </div>
            {(address.line1 || address.city) && (
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  {address.line1 && <div>{address.line1}</div>}
                  <div>
                    {address.city && address.city}
                    {address.state && `, ${address.state}`}
                    {address.pincode && ` - ${address.pincode}`}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Extra services — add when at client (accepted / in_progress) */}
        {(canStart || canComplete) && (
          <Card>
            <h2 className="text-xl font-semibold mb-4">Extra services at client</h2>
            <p className="text-sm text-gray-600 mb-3">If the client asks for additional work, add services here. Client will confirm and admin will see the final list.</p>
            <div className="space-y-2 mb-4">
              {(booking.extraServices || []).map((ext, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{ext.title}</span>
                  <span className="text-gray-600">₹{ext.price ?? 0}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${ext.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {ext.status}
                  </span>
                </div>
              ))}
              {(booking.extraServices || []).length === 0 && (
                <p className="text-sm text-gray-500">No extra services added yet.</p>
              )}
            </div>
            <Button variant="secondary" onClick={openAddExtraModal}>
              + Add extra service
            </Button>
          </Card>
        )}

        {/* Actions — Accept / Reject (pending), Start Job (accepted), Complete (in_progress), Cancel */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            {canAccept && (
              <>
                <Button
                  onClick={handleAccept}
                  disabled={actionLoading}
                  variant="primary"
                >
                  {actionLoading ? 'Processing...' : '✓ Accept Booking'}
                </Button>
                <Button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  variant="secondary"
                  className="bg-red-100 text-red-700 hover:bg-red-200"
                >
                  ✕ Reject Booking
                </Button>
              </>
            )}
            {canStart && (
              <Button
                onClick={handleStart}
                disabled={actionLoading}
                variant="primary"
              >
                {actionLoading ? 'Processing...' : '▶ In Progress (Start Job)'}
              </Button>
            )}
            {canComplete && (
              <Button
                onClick={handleComplete}
                disabled={actionLoading}
                variant="primary"
              >
                {actionLoading ? 'Processing...' : '✓ Completed (Complete Job)'}
              </Button>
            )}
            {canCancel && (
              <Button
                onClick={() => setShowCancelModal(true)}
                disabled={actionLoading}
                variant="secondary"
              >
                🚫 Cancel Booking
              </Button>
            )}
            {!canAccept && !canStart && !canComplete && !canCancel && (
              <p className="text-gray-500">No actions available for this booking status</p>
            )}
          </div>
        </Card>

        {/* Warranty Upload */}
        {/* {canUploadWarranty && (
          <Card>
            <h2 className="text-xl font-semibold mb-4">Upload Warranty Slip</h2>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setWarrantyFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {warrantyFile && (
                <Button onClick={handleWarrantyUpload} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload Warranty Slip'}
                </Button>
              )}
            </div>
          </Card>
        )} */}

        {/* Warranty Info */}
        {booking.warrantySlipUrl && (
          <Card>
            <h2 className="text-xl font-semibold mb-4">Warranty Information</h2>
            <a
              href={booking.warrantySlipUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Warranty Slip
            </a>
          </Card>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Booking</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for rejecting this booking. This will be sent to the admin.</p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              rows="4"
              disabled={actionLoading}
            />
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  actionLoading || !rejectReason.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
              </button>
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason('') }}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add extra service modal */}
      {showAddExtraModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add extra service</h3>
            <p className="text-sm text-gray-600 mb-4">Client will receive a request to confirm. Select service and optional price.</p>
            <div className="space-y-3 mb-4">
              <label className="block text-sm font-medium text-gray-700">Service</label>
              <select
                value={selectedExtraServiceId}
                onChange={(e) => setSelectedExtraServiceId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select service</option>
                {servicesList.map((s) => (
                  <option key={s._id || s.id} value={s._id || s.id}>
                    {s.title} {s.basePrice != null ? `(₹${s.basePrice})` : ''}
                  </option>
                ))}
              </select>
              <label className="block text-sm font-medium text-gray-700">Price (₹) — optional, uses service default if empty</label>
              <input
                type="number"
                min="0"
                value={extraPrice}
                onChange={(e) => setExtraPrice(e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleAddExtraService} loading={addingExtra} disabled={!selectedExtraServiceId}>
                Add
              </Button>
              <Button variant="secondary" onClick={() => setShowAddExtraModal(false)} disabled={addingExtra}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Cancel Booking</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for cancelling this booking. This will be sent to the admin and client.</p>
            
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
              rows="4"
              disabled={actionLoading}
            />
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCancel}
                disabled={actionLoading || !cancelReason.trim()}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  actionLoading || !cancelReason.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                {actionLoading ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
              <button
                onClick={() => { setShowCancelModal(false); setCancelReason('') }}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
