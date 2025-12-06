import React, { useEffect, useState } from 'react'
import { useProviderContext } from '../../context/ProviderContext'
import bookingsService from '../../services/bookings.service'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { useNavigate } from 'react-router-dom'

export default function ProviderDashboard() {
  const { provider, assignedBookings, loadAssignedBookings, loadingProvider } = useProviderContext()
  const [recent, setRecent] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    // derive recent accepted / pending bookings
    const rec = (assignedBookings || []).slice(0, 5)
    setRecent(rec)
  }, [assignedBookings])

  useEffect(() => {
    // refresh list on mount
    loadAssignedBookings()
  }, [loadAssignedBookings])

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Welcome, {provider?.name || 'Provider'}</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">{provider?.companyName || provider?.serviceNames?.join(', ')}</p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xs sm:text-sm text-gray-500">Active bookings</div>
              <div className="text-xl sm:text-2xl font-bold">{(assignedBookings || []).filter(b => b.status === 'accepted' || b.status === 'pending').length}</div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-base sm:text-lg">Recent Assignments</h3>
            {recent.length === 0 ? (
              <div className="text-gray-500">No recent bookings assigned to you.</div>
            ) : (
              <div className="space-y-3">
                {recent.map(b => {
                  const service = b.service || b.serviceId
                  const client = b.client || b.clientId
                  const address = b.address || {}
                  const imageUrl = service?.image || service?.images?.[0]

                  return (
                    <div key={b._id || b.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow bg-white">
                      <div className="flex gap-4">
                        {/* Service Image */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-indigo-100">
                          {imageUrl ? (
                            <img src={imageUrl} alt={service?.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-semibold text-base line-clamp-1">{service?.title || 'Service'}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                              b.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              b.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                              b.status === 'in_progress' ? 'bg-purple-100 text-purple-700' :
                              b.status === 'completed' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {b.status}
                            </span>
                          </div>

                          <div className="text-sm space-y-1 mb-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="truncate">{client?.name || 'N/A'}</span>
                              {client?.phone && <span className="text-gray-400">• {client.phone}</span>}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{b.slot?.date} • {b.slot?.label || b.slot?.startTime}</span>
                            </div>
                            {(address.line1 || address.city) && (
                              <div className="flex items-start gap-2 text-gray-600">
                                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="line-clamp-1 text-xs">
                                  {address.line1 && `${address.line1}, `}
                                  {address.city && `${address.city}`}
                                  {address.state && `, ${address.state}`}
                                  {address.pincode && ` - ${address.pincode}`}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="font-bold text-green-600 text-lg">₹{b.price || 0}</span>
                            <Button size="sm" variant="secondary" onClick={() => navigate(`/provider/bookings/${b._id || b.id}`)}>Open</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-base sm:text-lg font-semibold">Performance</h4>
              <div className="text-xs sm:text-sm text-gray-500">Last 30 days</div>
            </div>
            <div className="text-right">
              <div className="text-xl sm:text-2xl font-bold">{(assignedBookings || []).filter(b => b.status === 'completed').length}</div>
              <div className="text-xs sm:text-sm text-gray-500">Completed</div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="text-xs sm:text-sm text-gray-600">Ratings</div>
            <div className="text-base sm:text-lg font-semibold">4.8 ★ (based on reviews)</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
