import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import AuthForm from '../../components/forms/AuthForm'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuthContext()

  async function handleSuccess(user) {
    // after registration, go to onboarding or home depending on role
    if (user?.role === 'provider') {
      // send provider to provider onboarding page (admin may still need to approve)
      navigate('/provider')
    } else {
      navigate('/')
    }
    window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Account created', type: 'success' } }))
  }

  return (
    <div className="min-h-[72vh] flex items-center justify-center bg-gray-50 py-8 sm:py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="mb-4 sm:mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold">Create your account</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Sign up as a client or a provider to get started.</p>
        </div>

        <AuthForm mode="register" onSuccess={handleSuccess} />

        <div className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <a href="/auth/login" className="text-blue-600 hover:underline">Sign in</a>
        </div>
      </div>
    </div>
  )
}
