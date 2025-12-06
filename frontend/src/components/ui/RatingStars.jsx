import React from 'react'
import clsx from 'clsx'

/**
 * RatingStars
 * - rating: number (0-5 possible decimal)
 * - size: 'sm'|'md'|'lg'
 * - showCount: optional number next to stars
 */
export default function RatingStars({ rating = 0, outOf = 5, size = 'md', className = '', showCount }) {
  const sizes = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' }
  const full = Math.floor(rating)
  const half = rating - full >= 0.5

  const stars = []
  for (let i = 0; i < outOf; i++) {
    if (i < full) stars.push('full')
    else if (i === full && half) stars.push('half')
    else stars.push('empty')
  }

  return (
    <div className={clsx('inline-flex items-center gap-1', className)}>
      {stars.map((s, idx) => (
        <svg key={idx} className={clsx(sizes[size], s === 'empty' ? 'text-gray-300' : 'text-yellow-400')} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          {s === 'half' ? (
            // half star: clip path trick
            <g>
              <defs>
                <linearGradient id={`g-${idx}`} x1="0" x2="1">
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path fill={`url(#g-${idx})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </g>
          ) : (
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          )}
        </svg>
      ))}
      {showCount !== undefined && <span className="text-sm text-gray-600 ml-1">({showCount})</span>}
    </div>
  )
}
