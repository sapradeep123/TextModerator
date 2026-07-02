import React, { useEffect, useRef } from 'react'
import {
  isSafeContent,
  getSafetyScore,
  getDetectedIssues,
  getLabelConfig,
  getSeverityLevel,
  generateSuggestions,
  formatScore,
} from '../utils/moderationUtils.js'
import { copyToClipboard } from '../utils/textUtils.js'
import { useToast } from '../hooks/useToast.js'

/* ── Safety Score Gauge (SVG circle) ── */
function ScoreGauge({ score }) {
  const radius      = 36
  const circumference = 2 * Math.PI * radius
  const offset      = circumference - (score / 100) * circumference

  const color =
    score >= 80 ? '#10b981' :
    score >= 50 ? '#f59e0b' :
                  '#ef4444'

  return (
    <div className="score-gauge" aria-label={`Safety score: ${score}%`}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle className="score-gauge__track"  cx="44" cy="44" r={radius} />
        <circle
          className="score-gauge__fill"
          cx="44"
          cy="44"
          r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="score-gauge__label">
        <span className="score-gauge__number" style={{ color }}>{score}</span>
        <span className="score-gauge__text">Safety</span>
      </div>
    </div>
  )
}

/* ── Individual label row ── */
function LabelItem({ item }) {
  const config   = getLabelConfig(item.label)
  const severity = getSeverityLevel(item.score)
  const isFlagged = item.score >= 0.5

  return (
    <div
      className={`label-item${isFlagged ? ' label-item--flagged' : ''}`}
      style={isFlagged ? { '--label-color': config.color, '--label-bg': config.bgColor } : {}}
    >
      <div className="label-item__top">
        <span className="label-item__name">
          <span aria-hidden="true">{config.icon}</span>
          {config.displayName}
          {isFlagged && (
            <span
              className="label-item__badge"
              style={{ background: config.color }}
              aria-label={`${severity.label} severity`}
            >
              {severity.label}
            </span>
          )}
        </span>
        <span
          className="label-item__score"
          style={{ color: isFlagged ? config.color : undefined }}
        >
          {formatScore(item.score)}
        </span>
      </div>

      <div className="progress-bar-track" role="progressbar" aria-valuenow={Math.round(item.score * 100)} aria-valuemin="0" aria-valuemax="100">
        <div
          className="progress-bar-fill"
          style={{
            width: `${item.score * 100}%`,
            '--label-color': isFlagged ? config.color : 'var(--c-accent)',
            background: isFlagged ? config.color : 'var(--c-accent)',
          }}
        />
      </div>

      <p className="label-item__desc">{config.description}</p>
    </div>
  )
}

/**
 * ResultCard — renders the full analysis report after the API responds.
 *
 * Props:
 *   labels   {Array<{label: string, score: number}>}
 *   inputText {string}
 *   onReset   {() => void}
 */
function ResultCard({ labels, inputText, onReset }) {
  const { addToast } = useToast()
  const cardRef = useRef(null)

  const safe        = isSafeContent(labels)
  const score       = getSafetyScore(labels)
  const detected    = getDetectedIssues(labels)
  const suggestions = generateSuggestions(detected)

  // Scroll card into view on first render
  useEffect(() => {
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [])

  const handleCopyResults = async () => {
    const lines = [
      `=== Text Moderation Report ===`,
      ``,
      `Safety Score: ${score}/100`,
      `Status: ${safe ? 'SAFE ✅' : 'UNSAFE ⚠️'}`,
      ``,
      `Original Text:`,
      inputText,
      ``,
      `--- Toxicity Labels ---`,
      ...labels.map((l) => `${getLabelConfig(l.label).displayName}: ${formatScore(l.score)}`),
      suggestions.length
        ? [``, `--- Suggestions ---`, ...suggestions.map((s) => `• ${s}`)].join('\n')
        : '',
    ]
      .filter((l) => l !== undefined)
      .join('\n')

    const ok = await copyToClipboard(lines)
    addToast(ok ? 'Report copied to clipboard!' : 'Copy failed — please try again.', ok ? 'success' : 'error')
  }

  return (
    <article ref={cardRef} className="card card--elevated result-card" aria-label="Moderation result">

      {/* ── Header: verdict + gauge ── */}
      <div className="result-header">
        <div className="result-verdict">
          <div className={`verdict-icon verdict-icon--${safe ? 'safe' : 'unsafe'}`} aria-hidden="true">
            {safe ? '🛡️' : '⚠️'}
          </div>
          <div>
            <div className={`verdict-label verdict-label--${safe ? 'safe' : 'unsafe'}`}>
              {safe ? 'Content Safe' : 'Issues Detected'}
            </div>
            <div className="verdict-sublabel">
              {safe
                ? 'No harmful content was detected in this text.'
                : `${detected.length} categor${detected.length === 1 ? 'y' : 'ies'} flagged above threshold.`}
            </div>
          </div>
        </div>

        <ScoreGauge score={score} />
      </div>

      {/* ── Original text preview ── */}
      <div className="original-text-block">
        <p className="original-text-label">Analysed text</p>
        <p className="original-text-content">{inputText}</p>
      </div>

      {/* ── Safe banner ── */}
      {safe && (
        <div className="safe-banner" role="status">
          <span aria-hidden="true">✅</span>
          <span>
            <strong>All clear!</strong> This text scored {score}/100 on the safety scale and did
            not trigger any toxicity categories above the detection threshold.
          </span>
        </div>
      )}

      {/* ── Toxicity labels grid ── */}
      <section aria-labelledby="labels-heading">
        <h2 className="labels-section-title" id="labels-heading">
          Toxicity Breakdown
        </h2>
        <div className="labels-grid">
          {labels.map((item) => (
            <LabelItem key={item.label} item={item} />
          ))}
        </div>
      </section>

      {/* ── Friendly suggestions (only when flagged) ── */}
      {suggestions.length > 0 && (
        <aside className="suggestions-block" aria-label="Suggestions for improvement">
          <div className="suggestions-title">
            <span aria-hidden="true">💡</span>
            Friendly Suggestions
          </div>
          <ul className="suggestions-list">
            {suggestions.map((s, i) => (
              <li key={i} className="suggestion-item">{s}</li>
            ))}
          </ul>
        </aside>
      )}

      {/* ── Actions ── */}
      <div className="result-actions">
        <button className="btn btn--secondary btn--sm" onClick={handleCopyResults}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy Report
        </button>

        <button className="btn btn--ghost btn--sm" onClick={onReset}>
          ← Analyse New Text
        </button>
      </div>
    </article>
  )
}

export default ResultCard
