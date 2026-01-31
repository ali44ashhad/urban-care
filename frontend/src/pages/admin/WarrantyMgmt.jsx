import React, { useEffect, useState } from 'react'
import warrantyService from '../../services/warranty.service'
import adminService from '../../services/admin.service'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function WarrantyMgmt() {
  const [items, setItems] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [processingId, setProcessingId] = useState(null)
  const [selectedAgent, setSelectedAgent] = useState({})

  useEffect(() => {
    loadData()
  }, [filter])

  async function loadData() {
    setLoading(true)
    try {
      const params = filter !== 'all' ? { status: filter } : {}
      const [warRes, agentsRes] = await Promise.all([
        adminService.listWarrantyClaims(params),
        adminService.getServiceAgents()
      ])
      let warrantyData = warRes.data?.items || warRes.data || []
      if (!Array.isArray(warrantyData)) {
        warrantyData = []
      }
      setItems(warrantyData)
      setAgents(agentsRes.data || [])
    } catch (err) { 
      console.warn(err)
      setItems([])
    } finally { 
      setLoading(false) 
    }
  }

  async function handleAction(warrantyId, action, newStatus = null) {
    const agentId = action === 'assign' ? selectedAgent[warrantyId] : null
    
    if (action === 'assign' && !agentId) {
      alert('Please select an agent')
      return
    }

    const confirmMsg = {
      assign: 'Assign this agent to handle the warranty claim?',
      reject: 'Reject this warranty claim?',
      resolve: 'Mark this warranty claim as resolved?'
    }[action]

    if (!confirm(confirmMsg)) return

    setProcessingId(warrantyId)
    try {
      if (action === 'assign') {
        // Use assignAgent method which sets status='assigned'
        await warrantyService.assignAgent(warrantyId, agentId)
      } else {
        // For reject/resolve, update status directly
        const status = action === 'reject' ? 'rejected' : newStatus || 'resolved'
        await warrantyService.adminUpdate(warrantyId, { status })
      }
      
      window.dispatchEvent(new CustomEvent('app:toast', { 
        detail: { 
          message: `Warranty claim ${action}ed successfully`, 
          type: 'success' 
        } 
      }))
      loadData()
    } catch (err) {
      console.error(err)
      alert(`Failed to ${action} warranty`)
    } finally {
      setProcessingId(null)
    }
  }

  async function handleApprove(w) {
    await handleAction(w._id || w.id, 'resolve')
  }

  async function handleReject(w) {
    await handleAction(w._id || w.id, 'reject')
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Warranty Claims Management</h1>
        <p className="text-gray-600 mt-1">Review and manage customer warranty requests</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-3 flex-wrap">
        {['all', 'pending', 'assigned', 'in_progress', 'resolved', 'rejected'].map(status => (
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

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No warranty claims found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(warranty => {
            const service = warranty.bookingId?.serviceId
            const provider = warranty.bookingId?.providerId
            const serviceImage = service?.images?.length > 0 
              ? service.images[0] 
              : service?.image || null
            
            return (
            <div
              key={warranty._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Header with Service Image or Icon */}
              <div className="h-32 bg-gradient-to-br from-orange-100 to-red-100 relative flex items-center justify-center">
                {serviceImage ? (
                  <img 
                    src={serviceImage} 
                    alt={service?.title || 'Service'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-16 h-16 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )}
                {/* Status Badge */}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${
                  warranty.status === 'resolved' ? 'bg-green-500 text-white' :
                  warranty.status === 'rejected' ? 'bg-red-500 text-white' :
                  warranty.status === 'in_progress' ? 'bg-blue-500 text-white' :
                  warranty.status === 'assigned' ? 'bg-purple-500 text-white' :
                  'bg-yellow-500 text-white'
                }`}>
                  {warranty.status}
                </div>
              </div>

              {/* Warranty Details */}
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {service?.title || 'Service'}
                  </h3>
                  <div className="text-sm text-gray-500 mb-3 space-y-1">
                    <div>Booking #{(warranty.bookingId?._id || warranty.bookingId?.id || '').toString().slice(-8)}</div>
                    <div>Claim #{(warranty._id || warranty.id || '').toString().slice(-6)}</div>
                  </div>
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="font-semibold text-gray-700">Customer:</span>
                      <div className="text-gray-600">{warranty.clientId?.name}</div>
                      <div className="text-xs text-gray-500">{warranty.clientId?.email}</div>
                    </div>
                    {provider && (
                      <div>
                        <span className="font-semibold text-gray-700">Original Provider:</span>
                        <div className="text-gray-600">{provider.name}</div>
                        <div className="text-xs text-gray-500">{provider.email}</div>
                      </div>
                    )}
                    <div>
                      <span className="font-semibold text-gray-700">Issue:</span>
                      <div className="text-gray-600 text-xs bg-gray-50 p-2 rounded mt-1 line-clamp-3">
                        {warranty.issueDetails}
                      </div>
                    </div>
                    {(warranty.attachmentUrls?.length > 0) && (
                      <div>
                        <span className="font-semibold text-gray-700">Attachments:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {warranty.attachmentUrls.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                            >
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              View attachment {idx + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {warranty.assignedAgentId && (
                      <div>
                        <span className="font-semibold text-gray-700">Assigned Agent:</span>
                        <div className="text-gray-600 text-xs">{warranty.assignedAgentId?.name}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {warranty.status === 'pending' ? (
                  <div className="space-y-2">
                    <select
                      value={selectedAgent[warranty._id] || ''}
                      onChange={(e) => setSelectedAgent({...selectedAgent, [warranty._id]: e.target.value})}
                      className="w-full rounded border px-3 py-2 text-sm"
                    >
                      <option value="">Select Agent...</option>
                      {agents.map(agent => (
                        <option key={agent._id} value={agent._id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(warranty._id, 'assign')}
                        disabled={processingId === warranty._id}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => handleReject(warranty)}
                        disabled={processingId === warranty._id}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ) : ['assigned', 'in_progress'].includes(warranty.status) ? (
                  <button
                    onClick={() => handleApprove(warranty)}
                    disabled={processingId === warranty._id}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    Resolve Claim
                  </button>
                ) : (
                  <div className="text-center text-sm text-gray-500 py-2">
                    {warranty.status === 'resolved' ? 'Claim Resolved' : 'Claim Closed'}
                  </div>
                )}
              </div>
            </div>
          )}
          )}
        </div>
      )}
    </div>
  )
}
