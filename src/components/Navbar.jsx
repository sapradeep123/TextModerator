import React from 'react'
import { useTheme } from '../hooks/useTheme.js'

/** Top navigation bar with branding and theme toggle. */
function Navbar() {
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar__inner">
        {/* Brand */}
        <a href="/" className="navbar__brand" aria-label="Friendly Text Moderator home">
          <svg className="navbar__logo" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#6366f1" />
            <path
              d="M16 5L7 9v8c0 5 4 9.5 9 11 5-1.5 9-6 9-11V9l-9-4z"
              fill="white"
              fillOpacity="0.25"
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M12 16l2.5 2.5L20 13"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>TextModerator</span>
          <span className="navbar__badge">Beta</span>
        </a>

        {/* Actions */}
        <div className="navbar__actions">
          <a
            href="https://huggingface.co/unitary/toxic-bert"
            target="_blank"
            rel="noopener noreferrer"
            className="navbar__link"
            aria-label="View model on Hugging Face (opens in new tab)"
          >
            Model Docs
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="navbar__link"
            aria-label="View source on GitHub (opens in new tab)"
          >
            GitHub
          </a>

          {/* Dark / Light mode toggle */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? (
              /* Sun icon */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              /* Moon icon */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
