import React, { useState, useEffect } from 'react'

/**
 * DatePicker
 * - Simple wrapper around native date input with min/max support and friendly UI.
 * - Props: value (ISO YYYY-MM-DD), onChange, minDate, maxDate, label, hint
 *
 * Note: You can later swap with a more feature-rich lib (react-day-picker) easily.
 */
export default function DatePicker({ value, onChange, minDate, maxDate, label, hint, className = '' }) {
  const [internal, setInternal] = useState(value || '')

  useEffect(() => {
    setInternal(value || '')
  }, [value])

  function handle(e) {
    setInternal(e.target.value)
    onChange?.(e.target.value)
  }

  return (
    <div className={className}>
      {label && <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <input
          type="date"
          value={internal}
          onChange={handle}
          min={minDate}
          max={maxDate}
          className="w-full px-4 py-2 bg-white focus:outline-none"
        />
      </div>
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </div>
  )
}
