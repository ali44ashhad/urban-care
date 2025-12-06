import React from 'react'
import clsx from 'clsx'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  fullWidth = false,
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  type = 'button',
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg sm:rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition min-h-[44px]'

  const variants = {
    primary:
      'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:from-blue-700 hover:to-purple-700 active:scale-95',
    secondary:
      'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 active:scale-95',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-50 active:scale-95',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-95',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base',
    lg: 'px-5 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(
        base,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
      {...rest}
    >
      {loading && (
        <svg
          className="w-4 h-4 animate-spin text-white"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="60"
            strokeDashoffset="0"
          ></circle>
        </svg>
      )}

      {/* Left Icon */}
      {leftIcon && <span className="flex items-center">{leftIcon}</span>}

      {/* Children rendered directly, NOT wrapped */}
      {children}

      {/* Right Icon */}
      {rightIcon && <span className="flex items-center">{rightIcon}</span>}
    </button>
  )
}
