import React from 'react'

/**
 * Simple Select component with label/error
 *
 * Props:
 * - options: [{ value, label }]
 * - value, onChange, label, error, placeholder
 */
export default function Select({ options = [], value, onChange, label, error, placeholder = 'Select...', className = '', name, id }) {
  const border = error ? 'border-red-400' : 'border-gray-200'
  return (
    <div className={`space-y-1 ${className}`}>
      {label && <label htmlFor={id || name} className="text-sm font-medium text-gray-700 block">{label}</label>}
      <div className={`rounded-lg sm:rounded-xl border ${border} overflow-hidden`}>
        <select
          id={id || name}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-base bg-white focus:outline-none min-h-[44px]"
        >
          <option value="">{placeholder}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {error && <div className="text-xs text-red-600">{error}</div>}
    </div>
  )
}
