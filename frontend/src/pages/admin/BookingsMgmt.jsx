import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import bookingsService from '../../services/bookings.service'
import adminService from '../../services/admin.service'
import Input from '../../components/ui/Input'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function BookingsMgmt() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [providers, setProviders] = useState([])
  const [assigningProvider, setAssigningProvider] = useState(null)
  const [selectedProvider, setSelectedProvider] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const bRes = await bookingsService.list({})
        let bookingData = bRes.data || []
        if (!Array.isArray(bookingData)) {
          bookingData = bookingData.items || bookingData.bookings || bookingData.data || []
        }
        if (!Array.isArray(bookingData)) {
          bookingData = []
        }
        if (mounted) {
          setBookings(bookingData)
        }
        
        // Load providers for assignment
        const pRes = await adminService.listUsers({ role: 'provider', isActive: true })
        let providerData = pRes.data || []
        if (!Array.isArray(providerData)) {
          providerData = providerData.items || providerData.users || providerData.data || []
        }
        if (mounted) {
          setProviders(providerData.filter(u => u.role === 'provider' && u.isActive))
        }
      } catch (err) { console.warn(err) } finally { if (mounted) setLoading(false) }
    }
    load()
    return () => (mounted = false)
  }, [])

  async function handleCancel(b) {
    if (!confirm('Cancel booking?')) return
    try {
      await bookingsService.cancel(b._id || b.id, 'Cancelled by admin')
      setBookings(prev => prev.map(x => x._id === b._id ? { ...x, status: 'cancelled' } : x))
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Booking cancelled', type: 'info' } }))
    } catch (err) { alert('Operation failed') }
  }

  async function handleAssignProvider(booking, providerId) {
    if (!providerId) {
      alert('Please select a provider')
      return
    }
    
    try {
      await bookingsService.assignProvider(booking._id || booking.id, providerId)
      setBookings(prev => prev.map(b => 
        (b._id || b.id) === (booking._id || booking.id) 
          ? { ...b, providerId, provider: providers.find(p => (p._id || p.id) === providerId), status: 'accepted' }
          : b
      ))
      setAssigningProvider(null)
      setSelectedProvider(null)
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Provider assigned successfully', type: 'success' } }))
    } catch (err) {
      console.error('Assign provider error:', err)
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Failed to assign provider', type: 'error' } }))
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

  function cancelAssignment() {
    setAssigningProvider(null)
    setSelectedProvider(null)
  }

  // Filter bookings
  const filteredBookings = bookings.filter(b => {
    // Status filter
    if (statusFilter !== 'all' && b.status !== statusFilter) return false
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      const serviceName = b.service?.title || b.serviceId?.title || ''
      const clientName = b.client?.name || b.clientId?.name || ''
      const providerName = b.provider?.name || b.providerId?.name || ''
      const bookingId = (b._id || b.id || '').toString().toLowerCase()
      const bookingIdShort6 = bookingId.slice(-6) // Last 6 characters like "23e61b"
      const bookingIdShort8 = bookingId.slice(-8) // Last 8 characters like user booking pages
      
      return (
        serviceName.toLowerCase().includes(searchLower) ||
        clientName.toLowerCase().includes(searchLower) ||
        providerName.toLowerCase().includes(searchLower) ||
        bookingId.includes(searchLower) ||
        bookingIdShort6.includes(searchLower) ||
        bookingIdShort8.includes(searchLower) ||
        `claim #${bookingIdShort6}`.includes(searchLower) ||
        `booking #${bookingIdShort6}`.includes(searchLower) ||
        `booking #${bookingIdShort8}`.includes(searchLower) ||
        `#${bookingIdShort6}`.includes(searchLower) ||
        `#${bookingIdShort8}`.includes(searchLower)
      )
    }
    
    return true
  })

  // Get status counts
  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    accepted: bookings.filter(b => b.status === 'accepted').length,
    in_progress: bookings.filter(b => b.status === 'in_progress').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    rejected: bookings.filter(b => b.status === 'rejected').length
  }

  function getStatusBadge(status) {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-purple-100 text-purple-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      rejected: 'bg-gray-100 text-gray-700'
    }
    return badges[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Bookings Management</h2>
          <p className="text-sm text-gray-600 mt-1">View and manage all bookings</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="space-y-4">
          {/* Search */}
          <Input
            placeholder="Search by service, client, provider, or booking ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({statusCounts.all})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
              }`}
            >
              Pending ({statusCounts.pending})
            </button>
            <button
              onClick={() => setStatusFilter('accepted')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === 'accepted'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              Accepted ({statusCounts.accepted})
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === 'in_progress'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              In Progress ({statusCounts.in_progress})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              Completed ({statusCounts.completed})
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === 'cancelled'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              Cancelled ({statusCounts.cancelled})
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Grid */}
      {loading ? (
       <LoadingSpinner />
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No bookings found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookings.map(b => (
            <div
              key={b._id || b.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Service Image/Icon */}
              <div className="h-32 bg-gradient-to-br from-purple-100 to-pink-100 relative flex items-center justify-center">
                {(b.service?.image || b.serviceId?.image || b.service?.images?.[0] || b.serviceId?.images?.[0]) ? (
                  <img
                    src={b.service?.image || b.serviceId?.image || b.service?.images[0] || b.serviceId?.images[0]}
                    alt={b.service?.title || b.serviceId?.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                )}
                {/* Status Badge */}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(b.status)}`}>
                  {b.status}
                </div>
              </div>

              {/* Booking Details */}
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                    {b.service?.title || b.serviceId?.title || 'Service'}
                  </h3>
                  <div className="text-xs text-gray-500 mb-2 font-mono">
                    Booking #{(b._id || b.id || '').toString().slice(-8)}
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                     <span className="truncate">
  {formatDate(b.slot?.date)}
</span>

                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="truncate">{b.client?.name || b.clientId?.name || 'N/A'}</span>
                    </div>
                    {(b.client?.phone || b.clientId?.phone) && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="truncate">{b.client?.phone || b.clientId?.phone}</span>
                      </div>
                    )}
                    {(b.address?.line1 || b.address?.city) && (
                      <div className="flex items-start gap-2 text-gray-600">
                        <svg className="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-xs line-clamp-2">
                          {b.address?.line1}{b.address?.city && `, ${b.address.city}`}{b.address?.state && `, ${b.address.state}`}{b.address?.pincode && ` - ${b.address.pincode}`}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">{b.provider?.name || b.providerId?.name || 'Unassigned'}</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-green-600 text-lg mt-2">
                      ₹{b.price || 0}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {/* Assign Provider */}
                  {b.status === 'pending' && !b.providerId && (
                    <div>
                      {assigningProvider === (b._id || b.id) ? (
                        <div className="space-y-2">
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={selectedProvider || ''}
                            onChange={(e) => setSelectedProvider(e.target.value)}
                          >
                            <option value="" disabled>Select Provider</option>
                            {providers.map(p => (
                              <option key={p._id || p.id} value={p._id || p.id}>
                                {p.name} {p.companyName && `(${p.companyName})`}
                              </option>
                            ))}
                          </select>
                          
                          {/* Confirm and Cancel Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAssignProvider(b, selectedProvider)}
                              disabled={!selectedProvider}
                              className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                                selectedProvider
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              ✓ Confirm Assign
                            </button>
                            <button
                              onClick={cancelAssignment}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                          
                          {/* Selected Provider Info */}
                          {selectedProvider && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-xs text-blue-700 mb-1 font-semibold">Selected Provider:</p>
                              <p className="text-sm text-blue-900 font-medium">
                                {providers.find(p => (p._id || p.id) === selectedProvider)?.name}
                                {providers.find(p => (p._id || p.id) === selectedProvider)?.companyName && 
                                  ` (${providers.find(p => (p._id || p.id) === selectedProvider)?.companyName})`
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssigningProvider(b._id || b.id)}
                          className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Assign Provider
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* Cancel Button */}
                  {!['cancelled', 'completed', 'warranty_claimed'].includes(b.status) && (
                    <button
                      onClick={() => handleCancel(b)}
                      className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {!loading && (
        <div className="mt-6 text-center text-sm text-gray-600">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </div>
      )}
    </div>
  )
}
