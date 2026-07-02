import React from 'react'

/**
 * Animated loading indicator.
 *
 * variant="default"  — standard spinner (API in-flight)
 * variant="warmup"   — pulsing flame animation with countdown (model cold-starting)
 */
function Loader({ message = 'Analysing your text…', variant = 'default', countdown = null }) {
  return (
    <div className="loader-container" role="status" aria-live="polite" aria-label={message}>
      {variant === 'warmup' ? (
        <div className="loader-warmup" aria-hidden="true">
          <span className="loader-warmup__icon">🔥</span>
        </div>
      ) : (
        <div className="loader-spinner" aria-hidden="true" />
      )}

      <div className="loader-dots" aria-hidden="true">
        <span className="loader-dot" />
        <span className="loader-dot" />
        <span className="loader-dot" />
      </div>

      <p className="loader-text">{message}</p>

      {countdown !== null && (
        <p className="loader-countdown" aria-live="polite">
          Auto-retrying in <strong>{countdown}s</strong>…
        </p>
      )}
    </div>
  )
}

export default Loader
