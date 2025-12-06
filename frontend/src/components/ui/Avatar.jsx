import React from 'react'

/**
 * Avatar
 * - src: image url
 * - name: string (fallback initials)
 * - size: 'sm'|'md'|'lg'
 * - className
 */
export default function Avatar({ src, name, size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg'
  }
  const initials = name ? name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : ''
  return (
    <div className={`inline-flex items-center justify-center rounded-full bg-gray-100 overflow-hidden ${sizeMap[size]} ${className}`}>
      {src ? (
        <img src={src} alt={name || 'avatar'} className="w-full h-full object-cover" />
      ) : (
        <span className="text-gray-600 font-semibold">{initials}</span>
      )}
    </div>
  )
}
