// import React, { useState } from 'react'
// import { useAuthContext } from '../../context/AuthContext'
// import Button from '../ui/Button'
// import Input from '../ui/Input'
// import Select from '../ui/Select'

// /**
//  * AuthForm
//  * props:
//  * - mode: 'login' | 'register'
//  * - onSuccess(user)
//  * - defaultRole: 'client' | 'provider' (default: 'client')
//  * - showRoleSelector: boolean (default: false) - whether to show role dropdown
//  */
// export default function AuthForm({ mode = 'login', onSuccess = () => {}, defaultRole = 'client', showRoleSelector = false }) {
//   const { login: contextLogin, register: contextRegister } = useAuthContext()
//   const [form, setForm] = useState({
//     name: '',
//     email: '',
//     password: '',
//     role: defaultRole
//   })
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState(null)

//   function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }

//   function validate() {
//     if (!form.email) return 'Email is required'
//     if (!form.password || form.password.length < 6) return 'Password must be at least 6 characters'
//     if (mode === 'register' && !form.name) return 'Name is required for registration'
//     return null
//   }

//   async function handleSubmit(e) {
//     e?.preventDefault()
//     setError(null)
//     const v = validate()
//     if (v) { setError(v); return }
//     setLoading(true)
//     try {
//       let user;
//       if (mode === 'login') {
//         user = await contextLogin(form.email, form.password)
//       } else {
//         user = await contextRegister({ name: form.name, email: form.email, password: form.password, role: form.role })
//       }
//       // Pass user data to success handler
//       onSuccess(user)
//     } catch (err) {
//       console.error('Auth error:', err)
//       setError(err.message || err.response?.data?.message || 'Server error')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <form onSubmit={handleSubmit} className="bg-white rounded-xl sm:rounded-2xl shadow p-4 sm:p-6 space-y-3 sm:space-y-4 max-w-md mx-auto">
//       <h3 className="text-lg sm:text-xl font-semibold">{mode === 'login' ? 'Sign in to your account' : 'Create a new account'}</h3>

//       {mode === 'register' && (
//         <Input label="Full name" value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="e.g. Priya Sharma" />
//       )}

//       <Input label="Email" value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="you@example.com" type="email" />
//       <Input label="Password" value={form.password} onChange={(e) => setField('password', e.target.value)} placeholder="******" type="password" />

//       {mode === 'register' && showRoleSelector && (
//         <Select
//           label="Role"
//           value={form.role}
//           onChange={(e) => setField('role', e.target.value)}
//           options={[
//             { value: 'client', label: 'Client' },
//             { value: 'provider', label: 'Service Provider' }
//           ]}
//         />
//       )}

//       {error && <div className="text-sm text-red-600">{error}</div>}

//       <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
//         <Button type="submit" loading={loading} variant="primary" className="w-full sm:w-auto">{mode === 'login' ? 'Login' : 'Create account'}</Button>
        
//       </div>
//     </form>
//   )
// }

import React, { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import authService from '../../services/auth.service'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import OTPVerification from './OTPVerification'

/**
 * AuthForm
 * props:
 * - mode: 'login' | 'register'
 * - onSuccess(user)
 * - defaultRole: 'client' | 'provider' (default: 'client')
 * - showRoleSelector: boolean (default: false)
 */
export default function AuthForm({
  mode = 'login',
  onSuccess = () => {},
  defaultRole = 'client',
  showRoleSelector = false
}) {
  const { login: contextLogin, register: contextRegister } = useAuthContext()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: defaultRole
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showOTP, setShowOTP] = useState(false)
  const [otpData, setOtpData] = useState(null) // { userId, phone }

  function setField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function validate() {
    // Login: Only phone required
    if (mode === 'login') {
      if (!form.phone) return 'Phone number is required'
      if (form.phone && form.phone.replace(/\D/g, '').length < 10)
        return 'Please enter a valid phone number'
      return null
    }
    
    // Register: name, phone required; email and password optional
    if (mode === 'register') {
      if (!form.name) return 'Name is required for registration'
      if (!form.phone) return 'Phone number is required for registration'
      if (form.phone && form.phone.replace(/\D/g, '').length < 10)
        return 'Please enter a valid phone number'
      return null
    }
    
    return null
  }

  async function handleSubmit(e) {
    e?.preventDefault()
    setError(null)

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      let response

      if (mode === 'login') {
        // Phone-only login
        response = await contextLogin(form.phone)
      } else {
        // Registration with optional email/password
        response = await contextRegister({
          name: form.name,
          email: form.email || undefined, // Optional
          password: form.password || undefined, // Optional
          phone: form.phone,
          role: form.role
        })
      }

      // Check if 2FA verification is required
      if (response?.requiresVerification) {
        setOtpData({
          userId: response.userId || response.id,
          phone: response.phone
        })
        setShowOTP(true)
      } else {
        // Direct success (shouldn't happen with 2FA, but handle it)
        onSuccess(response.user || response)
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError(err.message || err.response?.data?.message || 'Server error')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOTP(code) {
    setLoading(true)
    try {
      let user
      if (mode === 'login') {
        // Phone-only login verification
        user = await contextLogin(form.phone, otpData, code)
      } else {
        // Registration verification
        user = await contextRegister({
          name: form.name,
          email: form.email || undefined,
          password: form.password || undefined,
          phone: form.phone,
          role: form.role
        }, otpData, code)
      }
      setShowOTP(false)
      onSuccess(user)
    } catch (err) {
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function handleResendOTP() {
    try {
      if (mode === 'login') {
        // Phone-only login resend
        await contextLogin(form.phone, otpData, null, true)
      } else {
        // For registration, resend OTP
        await authService.resendOTP({ phone: otpData.phone })
      }
    } catch (err) {
      throw err
    }
  }

  // Show OTP verification if needed
  if (showOTP && otpData) {
    return (
      <div>
        <OTPVerification
          phone={otpData.phone}
          onVerify={handleVerifyOTP}
          onResend={handleResendOTP}
          loading={loading}
        />
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => {
              setShowOTP(false)
              setOtpData(null)
            }}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to {mode === 'login' ? 'login' : 'registration'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl sm:rounded-2xl shadow p-4 sm:p-6 space-y-3 sm:space-y-4 max-w-md mx-auto"
    >
      <h3 className="text-lg sm:text-xl font-semibold">
        {mode === 'login'
          ? 'Sign in to your account'
          : 'Create a new account'}
      </h3>

      {/* Login: Only phone number */}
      {mode === 'login' && (
        <Input
          label="Phone Number"
          value={form.phone}
          onChange={e => setField('phone', e.target.value)}
          placeholder="9876543210"
          type="tel"
          required
        />
      )}

      {/* Register: Name, Phone (required), Email and Password (optional) */}
      {mode === 'register' && (
        <>
          <Input
            label="Full name"
            value={form.name}
            onChange={e => setField('name', e.target.value)}
            placeholder="e.g. Priya Sharma"
            required
          />
          
          <Input
            label="Phone Number"
            value={form.phone}
            onChange={e => setField('phone', e.target.value)}
            placeholder="9876543210"
            type="tel"
            required
          />

          {/* <Input
            label="Email "
            value={form.email}
            onChange={e => setField('email', e.target.value)}
            placeholder="you@example.com"
            type="email"
          /> */}

          {/* <Input
            label="Password "
            value={form.password}
            onChange={e => setField('password', e.target.value)}
            placeholder="******"
            type={showPassword ? 'text' : 'password'}
            showToggle
            onToggle={() => setShowPassword(p => !p)}
          /> */}
        </>
      )}

      {mode === 'register' && showRoleSelector && (
        <Select
          label="Role"
          value={form.role}
          onChange={e => setField('role', e.target.value)}
          options={[
            { value: 'client', label: 'Client' },
            { value: 'provider', label: 'Service Provider' }
          ]}
        />
      )}

      {error && (
        <div className="text-sm text-red-600 space-y-1">
          <div>{error}</div>
          {error.includes('not verified') && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <p className="font-semibold mb-1">Need to verify your phone number?</p>
              <a 
                href="https://console.twilio.com/us1/develop/phone-numbers/manage/verified" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Click here to verify your phone number in Twilio →
              </a>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <Button
          type="submit"
          loading={loading}
          variant="primary"
          className="w-full sm:w-auto"
        >
          {mode === 'login' ? 'Login' : 'Create account'}
        </Button>
      </div>
    </form>
  )
}
