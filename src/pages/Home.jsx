import React from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import TextModerator from '../components/TextModerator.jsx'

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Friendly Text Moderator'

/**
 * Home page — the single page of this application.
 * Composes the layout shell (Navbar / Footer) around the core TextModerator feature.
 */
function Home() {
  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content" id="main-content">
        <div className="container">

          {/* ── Hero ── */}
          <header className="hero">
            <div className="hero__eyebrow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Powered by Hugging Face AI
            </div>

            <h1 className="hero__title">
              {APP_NAME}
            </h1>

            <p className="hero__subtitle">
              Paste any text to instantly analyse it for toxicity, hate speech, threats, and
              harmful language — powered by <strong>unitary/toxic-bert</strong>.
            </p>
          </header>

          {/* ── Feature stats ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            marginBottom: '40px',
          }}>
            {[
              { label: 'Categories', value: '6',        icon: '🏷️' },
              { label: 'Model',      value: 'BERT',     icon: '🤖' },
              { label: 'Response',   value: '< 2s',     icon: '⚡' },
              { label: 'Languages',  value: 'EN',       icon: '🌐' },
            ].map((stat) => (
              <div key={stat.label} className="card" style={{ padding: '16px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: '4px' }} aria-hidden="true">{stat.icon}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.03em' }}>{stat.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--c-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* ── Core feature ── */}
          <TextModerator />

        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Home
