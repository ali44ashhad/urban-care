import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import authService from '../../services/auth.service'

export default function ProviderProfile() {
  const navigate = useNavigate()
  const { user, setUser, deleteAccount } = useAuthContext()
  const [editing, setEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDangerZone, setShowDangerZone] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    bio: '',
    avatar: ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        companyName: user.companyName || '',
        bio: user.bio || '',
        avatar: user.avatar || ''
      })
    }
  }, [user])

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Please select an image file', type: 'error' } }))
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Image size should be less than 5MB', type: 'error' } }))
      return
    }

    setUploading(true)
    try {
      const res = await authService.uploadAvatar(file)
      setFormData(prev => ({ ...prev, avatar: res.data.avatar }))
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Image uploaded successfully', type: 'success' } }))
    } catch (err) {
      console.error('Upload error:', err)
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: err.response?.data?.message || 'Upload failed', type: 'error' } }))
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    try {
      const response = await authService.updateProfile(formData)
      const updatedUser = { ...user, ...response.data }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setEditing(false)
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Profile updated successfully', type: 'success' } }))
    } catch (err) {
      console.error('Update error:', err)
      const errorMsg = err.response?.data?.message || 'Failed to update profile'
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: errorMsg, type: 'error' } }))
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      await deleteAccount()
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Account deleted. You can sign up again with the same phone or email.', type: 'success' } }))
      navigate('/auth/register', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete account'
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: msg, type: 'error' } }))
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your provider profile</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-indigo-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                (user?.name || 'P').charAt(0).toUpperCase()
              )}
            </div>
            {/* Upload Button Overlay */}
            <label 
              htmlFor="provider-avatar-upload" 
              className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700 shadow-lg transition"
            >
              {uploading ? (
                <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
              <input
                id="provider-avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.name || 'Provider'}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-xs text-gray-500 mt-1">Click camera icon to upload photo</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                Active Provider
              </span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!editing}
              className={!editing ? 'bg-gray-50' : ''}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!editing}
              className={!editing ? 'bg-gray-50' : ''}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!editing}
              className={!editing ? 'bg-gray-50' : ''}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <Input
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              disabled={!editing}
              className={!editing ? 'bg-gray-50' : ''}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              disabled={!editing}
              rows="4"
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                !editing ? 'bg-gray-50' : ''
              }`}
            />
          </div>

          {/* Stats */}
          {/* Performance Stats */}
          <div className="pt-6 border-t">
            <h3 className="font-semibold text-lg mb-4">Performance Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {user?.profile?.completedJobs || 0}
                </div>
                <div className="text-sm text-gray-600">Completed Jobs</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {user?.profile?.ratingAvg || 0}★
                </div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {user?.profile?.reviewCount || 0}
                </div>
                <div className="text-sm text-gray-600">Reviews</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {user?.profile?.activeBookings || 0}
                </div>
                <div className="text-sm text-gray-600">Active Bookings</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6">
            {editing ? (
              <>
                <Button onClick={handleSave}>Save Changes</Button>
                <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)}>Edit Profile</Button>
            )}
          </div>

          {/* Delete account - hidden by default, expand to show */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            {!showDangerZone ? (
              <button
                type="button"
                onClick={() => setShowDangerZone(true)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Account deletion options…
              </button>
            ) : (
              <div className="border border-red-100 rounded-lg p-4 bg-red-50/50">
                <h3 className="text-sm font-semibold text-red-800 mb-1">Danger zone</h3>
                <p className="text-sm text-gray-600 mb-3">Permanently delete your provider account. You can sign up again with the same phone or email to create a new account.</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="border border-red-300 text-red-700 hover:bg-red-50 text-sm"
                  >
                    Delete my account
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowDangerZone(false)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Hide
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => !deleting && setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900">Delete account?</h3>
            <p className="mt-2 text-sm text-gray-600">
              This will permanently delete your provider account and cannot be undone. Your past bookings will be kept but no longer linked to you. You can sign up again with the same phone or email to create a new account.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button onClick={handleDeleteAccount} loading={deleting} className="bg-red-600 hover:bg-red-700">
                Yes, delete my account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
