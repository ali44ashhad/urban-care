import React, { useEffect, useState } from 'react'
import adminService from '../../services/admin.service'
import bookingsService from '../../services/bookings.service'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'

export default function PendingRequests() {
  const [requests, setRequests] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [assigningId, setAssigningId] = useState(null)
  const [selectedAgent, setSelectedAgent] = useState({})

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [reqRes, agentsRes] = await Promise.all([
        adminService.getPendingRequests(),
        adminService.getServiceAgents()
      ])
      setRequests(reqRes.data?.items || [])
      setAgents(agentsRes.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAssignAgent(bookingId) {
    const agentId = selectedAgent[bookingId]
    if (!agentId) {
      alert('Please select an agent')
      return
    }

    setAssigningId(bookingId)
    try {
      await bookingsService.assignProvider(bookingId, agentId)
      window.dispatchEvent(new CustomEvent('app:toast', { 
        detail: { message: 'Agent assigned successfully', type: 'success' } 
      }))
      loadData()
    } catch (err) {
      console.error(err)
      alert('Failed to assign agent')
    } finally {
      setAssigningId(null)
    }
  }

  if (loading) return <div className="p-6">Loading pending requests...</div>

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pending Booking Requests</h1>
        <p className="text-gray-600 mt-1">Review and assign service agents to customer bookings</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="text-gray-400 mb-2">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-600">No pending booking requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(booking => (
            <div key={booking._id} className="bg-white rounded-xl shadow p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Booking Info */}
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{booking.serviceId?.title}</h3>
                      <p className="text-sm text-gray-500">ID: {booking._id}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">₹{booking.price}</div>
                      <div className="text-xs text-gray-500">{booking.paymentMethod || 'POD'}</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span><strong>Customer:</strong> {booking.clientId?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{booking.clientId?.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{booking.clientId?.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Slot & Address */}
                <div>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span><strong>Date:</strong> {new Date(booking.slot?.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong>Time:</strong> {booking.slot?.startTime} - {booking.slot?.endTime}</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-700">
                      <svg className="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <div>
                        <strong>Location:</strong><br />
                        {booking.address?.line1}, {booking.address?.city}, {booking.address?.state} {booking.address?.pincode}
                      </div>
                    </div>
                  </div>

                  {/* Agent Assignment */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign Service Agent
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={selectedAgent[booking._id] || ''}
                        onChange={(e) => setSelectedAgent({...selectedAgent, [booking._id]: e.target.value})}
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select agent...</option>
                        {agents.map(agent => (
                          <option key={agent._id} value={agent._id}>
                            {agent.name} {agent.companyName ? `(${agent.companyName})` : ''}
                          </option>
                        ))}
                      </select>
                      <Button
                        onClick={() => handleAssignAgent(booking._id)}
                        loading={assigningId === booking._id}
                        disabled={!selectedAgent[booking._id]}
                        size="sm"
                      >
                        Assign
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
