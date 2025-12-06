import React, { useEffect, useState } from 'react'
import adminService from '../../services/admin.service'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function UsersMgmt() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, client, provider
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadUsers()
  }, [filter])

  async function loadUsers() {
    setLoading(true)
    try {
      const params = filter !== 'all' ? { role: filter } : {}
      const res = await adminService.listUsers(params)
      setUsers(res.data?.items || res.data || [])
    } catch (err) {
      console.warn('Failed to load users:', err)
      window.dispatchEvent(new CustomEvent('app:toast', { 
        detail: { message: 'Failed to load users', type: 'error' } 
      }))
    } finally {
      setLoading(false)
    }
  }

  async function toggleStatus(userId, currentStatus) {
    const newStatus = !currentStatus
    try {
      await adminService.toggleUserStatus(userId, newStatus)
      window.dispatchEvent(new CustomEvent('app:toast', { 
        detail: { 
          message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`, 
          type: 'success' 
        } 
      }))
      loadUsers()
    } catch (err) {
      console.warn('Failed to toggle status:', err)
      window.dispatchEvent(new CustomEvent('app:toast', { 
        detail: { message: 'Operation failed', type: 'error' } 
      }))
    }
  }

  const filteredUsers = users.filter(u => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      u.name?.toLowerCase().includes(searchLower) ||
      u.email?.toLowerCase().includes(searchLower) ||
      u.phone?.includes(search) ||
      u.companyName?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage clients and service providers</p>
        </div>
        <Button onClick={loadUsers} variant="secondary">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => setFilter('client')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'client'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Clients
            </button>
            <button
              onClick={() => setFilter('provider')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'provider'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Providers
            </button>
          </div>
          <div className="flex-1">
            <Input
              placeholder="Search by name, email, phone, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Users Grid */}
      {loading ? (
      <LoadingSpinner />
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No users found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(user => (
            <div
              key={user._id || user.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* User Header */}
              <div className={`h-32 relative flex items-center justify-center ${
                user.role === 'provider' 
                  ? 'bg-gradient-to-br from-green-100 to-emerald-100' 
                  : 'bg-gradient-to-br from-blue-100 to-cyan-100'
              }`}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover border-4 border-white" />
                ) : (
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 border-white ${
                    user.role === 'provider' ? 'bg-green-500' : 'bg-blue-500'
                  }`}>
                    <span className="text-3xl font-bold text-white">
                      {(user.name || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {/* Role Badge */}
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold ${
                  user.role === 'provider'
                    ? 'bg-green-500 text-white'
                    : user.role === 'client'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-500 text-white'
                }`}>
                  {user.role}
                </div>
                {/* Status Badge */}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${
                  user.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              {/* User Details */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-1">
                  {user.name || 'Unnamed User'}
                </h3>
                
                <div className="text-sm space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.companyName && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="truncate">{user.companyName}</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => toggleStatus(user._id || user.id, user.isActive)}
                  className={`w-full px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                    user.isActive
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {!loading && (
        <div className="mt-6 text-center text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      )}
    </div>
  )
}
