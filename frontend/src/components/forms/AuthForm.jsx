import React, { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'

/**
 * AuthForm
 * props:
 * - mode: 'login' | 'register'
 * - onSuccess(user)
 * - defaultRole: 'client' | 'provider' (default: 'client')
 * - showRoleSelector: boolean (default: false) - whether to show role dropdown
 */
export default function AuthForm({ mode = 'login', onSuccess = () => {}, defaultRole = 'client', showRoleSelector = false }) {
  const { login: contextLogin, register: contextRegister } = useAuthContext()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: defaultRole
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function validate() {
    if (!form.email) return 'Email is required'
    if (!form.password || form.password.length < 6) return 'Password must be at least 6 characters'
    if (mode === 'register' && !form.name) return 'Name is required for registration'
    return null
  }

  async function handleSubmit(e) {
    e?.preventDefault()
    setError(null)
    const v = validate()
    if (v) { setError(v); return }
    setLoading(true)
    try {
      let user;
      if (mode === 'login') {
        user = await contextLogin(form.email, form.password)
      } else {
        user = await contextRegister({ name: form.name, email: form.email, password: form.password, role: form.role })
      }
      // Pass user data to success handler
      onSuccess(user)
    } catch (err) {
      console.error('Auth error:', err)
      setError(err.message || err.response?.data?.message || 'Server error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl sm:rounded-2xl shadow p-4 sm:p-6 space-y-3 sm:space-y-4 max-w-md mx-auto">
      <h3 className="text-lg sm:text-xl font-semibold">{mode === 'login' ? 'Sign in to your account' : 'Create a new account'}</h3>

      {mode === 'register' && (
        <Input label="Full name" value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="e.g. Priya Sharma" />
      )}

      <Input label="Email" value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="you@example.com" type="email" />
      <Input label="Password" value={form.password} onChange={(e) => setField('password', e.target.value)} placeholder="******" type="password" />

      {mode === 'register' && showRoleSelector && (
        <Select
          label="Role"
          value={form.role}
          onChange={(e) => setField('role', e.target.value)}
          options={[
            { value: 'client', label: 'Client' },
            { value: 'provider', label: 'Service Provider' }
          ]}
        />
      )}

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <Button type="submit" loading={loading} variant="primary" className="w-full sm:w-auto">{mode === 'login' ? 'Login' : 'Create account'}</Button>
        
      </div>
    </form>
  )
}
