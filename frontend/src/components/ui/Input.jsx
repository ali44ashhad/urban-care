import React from 'react'

/**
 * Controlled Input component with label, hint and error support.
 *
 * Props:
 * - id, name, value, onChange, placeholder, type
 * - label, hint, error
 * - className
 */
export default function Input({
  id,
  name,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  label,
  hint,
  error,
  className = '',
  ...rest
}) {
  const base = 'w-full rounded-lg sm:rounded-xl border px-3 sm:px-4 py-2 sm:py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
  const border = error ? 'border-red-400' : 'border-gray-200'

  return (
    <div className={`space-y-1 ${className}`}>
      {label && <label htmlFor={id || name} className="text-sm font-medium text-gray-700 block">{label}</label>}
      <input
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        className={`${base} ${border}`}
        {...rest}
      />
      {hint && !error && <div className="text-xs text-gray-500">{hint}</div>}
      {error && <div className="text-xs text-red-600">{error}</div>}
    </div>
  )
}
