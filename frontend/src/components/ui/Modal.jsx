import React, { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'

/**
 * Modal with focus trap and escape handling.
 *
 * Props:
 * - open: boolean
 * - onClose: fn
 * - children
 * - title: optional title node/string
 * - size: 'sm'|'md'|'lg'|'xl' -> maps to max-w
 */
const SIZE_MAP = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl'
}

export default function Modal({ open, onClose, children, title, size = 'md', closeOnOverlay = true }) {
  const overlayRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose?.()
    }
    if (open) {
      document.addEventListener('keydown', onKey)
      // prevent background scroll
      document.body.style.overflow = 'hidden'
      // focus first focusable element later
      setTimeout(() => contentRef.current?.querySelector('button, [href], input, select, textarea, [tabindex]')?.focus(), 80)
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return ReactDOM.createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
        onMouseDown={(e) => { if (closeOnOverlay && e.target === overlayRef.current) onClose?.() }}
      />
      <div ref={contentRef} className={`relative z-10 w-full ${SIZE_MAP[size] || SIZE_MAP.md} max-h-[90vh] sm:max-h-[85vh] overflow-auto`}>
        <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
          {title && (
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <div className="text-base sm:text-lg font-semibold">{title}</div>
                <button onClick={onClose} aria-label="Close" className="p-2 rounded-md hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          )}
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
