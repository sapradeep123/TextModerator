# 🛡️ Friendly Text Moderator

A **production-quality** AI-powered text moderation web application built with **React + Vite**, backed by the **Hugging Face Inference API** (`unitary/toxic-bert`).

Enter any text, click **Analyse**, and get an instant safety report: toxicity category breakdown, a visual safety-score gauge, confidence scores, and friendly, actionable suggestions for improving flagged content.

> **Live Demo:** _https://your-app.vercel.app_ ← replace after deployment

---

## ✨ Features

| Feature | Details |
|---|---|
| **6 toxicity categories** | Toxic · Severely Toxic · Obscene · Threatening · Insulting · Hate Speech |
| **Safety score gauge** | SVG circular gauge, 0–100, colour-coded green / amber / red |
| **Confidence bars** | Per-label animated progress bars with severity badges |
| **Friendly suggestions** | Contextual rewrite tips for each flagged category |
| **Model warm-up handling** | Detects cold-start 503s, shows countdown, auto-retries after 8 s |
| **Dark / Light mode** | Persisted to `localStorage`, respects OS preference |
| **Character & word counter** | Live, with amber/red warnings near the limit |
| **Example texts** | 4 pre-loaded examples (Friendly, Formal, Critical, Hateful) |
| **Copy input / Copy report** | Clipboard API with older-browser fallback |
| **Clear button** | Resets input, results, and cancels in-flight requests |
| **Toast notifications** | Success · Error · Warning · Info |
| **Animated loading spinner** | Ring + bouncing dots during request |
| **Ctrl / ⌘ + Enter shortcut** | Keyboard shortcut to trigger analysis |
| **Request cancellation** | `AbortController` cancels stale requests on re-submit or clear |
| **Responsive** | Mobile-first layout, tested down to 320 px |
| **Accessible** | ARIA labels, live regions, focus management, keyboard navigation |
| **Zero console.\* in prod** | `esbuild.drop` removes all logs/debugger from the production bundle |
| **Security headers** | X-Frame-Options, X-XSS-Protection, Referrer-Policy via `vercel.json` |
| **Asset caching** | `/assets/*` served with `Cache-Control: immutable` for CDN efficiency |

---

## 🗂️ Project Structure

```
friendly-text-moderator/
├── public/
│   └── favicon.svg              # SVG shield favicon
├── src/
│   ├── components/
│   │   ├── Footer.jsx           # Site footer with attribution
│   │   ├── Loader.jsx           # Spinner + warm-up variant
│   │   ├── Navbar.jsx           # Sticky nav + theme toggle
│   │   ├── ResultCard.jsx       # Analysis result display
│   │   ├── TextModerator.jsx    # Core input + submit + warm-up retry logic
│   │   └── Toast.jsx            # Toast notification system
│   ├── hooks/
│   │   ├── useTheme.js          # Consumes ThemeContext
│   │   └── useToast.js          # Consumes ToastContext
│   ├── pages/
│   │   └── Home.jsx             # Single page: hero + stats + TextModerator
│   ├── services/
│   │   └── moderatorApi.js      # Axios client for HF Inference API
│   ├── utils/
│   │   ├── moderationUtils.js   # Result processing, suggestions, label config
│   │   └── textUtils.js         # Counters, validation, clipboard, example texts
│   ├── App.jsx                  # Root: ThemeContext + ToastContext providers
│   ├── index.css                # Full design system (CSS custom properties)
│   └── main.jsx                 # ReactDOM entry point
├── .env.example                 # Environment variable template
├── .gitignore
├── index.html                   # HTML shell with SEO meta + Google Fonts
├── package.json
├── README.md
├── vercel.json                  # SPA routing, security headers, asset caching
└── vite.config.js               # Build config: chunking, sourcemaps, console strip
```

---

## 🚀 Local Setup

### Prerequisites

- **Node.js** ≥ 18  
- **npm** ≥ 9  
- A free **Hugging Face** account → [huggingface.co/join](https://huggingface.co/join)

### 1 · Clone

```bash
git clone https://github.com/your-username/friendly-text-moderator.git
cd friendly-text-moderator
```

### 2 · Install

```bash
npm install
```

### 3 · Configure environment

```bash
cp .env.example .env
```

Open `.env` and set your values:

```env
VITE_HF_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_HF_API_URL=https://api-inference.huggingface.co
VITE_HF_MODEL_ID=unitary/toxic-bert
```

**Get a free API key:** [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)  
Create a token with **"Make calls to the serverless Inference API"** permission.

### 4 · Run dev server

```bash
npm run dev
```

Opens [http://localhost:5173](http://localhost:5173) automatically.

### 5 · Production build (local test)

```bash
npm run build
npm run preview
```

Preview runs at [http://localhost:4173](http://localhost:4173).

---

## 🌐 Vercel Deployment

### Option A — Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

When prompted:
- **Framework preset:** Vite (auto-detected)
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Install command:** `npm install`

Vercel reads `vercel.json` automatically — SPA routing and headers are applied with no extra steps.

### Option B — GitHub → Vercel Dashboard

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "feat: initial production build"
   git push origin main
   ```

2. Go to [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → select your repo.

3. Vercel auto-detects **Vite**. No build settings need to change.

4. Add **Environment Variables** in the Vercel dashboard:

   | Variable | Value |
   |---|---|
   | `VITE_HF_API_KEY` | `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
   | `VITE_HF_API_URL` | `https://api-inference.huggingface.co` |
   | `VITE_HF_MODEL_ID` | `unitary/toxic-bert` |
   | `VITE_APP_NAME` | `Friendly Text Moderator` _(optional)_ |
   | `VITE_MAX_CHAR_LIMIT` | `5000` _(optional)_ |
   | `VITE_REQUEST_TIMEOUT` | `30000` _(optional)_ |
   | `VITE_TOXICITY_THRESHOLD` | `0.5` _(optional)_ |

   > **Important:** All client-side vars must start with `VITE_`. Without this prefix, Vite excludes them from the bundle.

5. Click **Deploy**. First deploy typically takes ~60 seconds.

---

## 🔧 Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_HF_API_KEY` | ✅ | — | Hugging Face API token |
| `VITE_HF_API_URL` | ✅ | `https://api-inference.huggingface.co` | Inference API base URL |
| `VITE_HF_MODEL_ID` | ✅ | `unitary/toxic-bert` | Model path on HF Hub |
| `VITE_APP_NAME` | ❌ | `Friendly Text Moderator` | Display name in navbar/hero |
| `VITE_MAX_CHAR_LIMIT` | ❌ | `5000` | Max characters per request |
| `VITE_REQUEST_TIMEOUT` | ❌ | `30000` | Request timeout (ms) |
| `VITE_TOXICITY_THRESHOLD` | ❌ | `0.5` | Score threshold for flagging (0–1) |

---

## 🤖 Hugging Face API Reference

**Model:** [`unitary/toxic-bert`](https://huggingface.co/unitary/toxic-bert)  
Multi-label toxicity classifier fine-tuned on the Jigsaw Toxic Comments dataset.

**Request**
```
POST https://api-inference.huggingface.co/models/unitary/toxic-bert
Authorization: Bearer {VITE_HF_API_KEY}
Content-Type: application/json
X-Wait-For-Model: true

{ "inputs": "text to analyse" }
```

**Response**
```json
[[
  { "label": "toxic",         "score": 0.9987 },
  { "label": "severe_toxic",  "score": 0.0234 },
  { "label": "obscene",       "score": 0.0567 },
  { "label": "threat",        "score": 0.0123 },
  { "label": "insult",        "score": 0.0456 },
  { "label": "identity_hate", "score": 0.0089 }
]]
```

Any label ≥ `VITE_TOXICITY_THRESHOLD` (default `0.5`) is considered detected.  
The `X-Wait-For-Model: true` header tells HF to auto-wait up to 60 s for a cold-starting model instead of immediately returning 503.

---

## 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| **"Invalid or missing API key"** | `VITE_HF_API_KEY` not set or wrong | Copy `.env.example` → `.env`, add valid HF token |
| **"Model is warming up"** | Model was unloaded on HF free tier | App auto-retries after 8 s; wait for the countdown |
| **"Network error"** | Browser offline or CORS block | Check internet; HF API is same-origin compatible via Axios |
| **"Rate limit reached"** | Free tier HF quota exceeded | Wait ~1 min or upgrade to HF Pro |
| **Build error: `process is not defined`** | Custom `define` block referencing Node.js globals | `vite.config.js` no longer uses `process.env` — already fixed |
| **Page 404 on deep link (Vercel)** | SPA routing not configured | `vercel.json` rewrites are in place — redeploy if you added this file after first deploy |
| **Env vars undefined in browser** | Variable name missing `VITE_` prefix | Rename vars so they start with `VITE_` |
| **npm audit warnings** | esbuild dev-server vulnerability (GHSA-67mh-4wv8-2f99) | **Not a production risk** — only affects the local dev server (`npm run dev`), not the deployed build |

---

## 📸 UI Mockups

### Light Mode — Input State
```
┌──────────────────────────────────────────────────────┐
│ 🛡️ TextModerator  [Beta]    Model Docs  GitHub  ☀️   │
├──────────────────────────────────────────────────────┤
│          ✦ Powered by Hugging Face AI                │
│       Friendly Text Moderator                        │
│  Paste any text to analyse it for toxicity…          │
│                                                      │
│  ┌───────────┐ ┌──────┐ ┌───────┐ ┌─────┐           │
│  │ 6 Cats 🏷 │ │ BERT │ │ <2s ⚡│ │ EN 🌐│           │
│  └───────────┘ └──────┘ └───────┘ └─────┘           │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ ENTER TEXT     Try: 😊 Friendly 💼 Formal…   │   │
│  │ ┌────────────────────────────────────────┐   │   │
│  │ │ Paste or type any text here…           │   │   │
│  │ └────────────────────────────────────────┘   │   │
│  │ Words: 0                         0 / 5,000   │   │
│  │ [✓ Analyse Text]  [Copy]  [Clear]    ⌘+↵    │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

### Dark Mode — Result (unsafe content)
```
┌──────────────────────────────────────────────────────┐
│ 🛡️ TextModerator  [Beta]    Model Docs  GitHub  🌙   │
├──────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────┐   │
│  │ ⚠️  Issues Detected               ┌────────┐ │   │
│  │     3 categories flagged          │   02   │ │   │
│  │                                   │ Safety │ │   │
│  │                                   └────────┘ │   │
│  │ ┌──────────────────────────────────────────┐ │   │
│  │ │ Analysed text: "This is absolutely…"    │ │   │
│  │ └──────────────────────────────────────────┘ │   │
│  │                                              │   │
│  │  TOXICITY BREAKDOWN                          │   │
│  │  ┌─────────────────┐  ┌─────────────────┐   │   │
│  │  │ ⚠️ Toxic Critical│  │ 💢 Insult  High │   │   │
│  │  │ ███████ 99.9%   │  │ ████  78.3%     │   │   │
│  │  └─────────────────┘  └─────────────────┘   │   │
│  │                                              │   │
│  │ 💡 Friendly Suggestions                      │   │
│  │ → Try neutral, respectful language…          │   │
│  │ → Focus on the issue, not the person…       │   │
│  │                                              │   │
│  │ [Copy Report]   [← Analyse New Text]        │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

### Model Warm-Up State
```
│  ┌──────────────────────────────────────────────┐   │
│  │              🔥                              │   │
│  │         ● ● ●                                │   │
│  │  The AI model is cold-starting on Hugging    │   │
│  │  Face. This happens once — ~20–60 seconds.   │   │
│  │       Auto-retrying in 6s…                  │   │
│  └──────────────────────────────────────────────┘   │
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build tool | Vite 5 |
| HTTP client | Axios |
| Styling | Vanilla CSS + Custom Properties (no Tailwind) |
| State | React Context + useState / useCallback |
| AI Backend | Hugging Face Inference API |
| Model | `unitary/toxic-bert` |
| Hosting | Vercel |

---

## ✅ Final Deployment Checklist

### Before pushing to GitHub

- [ ] `cp .env.example .env` — fill in real values locally
- [ ] `.env` is listed in `.gitignore` (already is) — **never commit it**
- [ ] `npm run build` passes with zero errors
- [ ] `npm run preview` — manually test Analyse, Dark Mode, Clear, Copy
- [ ] Test all 4 example texts
- [ ] Test with empty input (should show validation error)
- [ ] Test mobile layout at 375 px viewport

### GitHub push

```bash
git init                        # if not already a repo
git add .
git commit -m "feat: production-ready text moderator"
git remote add origin https://github.com/your-username/friendly-text-moderator.git
git push -u origin main
```

### Vercel import

1. [vercel.com/new](https://vercel.com/new) → Import your GitHub repo
2. Framework: **Vite** (auto-detected)
3. Add all `VITE_*` environment variables listed above
4. Click **Deploy**

### After deployment — test cases

| Test | Expected |
|---|---|
| Navigate to `https://your-app.vercel.app` | App loads; no 404 |
| Hard-refresh on the home page | Still loads (SPA routing via `vercel.json`) |
| Submit friendly text | Green "Content Safe" result |
| Submit toxic text | Red "Issues Detected" + suggestions |
| Submit with no API key configured | Yellow warning banner appears |
| Toggle dark mode | Persists on next page load |
| Mobile (375 px) | Layout is single-column, buttons full-width |
| Check browser console | **Zero** warnings or errors |

---

## 📄 License

MIT © 2024
