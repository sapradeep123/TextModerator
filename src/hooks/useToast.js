import { useContext } from 'react'
import { ToastContext } from '../App.jsx'

/**
 * Convenience hook for firing toast notifications.
 *
 * @returns {{ addToast: (message: string, type?: 'success'|'error'|'warning'|'info', duration?: number) => void }}
 */
export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <App> (ToastContext provider)')
  return ctx
}
