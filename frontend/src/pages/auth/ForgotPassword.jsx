import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import api from '../../services/apiClient'

/**
 * ForgotPassword page
 * - POST /auth/forgot-password  { email } -> backend sends reset email with token link
 *
 * UI: simple email form with success messaging.
 */
export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  async function handleSubmit(e) {
    e?.preventDefault()
    setError(null)
    setSuccess(null)
    if (!email) return setError('Please enter your email address')
    setLoading(true)
    try {
      // backend expected to accept this route
      await api.post('/auth/forgot-password', { email })
      setSuccess('If an account exists for this email, a password reset link has been sent.')
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Reset link sent (if email exists)', type: 'info' } }))
    } catch (err) {
      setError(err.message || 'Unable to request reset. Try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[64vh] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Forgot Password</h2>
          <p className="text-gray-600 text-sm mb-4">Enter your account email and we’ll send you a link to reset your password.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {error && <div className="text-sm text-red-600">{error}</div>}
            {success && <div className="text-sm text-green-600">{success}</div>}

            <div className="flex items-center gap-3">
              <Button type="submit" loading={loading}>Send reset link</Button>
              <Link to="/auth/login" className="text-sm text-gray-600 hover:underline">Back to login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
