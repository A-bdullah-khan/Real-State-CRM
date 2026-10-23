import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ToastContext } from '../hooks/useToast'

const MAX_VISIBLE = 4

const TOAST_STYLES = {
  info: 'border-slate-200 bg-white text-slate-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-800',
}

/**
 * App-wide toast stack, consumed via useToast(). Toasts auto-dismiss (errors linger longer), only
 * the newest MAX_VISIBLE are kept, and pending timers are cleared on unmount.
 */
export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const show = useCallback((message, { type = 'info', duration = 5000 } = {}) => {
    const id = ++nextId.current
    setToasts((current) => [...current.slice(-(MAX_VISIBLE - 1)), { id, type, message }])
    if (duration) timers.current.set(id, setTimeout(() => dismiss(id), duration))
    return id
  }, [dismiss])

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  const api = useMemo(() => ({
    show,
    dismiss,
    success: (message, options) => show(message, { ...options, type: 'success' }),
    error: (message, options) => show(message, { duration: 8000, ...options, type: 'error' }),
  }), [show, dismiss])

  return (
    <ToastContext value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:left-auto sm:w-96" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex w-full items-start gap-3 rounded-lg border p-4 text-sm shadow-lg ${TOAST_STYLES[toast.type]}`}
          >
            <p className="flex-1">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="shrink-0 rounded opacity-60 hover:opacity-100"
              aria-label="Dismiss notification"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  )
}
