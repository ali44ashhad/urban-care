import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

/**
 * ProviderShell
 * Layout wrapper for provider routes with sidebar navigation
 */
export default function ProviderShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const providerMenu = [
    { path: '/provider', label: 'Dashboard' },
    { path: '/provider/bookings', label: 'My Bookings' },
    { path: '/provider/warranty', label: 'Warranty' } 
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 bg-gray-50">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar menu={providerMenu} />
        </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-16 left-4 z-40">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="lg:hidden fixed top-0 left-0 h-full z-50 transform transition-transform duration-300">
            <Sidebar menu={providerMenu} onClose={() => setMobileMenuOpen(false)} />
          </div>
        </>
      )}

      {/* Content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 w-full min-h-screen">
        <Outlet />
      </main>
      </div>
    </div>
  )
}
