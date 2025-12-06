import React from 'react'
import RatingStars from '../ui/RatingStars'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'

/**
 * reviews: array { _id, rating, comment, title, clientId, bookingId, isApproved }
 * actions: { onApprove, onRemove }
 */
export default function ReviewList({ reviews = [], actions = {} }) {
  if (!reviews.length) return <div className="text-gray-600">No reviews</div>

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-4">
      {reviews.map(r => {
        const service = r.bookingId?.serviceId
        const client = r.clientId
        
        return (
          <div key={r._id || r.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="flex items-start gap-4">
              {/* Service Image */}
              {service && (
                <div className="flex-shrink-0">
                  {service.image || service.images?.[0] ? (
                    <img
                      src={service.image || service.images[0]}
                      alt={service.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                      {service.title?.[0] || 'S'}
                    </div>
                  )}
                </div>
              )}

              {/* Review Content */}
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={client?.name || r.userName || 'Customer'} size="sm" />
                    <div>
                      <div className="font-semibold text-gray-900">{client?.name || r.userName || 'Customer'}</div>
                      <div className="text-xs text-gray-500">{formatDate(r.createdAt)}</div>
                    </div>
                  </div>
                  <RatingStars rating={r.rating} size="sm" />
                </div>

                {/* Service Info */}
                {service && (
                  <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">{service.title}</span>
                    {service.category && (
                      <span className="text-gray-400">• {service.category}</span>
                    )}
                  </div>
                )}

                {/* Review Title */}
                {r.title && (
                  <h4 className="font-semibold text-gray-900 mb-1">{r.title}</h4>
                )}

                {/* Review Comment */}
                <p className="text-gray-700 leading-relaxed">{r.comment || r.text || 'No comment provided'}</p>

                {/* Approval Status */}
                {r.isApproved && (
                  <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Approved
                  </div>
                )}

                {/* Action Buttons */}
                {(actions.onApprove || actions.onRemove) && (
                  <div className="mt-4 flex gap-2">
                    {actions.onApprove && !r.isApproved && (
                      <Button size="sm" onClick={() => actions.onApprove(r)}>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Approve
                      </Button>
                    )}
                    {actions.onRemove && (
                      <Button variant="ghost" size="sm" onClick={() => actions.onRemove(r)}>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
