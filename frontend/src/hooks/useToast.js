import { createContext, useContext } from 'react'

export const ToastContext = createContext(null)

/** Returns `{ show, success, error, dismiss }`. Must be used inside <ToastProvider>. */
export function useToast() {
  const toast = useContext(ToastContext)
  if (!toast) throw new Error('useToast must be used inside <ToastProvider>.')
  return toast
}
