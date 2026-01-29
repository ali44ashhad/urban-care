import React, { useState, useEffect } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import authService from '../../services/auth.service'

export default function AdminProfile() {
  const { user, setUser } = useAuthContext()
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || ''
      })
    }
  }, [user])

  // Fetch fresh profile data on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await authService.getProfile()
        if (res.data) {
          setUser(res.data)
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err)
      }
    }
    fetchProfile()
  }, [])

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
      // In a real app, you'd call an API to update the profile
      // await userService.updateProfile(user._id, formData)
      setUser({ ...user, ...formData })
      setEditing(false)
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Profile updated', type: 'success' } }))
    } catch (err) {
      alert('Failed to update profile')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
        <p className="text-gray-600 mt-1">Manage your administrator profile</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                (user?.name || 'A').charAt(0).toUpperCase()
              )}
            </div>
            {/* Upload Button Overlay */}
            <label 
              htmlFor="admin-avatar-upload" 
              className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 shadow-lg transition"
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
                id="admin-avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.name || 'Administrator'}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-xs text-gray-500 mt-1">Click camera icon to upload photo</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                Administrator
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                Active
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

          {/* Admin Info */}
          <div className="pt-6 border-t">
            <h3 className="font-semibold text-lg mb-4">Administrator Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Account Type</div>
                <div className="text-lg font-semibold text-gray-900">Super Admin</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Access Level</div>
                <div className="text-lg font-semibold text-gray-900">Full Access</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Account Status</div>
                <div className="text-lg font-semibold text-green-600">Active</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Member Since</div>
                <div className="text-lg font-semibold text-gray-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </div>
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
        </div>
      </div>
    </div>
  )
}
