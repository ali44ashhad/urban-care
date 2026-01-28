import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import AuthForm from '../../components/forms/AuthForm'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthContext()

  async function handleSuccess(user) {
    // user logged in, redirect based on role or to home
    const role = user?.role
    if (role === 'admin') navigate('/admin')
    else if (role === 'provider') navigate('/provider')
    else navigate('/')
    window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Logged in successfully', type: 'success' } }))
  }

  return (
    <div className="min-h-[72vh] flex items-center justify-center bg-gray-50 py-8 sm:py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="mb-4 sm:mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold">Welcome back</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Login to your account to manage bookings and services.</p>
        </div>

        <AuthForm mode="login" onSuccess={handleSuccess} />

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Login with your phone number. We'll send you an OTP to verify.</p>
        </div>
      </div>
    </div>
  )
}
