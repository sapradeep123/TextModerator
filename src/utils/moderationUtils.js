/**
 * Moderation Utilities
 *
 * Processes raw Hugging Face API responses into display-ready data structures
 * and generates contextual, friendly suggestions for flagged content.
 */

/** Threshold above which a label is considered "detected". */
const THRESHOLD = Number(import.meta.env.VITE_TOXICITY_THRESHOLD) || 0.5

/**
 * Visual and semantic configuration for each toxicity label produced by
 * `unitary/toxic-bert`. Extend this map when switching to a different model.
 */
export const LABEL_CONFIG = {
  toxic: {
    displayName: 'Toxic',
    description: 'General toxic or harmful language',
    icon: '⚠️',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
  },
  severe_toxic: {
    displayName: 'Severely Toxic',
    description: 'Extremely aggressive or hateful content',
    icon: '🚫',
    color: '#dc2626',
    bgColor: 'rgba(220, 38, 38, 0.1)',
  },
  obscene: {
    displayName: 'Obscene',
    description: 'Vulgar or indecent language',
    icon: '🔞',
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.1)',
  },
  threat: {
    displayName: 'Threatening',
    description: 'Content containing threats or intimidation',
    icon: '🔪',
    color: '#b91c1c',
    bgColor: 'rgba(185, 28, 28, 0.1)',
  },
  insult: {
    displayName: 'Insulting',
    description: 'Disrespectful or demeaning language',
    icon: '💢',
    color: '#ea580c',
    bgColor: 'rgba(234, 88, 12, 0.1)',
  },
  identity_hate: {
    displayName: 'Hate Speech',
    description: 'Content targeting identity or demographic groups',
    icon: '🤬',
    color: '#9f1239',
    bgColor: 'rgba(159, 18, 57, 0.1)',
  },
}

/** Fallback config for unknown model labels */
const defaultLabelConfig = {
  displayName: 'Flagged',
  description: 'Potentially harmful content detected',
  icon: '⚠️',
  color: '#6366f1',
  bgColor: 'rgba(99, 102, 241, 0.1)',
}

export const getLabelConfig = (label) =>
  LABEL_CONFIG[label] ?? { ...defaultLabelConfig, displayName: label }

/**
 * Returns whether all label scores are below the detection threshold.
 */
export const isSafeContent = (labels, threshold = THRESHOLD) =>
  labels.every((item) => item.score < threshold)

/**
 * Computes an overall safety score as a percentage (0 = fully toxic, 100 = fully safe).
 */
export const getSafetyScore = (labels) => {
  if (!labels?.length) return 100
  const maxScore = Math.max(...labels.map((l) => l.score))
  return Math.round((1 - maxScore) * 100)
}

/**
 * Returns labels whose score exceeds the threshold, sorted by score descending.
 */
export const getDetectedIssues = (labels, threshold = THRESHOLD) =>
  labels
    .filter((item) => item.score >= threshold)
    .sort((a, b) => b.score - a.score)

/**
 * Maps a 0–1 confidence score to a human-readable severity level with colour.
 */
export const getSeverityLevel = (score) => {
  if (score < 0.3) return { label: 'Low',      color: '#10b981' }
  if (score < 0.6) return { label: 'Medium',   color: '#f59e0b' }
  if (score < 0.8) return { label: 'High',     color: '#f97316' }
  return              { label: 'Critical', color: '#ef4444' }
}

/**
 * Generates contextual, friendly, and actionable suggestions based on which
 * toxicity categories were detected. Returns an empty array for safe content.
 */
export const generateSuggestions = (detectedIssues) => {
  if (!detectedIssues.length) return []

  const flagged = new Set(detectedIssues.map((i) => i.label))
  const suggestions = []

  if (flagged.has('toxic') || flagged.has('severe_toxic')) {
    suggestions.push('Try using neutral, respectful language to make your message more effective.')
    suggestions.push('Focus on the issue or idea, not the person — it keeps the conversation constructive.')
  }

  if (flagged.has('obscene')) {
    suggestions.push('Replacing crude language with cleaner alternatives broadens your audience and credibility.')
  }

  if (flagged.has('threat')) {
    suggestions.push(
      'Express frustration constructively: describe how the situation affects you rather than making threats.',
    )
  }

  if (flagged.has('insult')) {
    suggestions.push('Frame negative feedback as constructive criticism — it is more persuasive and less likely to be dismissed.')
    suggestions.push('Using "I feel..." statements instead of "You always..." tends to de-escalate tension.')
  }

  if (flagged.has('identity_hate')) {
    suggestions.push('Avoid sweeping generalisations about groups — individual behaviour varies widely within any community.')
    suggestions.push('Critique specific actions or policies rather than inherent characteristics of people.')
  }

  return suggestions
}

/**
 * Formats a 0–1 score as a percentage string, e.g. 0.9987 → "99.9%"
 */
export const formatScore = (score) => `${(score * 100).toFixed(1)}%`
