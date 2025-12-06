import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import api from '../../services/apiClient'

/**
 * ResetPassword page
 * - Expects a token in query param: ?token=abc
 * - POST /auth/reset-password  { token, password }
 */

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (!token) setError('Invalid or missing token. Use the link from your email.')
  }, [token])

  async function handleSubmit(e) {
    e?.preventDefault()
    setError(null)
    setMessage(null)
    if (!token) return setError('Missing token.')
    if (!password || password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== password2) return setError('Passwords do not match.')
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      setMessage('Password reset successful — you can now log in.')
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Password reset successful', type: 'success' } }))
      setTimeout(() => navigate('/auth/login'), 1400)
    } catch (err) {
      setError(err.message || 'Unable to reset password. The token may be invalid or expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[64vh] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="text-xl font-semibold mb-2">Reset password</h3>
          <p className="text-gray-600 text-sm mb-4">Choose a new secure password for your account.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Input label="Confirm password" type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} />

            {error && <div className="text-sm text-red-600">{error}</div>}
            {message && <div className="text-sm text-green-600">{message}</div>}

            <div className="flex items-center gap-3">
              <Button type="submit" loading={loading}>Set new password</Button>
              <Link to="/auth/login" className="text-sm text-gray-600 hover:underline">Back to login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
