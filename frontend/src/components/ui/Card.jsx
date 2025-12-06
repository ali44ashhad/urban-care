import React from 'react'

/**
 * Simple Card wrapper with optional header/footer slots.
 *
 * Props:
 * - className: extra tailwind classes
 * - header: node (optional)
 * - footer: node (optional)
 */
export default function Card({ children, header, footer, className = '' }) {
  return (
    <div className={`bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm ${className}`}>
      {header && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
          {header}
        </div>
      )}
      <div className="p-4 sm:p-6">
        {children}
      </div>
      {footer && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  )
}
