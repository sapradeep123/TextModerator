/**
 * Hugging Face Inference API — Text Moderation Service
 *
 * Wraps the HF Inference API for the configured toxicity classification model.
 * All configuration is read from environment variables; no URLs or tokens are hardcoded.
 */
import axios from 'axios'

const HF_API_KEY  = import.meta.env.VITE_HF_API_KEY
const HF_API_URL  = import.meta.env.VITE_HF_API_URL
const HF_MODEL_ID = import.meta.env.VITE_HF_MODEL_ID
const TIMEOUT_MS  = Number(import.meta.env.VITE_REQUEST_TIMEOUT) || 30_000

// Log missing key only in development — stripped from production bundle by esbuild.drop
if (import.meta.env.DEV) {
  if (!HF_API_KEY || HF_API_KEY === 'hf_your_api_key_here') {
    console.warn('[ModeratorAPI] VITE_HF_API_KEY is not set. API calls will be rejected by Hugging Face.')
  }
}

/** Axios instance scoped to the configured HF model endpoint */
const hfClient = axios.create({
  baseURL: `${HF_API_URL}/models/${HF_MODEL_ID}`,
  timeout: TIMEOUT_MS,
  headers: {
    Authorization: `Bearer ${HF_API_KEY}`,
    'Content-Type': 'application/json',
    // Tells HF to wait for the model to load rather than returning 503 immediately.
    // Cold-start models typically load within 20-60 seconds.
    'X-Wait-For-Model': 'true',
  },
})

/** Intercept every response for normalised, user-friendly error surfacing */
hfClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status  = error.response?.status
    const payload = error.response?.data

    if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      return Promise.reject(
        new Error(
          'Network error — this is usually caused by an invalid API key (CORS block) or no internet connection. Check your VITE_HF_API_KEY and try again.',
        ),
      )
    }
    if (error.code === 'ERR_CANCELED') {
      return Promise.reject(new Error('Request was cancelled.'))
    }
    if (status === 401 || status === 403) {
      return Promise.reject(new Error('Invalid or missing Hugging Face API key. Check your environment configuration.'))
    }
    if (status === 429) {
      return Promise.reject(new Error('Rate limit reached. Please wait a moment before trying again.'))
    }
    if (status === 503) {
      // X-Wait-For-Model should absorb most cold-starts, but if the model hasn't loaded
      // within TIMEOUT_MS the server returns 503. Signal this case distinctly.
      const waitTime = payload?.estimated_time
      const hint     = waitTime ? ` (~${Math.ceil(waitTime)}s remaining)` : ''
      const err      = new Error(`Model is warming up${hint}. Please try again shortly.`)
      err.code       = 'MODEL_WARMING_UP'
      return Promise.reject(err)
    }
    if (status === 422) {
      return Promise.reject(new Error('The model rejected the input. Try a shorter or different text.'))
    }

    const serverMessage = payload?.error || payload?.message
    return Promise.reject(new Error(serverMessage || `Unexpected server error (HTTP ${status}).`))
  },
)

/**
 * Analyse text for toxicity using the configured Hugging Face model.
 *
 * @param {string}      text   The text to analyse.
 * @param {AbortSignal} signal Optional AbortController signal for cancellation.
 * @returns {Promise<Array<{label: string, score: number}>>} Flat array of label–score pairs.
 */
export const analyzeText = async (text, signal) => {
  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new Error('Input text must be a non-empty string.')
  }

  // Guard before making the request — a missing key causes a CORS network error
  // in the browser (HF doesn't return CORS headers for unauthenticated requests).
  if (!HF_API_KEY || HF_API_KEY === 'hf_your_api_key_here') {
    throw new Error(
      'Hugging Face API key is not configured. Add VITE_HF_API_KEY to your environment variables.',
    )
  }

  const { data } = await hfClient.post('', { inputs: text.trim() }, { signal })

  // HF Inference API returns either [[{label,score},...]] or [{label,score},...]
  // depending on the model's pipeline type. Normalise to a flat array.
  const results = Array.isArray(data?.[0]) ? data[0] : data

  if (!Array.isArray(results) || results.length === 0) {
    throw new Error('Received an unexpected response format from the API.')
  }

  return results
}

/** Ping the endpoint to pre-warm the model before the user submits text. */
export const warmUpModel = async () => {
  try {
    await hfClient.post('', { inputs: 'hello' })
    return { ready: true }
  } catch (err) {
    return { ready: false, code: err.code, message: err.message }
  }
}
