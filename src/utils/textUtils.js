/**
 * Text Analysis Utilities
 * Pure helper functions for counting and validating user-entered text.
 */

const MAX_CHARS = Number(import.meta.env.VITE_MAX_CHAR_LIMIT) || 5_000

/** Count visible words in a string. */
export const countWords = (text) => {
  if (!text?.trim()) return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

/** Count characters (including whitespace). */
export const countChars = (text) => text?.length ?? 0

/** Count distinct sentences (rough heuristic). */
export const countSentences = (text) => {
  if (!text?.trim()) return 0
  return (text.match(/[^.!?]+[.!?]+/g) ?? []).length
}

/** Returns the configured hard character limit. */
export const getMaxChars = () => MAX_CHARS

/**
 * Validates text before sending it to the API.
 * @returns {{ valid: boolean, message?: string }}
 */
export const validateText = (text) => {
  if (!text || !text.trim()) {
    return { valid: false, message: 'Please enter some text to analyse.' }
  }
  if (text.trim().length < 3) {
    return { valid: false, message: 'Text must be at least 3 characters long.' }
  }
  if (text.length > MAX_CHARS) {
    return { valid: false, message: `Text exceeds the ${MAX_CHARS.toLocaleString()}-character limit.` }
  }
  return { valid: true }
}

/**
 * Returns the danger level for the character counter UI.
 * 'normal' | 'warning' | 'danger'
 */
export const getCharCounterState = (length) => {
  const ratio = length / MAX_CHARS
  if (ratio >= 1) return 'danger'
  if (ratio >= 0.85) return 'warning'
  return 'normal'
}

/** Copy text to clipboard; resolves to true on success. */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(el)
    return ok
  }
}

/** Pre-loaded example texts for the quick-fill buttons. */
export const EXAMPLE_TEXTS = [
  {
    label: 'Friendly',
    emoji: '😊',
    text: "I really appreciate your hard work on this project. The attention to detail and thoughtful approach you brought made a significant difference. Looking forward to collaborating again!",
  },
  {
    label: 'Formal',
    emoji: '💼',
    text: "We would like to formally request a review of the current policy. Our team believes several amendments could improve efficiency and stakeholder satisfaction. We are happy to schedule a meeting at your earliest convenience.",
  },
  {
    label: 'Critical',
    emoji: '😤',
    text: "This is absolutely terrible! I can't believe how incompetent this service is. You people have no idea what you're doing and should be ashamed of yourselves.",
  },
  {
    label: 'Hateful',
    emoji: '🚫',
    text: "People like you don't belong here. Go back to where you came from. You're all the same and we don't want you in our community.",
  },
]
