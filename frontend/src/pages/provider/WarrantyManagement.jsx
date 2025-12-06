import React, { useEffect, useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import warrantyService from '../../services/warranty.service'

export default function WarrantyManagement() {
  const { user } = useAuthContext()
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadClaims()
  }, [filter])

  async function loadClaims() {
    setLoading(true)
    try {
      const params = filter !== 'all' ? { status: filter } : {}
      const response = await warrantyService.listForAgent(params)
      let claimsData = response.data || []
      if (!Array.isArray(claimsData)) {
        claimsData = claimsData.items || claimsData.warranties || []
      }
      setClaims(claimsData)
    } catch (err) {
      console.error('Failed to load warranty claims:', err)
      setClaims([])
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateStatus(claimId, newStatus) {
    try {
      await warrantyService.updateStatus(claimId, newStatus)
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: `Claim ${newStatus}`, type: 'success' } }))
      loadClaims()
    } catch (err) {
      alert('Failed to update claim status')
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Warranty Claims</h1>
        <p className="text-gray-600 mt-1">Manage assigned warranty claims</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-3 flex-wrap">
        {['all', 'assigned', 'in_progress', 'resolved'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading claims...</div>
      ) : claims.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No warranty claims assigned to you</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {claims.map(claim => {
            const service = claim.bookingId?.serviceId
            const serviceImage = service?.images?.length > 0 
              ? service.images[0] 
              : service?.image || null
            
            return (
            <div key={claim._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Header with Service Image */}
              <div className="h-24 bg-gradient-to-br from-orange-100 to-red-100 relative flex items-center justify-center">
                {serviceImage ? (
                  <img 
                    src={serviceImage} 
                    alt={service?.title || 'Service'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${
                  claim.status === 'resolved' ? 'bg-green-500 text-white' :
                  claim.status === 'in_progress' ? 'bg-blue-500 text-white' :
                  'bg-purple-500 text-white'
                }`}>
                  {claim.status}
                </div>
              </div>

              {/* Details */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {service?.title || 'Service'}
                </h3>
                <div className="text-sm text-gray-500 mb-3">
                  Claim #{(claim._id || '').slice(-6)}
                </div>
                <div className="text-sm space-y-2 mb-3">
                  <div>
                    <span className="font-semibold text-gray-700">Customer:</span>
                    <div className="text-gray-600">{claim.clientId?.name}</div>
                    <div className="text-xs text-gray-500">{claim.clientId?.email}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Issue:</span>
                    <div className="text-gray-600 text-xs bg-gray-50 p-2 rounded mt-1 line-clamp-3">
                      {claim.issueDetails}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {claim.status === 'assigned' && (
                  <button
                    onClick={() => handleUpdateStatus(claim._id, 'in_progress')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium mb-2"
                  >
                    Start Work
                  </button>
                )}
                {claim.status === 'in_progress' && (
                  <button
                    onClick={() => handleUpdateStatus(claim._id, 'resolved')}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
