import React, { useMemo } from 'react'
import clsx from 'clsx'

/**
 * TimeSlotPicker
 *
 * - slots: array of { id, label, startTime, endTime, capacity?, available?: boolean }
 * - selected: id
 * - onSelect: fn(id)
 *
 * Renders responsive pill-styled slots with availability.
 */
export default function TimeSlotPicker({ slots = [], selected, onSelect, className = '' }) {
  const grouped = useMemo(() => {
    // you can group by date if slots contain date property
    return slots
  }, [slots])

  if (!slots?.length) {
    return <div className="text-sm text-gray-500">No slots available</div>
  }

  return (
    <div className={clsx('grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3', className)}>
      {grouped.map(slot => {
        const isSelected = selected === slot.id
        const disabled = slot.available === false || (slot.capacity === 0)
        return (
          <button
            key={slot.id}
            onClick={() => !disabled && onSelect?.(slot.id)}
            disabled={disabled}
            className={clsx(
              'rounded-2xl px-3 py-2 text-left transition focus:outline-none',
              isSelected ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow' : 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            aria-pressed={isSelected}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">{slot.label || `${slot.startTime}`}</div>
                {slot.extra && <div className="text-xs text-gray-500">{slot.extra}</div>}
              </div>
              <div className="text-sm">{slot.price ? `₹${slot.price}` : ''}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
