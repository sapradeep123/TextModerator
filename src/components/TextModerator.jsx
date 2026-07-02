import React, { useState, useRef, useCallback, useEffect } from 'react'
import { analyzeText } from '../services/moderatorApi.js'
import {
  countChars,
  countWords,
  validateText,
  getMaxChars,
  getCharCounterState,
  copyToClipboard,
  EXAMPLE_TEXTS,
} from '../utils/textUtils.js'
import { useToast } from '../hooks/useToast.js'
import Loader from './Loader.jsx'
import ResultCard from './ResultCard.jsx'

const MAX_CHARS      = getMaxChars()
const WARMUP_RETRY_S = 8 // seconds before auto-retry when model is warming up

/**
 * TextModerator — the core feature component.
 *
 * Manages:
 *  • Text input with live character / word counters
 *  • Example text quick-fill buttons
 *  • Form validation and submission
 *  • API call lifecycle: idle → loading → result | error | warmup
 *  • Model warm-up detection with countdown auto-retry
 *  • Copy and Clear actions
 *  • AbortController-based request cancellation on re-submit / clear
 */
function TextModerator() {
  const { addToast } = useToast()

  const [text, setText]           = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState(null)
  const [warmingUp, setWarmingUp] = useState(false)   // true when HF model is cold-starting
  const [countdown, setCountdown] = useState(null)    // seconds until auto-retry

  const abortRef      = useRef(null)
  const textareaRef   = useRef(null)
  const retryTimerRef = useRef(null)
  const countdownRef  = useRef(null)

  /* ── Cleanup timers on unmount ── */
  useEffect(() => {
    return () => {
      clearTimeout(retryTimerRef.current)
      clearInterval(countdownRef.current)
    }
  }, [])

  /* ── Live counters ── */
  const charCount    = countChars(text)
  const wordCount    = countWords(text)
  const counterState = getCharCounterState(charCount)

  /* ── Clear all warm-up timers ── */
  const clearWarmupTimers = useCallback(() => {
    clearTimeout(retryTimerRef.current)
    clearInterval(countdownRef.current)
    setWarmingUp(false)
    setCountdown(null)
  }, [])

  /* ── Core submit logic ── (extracted so auto-retry can call it) */
  const submitAnalysis = useCallback(
    async (currentText) => {
      clearWarmupTimers()

      abortRef.current?.abort()
      abortRef.current = new AbortController()

      setError('')
      setResult(null)
      setLoading(true)

      try {
        const labels = await analyzeText(currentText, abortRef.current.signal)
        setResult(labels)
        addToast('Analysis complete!', 'success', 2500)
      } catch (err) {
        if (err.message === 'Request was cancelled.') return

        if (err.code === 'MODEL_WARMING_UP') {
          // Model is cold-starting — show warm-up UI and schedule auto-retry
          setWarmingUp(true)
          addToast('Model is warming up — will retry automatically.', 'warning', 4000)

          let secs = WARMUP_RETRY_S
          setCountdown(secs)

          countdownRef.current = setInterval(() => {
            secs -= 1
            setCountdown(secs)
            if (secs <= 0) clearInterval(countdownRef.current)
          }, 1000)

          retryTimerRef.current = setTimeout(() => {
            setWarmingUp(false)
            setCountdown(null)
            submitAnalysis(currentText)
          }, WARMUP_RETRY_S * 1000)
        } else {
          setError(err.message)
          addToast(err.message, 'error', 5000)
        }
      } finally {
        setLoading(false)
      }
    },
    [addToast, clearWarmupTimers],
  )

  /* ── Public handlers ── */
  const handleAnalyze = useCallback(() => {
    const validation = validateText(text)
    if (!validation.valid) {
      setError(validation.message)
      textareaRef.current?.focus()
      return
    }
    submitAnalysis(text)
  }, [text, submitAnalysis])

  const handleChange = useCallback(
    (e) => {
      const val = e.target.value
      if (val.length <= MAX_CHARS + 50) {
        setText(val)
        if (error) setError('')
      }
    },
    [error],
  )

  const handleExampleClick = useCallback(
    (exampleText) => {
      clearWarmupTimers()
      setText(exampleText)
      setError('')
      setResult(null)
      textareaRef.current?.focus()
      addToast('Example text loaded', 'info', 2000)
    },
    [addToast, clearWarmupTimers],
  )

  const handleClear = useCallback(() => {
    abortRef.current?.abort()
    clearWarmupTimers()
    setText('')
    setError('')
    setResult(null)
    setLoading(false)
    textareaRef.current?.focus()
  }, [clearWarmupTimers])

  const handleCopyText = useCallback(async () => {
    if (!text.trim()) {
      addToast('Nothing to copy — type some text first.', 'warning')
      return
    }
    const ok = await copyToClipboard(text)
    addToast(ok ? 'Text copied to clipboard!' : 'Copy failed.', ok ? 'success' : 'error')
  }, [text, addToast])

  const handleKeyDown = useCallback(
    (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleAnalyze()
      }
    },
    [handleAnalyze],
  )

  const handleReset = useCallback(() => {
    clearWarmupTimers()
    setResult(null)
    setError('')
    textareaRef.current?.focus()
  }, [clearWarmupTimers])

  /* ── Missing API key warning ── */
  const apiKey    = import.meta.env.VITE_HF_API_KEY
  const missingKey = !apiKey || apiKey === 'hf_your_api_key_here'

  /* ── Combined busy state ── */
  const busy = loading || warmingUp

  return (
    <div>
      {/* API key warning banner */}
      {missingKey && (
        <div className="api-key-warning" role="alert">
          <span aria-hidden="true">⚠️</span>
          <span>
            <strong>API key not configured.</strong> Copy{' '}
            <code>.env.example</code> to <code>.env</code> and add your{' '}
            <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer">
              Hugging Face token
            </a>
            .
          </span>
        </div>
      )}

      {/* ── Input Card ── */}
      <div className="card moderator-card">
        <div className="moderator-card__header">
          <span className="moderator-card__title">Enter Text</span>

          <div className="examples-row" aria-label="Quick-fill example texts">
            <span className="examples-label">Try:</span>
            {EXAMPLE_TEXTS.map((ex) => (
              <button
                key={ex.label}
                className="example-btn"
                onClick={() => handleExampleClick(ex.text)}
                title={ex.text.slice(0, 80) + '…'}
                aria-label={`Load ${ex.label} example text`}
                disabled={busy}
              >
                {ex.emoji} {ex.label}
              </button>
            ))}
          </div>
        </div>

        <div className="textarea-wrapper">
          <textarea
            ref={textareaRef}
            className={`text-input${error ? ' text-input--error' : ''}`}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Paste or type any text here to analyse it for harmful or toxic content…"
            aria-label="Text to analyse"
            aria-describedby={error ? 'input-error' : 'input-hint'}
            aria-invalid={!!error}
            disabled={busy}
            spellCheck="true"
          />
        </div>

        {error && (
          <p id="input-error" className="input-error-msg" role="alert">
            <span aria-hidden="true">⚠</span> {error}
          </p>
        )}

        <div className="text-meta">
          <div className="text-stats" id="input-hint" aria-live="polite">
            <span className="text-stat">
              Words: <span>{wordCount.toLocaleString()}</span>
            </span>
          </div>

          <span className={`char-counter char-counter--${counterState}`} aria-live="polite">
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </span>
        </div>

        <div className="action-row">
          <button
            className="btn btn--primary"
            onClick={handleAnalyze}
            disabled={busy || !text.trim()}
            aria-label="Analyse text for toxicity (Ctrl+Enter)"
          >
            {loading ? (
              <>
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" aria-hidden="true"
                  style={{ animation: 'spin 0.8s linear infinite' }}
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Analysing…
              </>
            ) : warmingUp ? (
              <>🔥 Warming up… ({countdown}s)</>
            ) : (
              <>
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                >
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                Analyse Text
              </>
            )}
          </button>

          <button
            className="btn btn--secondary"
            onClick={handleCopyText}
            disabled={busy || !text.trim()}
            aria-label="Copy input text to clipboard"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy
          </button>

          <button
            className="btn btn--ghost"
            onClick={handleClear}
            disabled={!text && !busy && !result}
            aria-label="Clear input text and results"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Clear
          </button>

          <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--c-text-muted)' }}>
            ⌘ + Enter to analyse
          </span>
        </div>
      </div>

      {/* ── Standard loading spinner ── */}
      {loading && !warmingUp && (
        <div className="card">
          <Loader message="Contacting Hugging Face API…" />
        </div>
      )}

      {/* ── Model warm-up state (distinct UI) ── */}
      {warmingUp && (
        <div className="card">
          <Loader
            variant="warmup"
            message="The AI model is cold-starting on Hugging Face. This happens once and takes ~20–60 seconds."
            countdown={countdown}
          />
        </div>
      )}

      {/* ── Result ── */}
      {!busy && result && (
        <ResultCard labels={result} inputText={text} onReset={handleReset} />
      )}
    </div>
  )
}

export default TextModerator
