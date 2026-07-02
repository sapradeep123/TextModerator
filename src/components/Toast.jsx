import React, { useState } from 'react'

const ICONS = {
  success: '✅',
  error:   '❌',
  warning: '⚠️',
  info:    'ℹ️',
}

/** Individual toast item with auto-exit animation. */
function ToastItem({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false)

  const handleClose = () => {
    setExiting(true)
    setTimeout(() => onRemove(toast.id), 250)
  }

  return (
    <div
      className={`toast toast--${toast.type}${exiting ? ' toast--exiting' : ''}`}
      role="alert"
      aria-live="assertive"
    >
      <span className="toast__icon" aria-hidden="true">
        {ICONS[toast.type] ?? 'ℹ️'}
      </span>
      <span className="toast__msg">{toast.message}</span>
      <button
        className="toast__close"
        onClick={handleClose}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  )
}

/**
 * Toast container — renders a stack of notifications in the bottom-right corner.
 * Receives the full toast list from App-level state.
 */
function Toast({ toasts, onRemove }) {
  if (!toasts.length) return null

  return (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

export default Toast
