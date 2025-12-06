import React, { useEffect, useState } from 'react'
import adminService from '../../services/admin.service'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import AuthForm from '../../components/forms/AuthForm'

export default function ProvidersMgmt() {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showOnboardModal, setShowOnboardModal] = useState(false)

  useEffect(() => {
    loadProviders()
  }, [filter])

  async function loadProviders() {
    setLoading(true)
    try {
      const params = { role: 'provider' }
      if (filter !== 'all') {
        params.isActive = filter === 'active'
      }
      const response = await adminService.listUsers(params)
      let providerData = response.data || []
      if (!Array.isArray(providerData)) {
        providerData = providerData.items || providerData.users || providerData.data || []
      }
      // Filter only providers and apply isActive filter on frontend as well
      providerData = providerData.filter(u => {
        if (u.role !== 'provider') return false
        if (filter === 'active') return u.isActive === true
        if (filter === 'inactive') return u.isActive === false
        return true
      })
      setProviders(providerData)
    } catch (err) {
      console.error('Failed to load providers:', err)
      setProviders([])
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleStatus(provider) {
    try {
      const newStatus = !provider.isActive
      await adminService.toggleUserStatus(provider._id || provider.id, newStatus)
      window.dispatchEvent(new CustomEvent('app:toast', { 
        detail: { 
          message: `Provider ${newStatus ? 'activated' : 'deactivated'} successfully`, 
          type: 'success' 
        } 
      }))
      // Update the provider in the list immediately
      setProviders(prev => prev.map(p => 
        (p._id || p.id) === (provider._id || provider.id) 
          ? { ...p, isActive: newStatus } 
          : p
      ))
    } catch (err) {
      console.error('Toggle status error:', err)
      const errorMsg = err.response?.data?.message || 'Failed to update provider status'
      window.dispatchEvent(new CustomEvent('app:toast', { 
        detail: { 
          message: errorMsg, 
          type: 'error' 
        } 
      }))
    }
  }

  async function handleProviderOnboarded(user) {
    setShowOnboardModal(false)
    window.dispatchEvent(new CustomEvent('app:toast', { 
      detail: { 
        message: 'Provider onboarded successfully', 
        type: 'success' 
      } 
    }))
    // Reload providers list
    loadProviders()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Providers Management</h1>
          <p className="text-gray-600 mt-1">Manage all service providers</p>
        </div>
        <Button onClick={() => setShowOnboardModal(true)}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Onboard Provider
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-3 flex-wrap">
        {['all', 'active', 'inactive'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
      <LoadingSpinner />
      ) : providers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No providers found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map(provider => (
            <div
              key={provider._id || provider.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Provider Avatar/Image */}
              <div className="h-48 bg-gradient-to-br from-indigo-100 to-blue-100 relative flex items-center justify-center">
                {provider.avatar ? (
                  <img
                    src={provider.avatar}
                    alt={provider.name || provider.companyName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-indigo-500 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {(provider.name || provider.companyName || 'P').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {/* Status Badge */}
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
                  provider.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                }`}>
                  {provider.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              {/* Provider Details */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {provider.name || 'Unnamed Provider'}
                  </h3>
                  {provider.companyName && (
                    <p className="text-sm text-indigo-600 font-medium mb-2">{provider.companyName}</p>
                  )}
                  {provider.bio && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{provider.bio}</p>
                  )}
                  <div className="space-y-1">
                    {provider.email && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {provider.email}
                      </p>
                    )}
                    {provider.phone && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {provider.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4 text-sm">
                  <div className="flex items-center gap-4">
                    {provider.profile?.ratingAvg > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-semibold">{provider.profile.ratingAvg.toFixed(1)}</span>
                      </div>
                    )}
                    {provider.profile?.completedJobs > 0 && (
                      <span className="text-gray-600">{provider.profile.completedJobs} jobs</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleStatus(provider)}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                      provider.isActive 
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {provider.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Onboard Provider Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">Onboard New Provider</h2>
              <button
                onClick={() => setShowOnboardModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Create a new provider account. The provider will receive their login credentials via email.
              </p>
              <AuthForm 
                mode="register" 
                defaultRole="provider" 
                showRoleSelector={false}
                onSuccess={handleProviderOnboarded}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
