import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAuthContext } from '../../context/AuthContext'
import authService from '../../services/auth.service'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function ClientProfile() {
  const navigate = useNavigate()
  const { user, setUser, deleteAccount } = useAuthContext()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDangerZone, setShowDangerZone] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    avatar: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!user) return
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.bio || '',
      avatar: user.avatar || '',
      addressLine: user.address?.addressLine || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      pincode: user.address?.pincode || ''
    })
  }, [user])

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }

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
      setField('avatar', res.data.avatar)
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Image uploaded successfully', type: 'success' } }))
    } catch (err) {
      console.error('Upload error:', err)
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Upload failed', type: 'error' } }))
    } finally {
      setUploading(false)
    }
  }

  async function save() {
    setLoading(true)
    setMessage(null)
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        bio: form.bio,
        avatar: form.avatar,
        address: {
          addressLine: form.addressLine,
          city: form.city,
          state: form.state,
          pincode: form.pincode
        }
      }
      
      // Update user profile via API
      const res = await authService.updateProfile(payload)
      
      // Update local user state - response.data contains user object directly
      const updatedUser = { ...user, ...res.data }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      // Update form with new data
      setForm({
        name: updatedUser.name || '',
        email: updatedUser.email || '',
        phone: updatedUser.phone || '',
        bio: updatedUser.bio || '',
        avatar: updatedUser.avatar || '',
        addressLine: updatedUser.address?.addressLine || '',
        city: updatedUser.address?.city || '',
        state: updatedUser.address?.state || '',
        pincode: updatedUser.address?.pincode || ''
      })
      
      setMessage('Profile updated successfully')
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Profile saved', type: 'success' } }))
    } catch (err) {
      console.warn(err)
      setMessage('Failed to save profile')
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Save failed', type: 'error' } }))
    } finally {
      setLoading(false)
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

  if (!user) return <LoadingSpinner />

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">My Profile</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage your personal information</p>
          </div>
        </div>

        {/* Avatar Section */}
        <div className="mb-6 flex flex-col sm:flex-row items-center gap-4 pb-6 border-b">
          <div className="relative">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden">
              {form.avatar ? (
                <img src={form.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            {/* Upload Button Overlay */}
            <label 
              htmlFor="avatar-upload" 
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
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          <div className="flex-1 w-full text-center sm:text-left">
            <h3 className="text-lg font-semibold text-gray-800">{form.name || 'User'}</h3>
            <p className="text-sm text-gray-600">{user.role?.toUpperCase()}</p>
            <p className="text-xs text-gray-500 mt-1">{form.email}</p>
            <p className="text-xs text-gray-500 mt-2">Click camera icon to upload new photo</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Full Name" 
              value={form.name} 
              onChange={(e) => setField('name', e.target.value)} 
              placeholder="Enter your full name"
            />
            <Input 
              label="Email" 
              type="email"
              value={form.email} 
              onChange={(e) => setField('email', e.target.value)} 
              placeholder="your@email.com"
            />
            <Input 
              label="Phone Number" 
              value={form.phone} 
              onChange={(e) => setField('phone', e.target.value)} 
              placeholder="+91 XXXXX XXXXX"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setField('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows="3"
              className="w-full rounded-lg sm:rounded-xl border border-gray-200 px-3 sm:px-4 py-2 sm:py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-base font-semibold text-gray-800 mb-3">Address Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Address Line" 
                value={form.addressLine} 
                onChange={(e) => setField('addressLine', e.target.value)} 
                placeholder="Street, Building, Area"
                className="md:col-span-2"
              />
              <Input 
                label="City" 
                value={form.city} 
                onChange={(e) => setField('city', e.target.value)} 
                placeholder="City"
              />
              <Input 
                label="State" 
                value={form.state} 
                onChange={(e) => setField('state', e.target.value)} 
                placeholder="State"
              />
              <Input 
                label="Pincode" 
                value={form.pincode} 
                onChange={(e) => setField('pincode', e.target.value)} 
                placeholder="000000"
              />
            </div>
          </div>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            message.includes('success') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button onClick={save} loading={loading} className="w-full sm:w-auto">
            Save Changes
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
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
              <p className="text-sm text-gray-600 mb-3">Permanently delete your account. You can sign up again with the same phone or email to create a new account.</p>
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
      </Card>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => !deleting && setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900">Delete account?</h3>
            <p className="mt-2 text-sm text-gray-600">
              This will permanently delete your account and cannot be undone. Your past bookings will be kept but no longer linked to you. You can sign up again with the same phone or email to create a new account.
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
