import React from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'

export default function ServerError({ message }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow">
        <div className="text-6xl font-bold mb-3">500</div>
        <h3 className="text-2xl font-semibold mb-2">Something went wrong</h3>
        <p className="text-gray-600 mb-4">{message || 'An unexpected error occurred on the server. Please try again later.'}</p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/"><Button>Go to Home</Button></Link>
          <Link to="/contact"><Button variant="ghost">Report issue</Button></Link>
        </div>
      </div>
    </div>
  )
}
