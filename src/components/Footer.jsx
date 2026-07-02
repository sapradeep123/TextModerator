import React from 'react'

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Friendly Text Moderator'
const MODEL_ID  = import.meta.env.VITE_HF_MODEL_ID || 'unitary/toxic-bert'

/** Site footer with attribution and quick links. */
function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner">
        <p className="footer__copy">
          © {year} {APP_NAME} &mdash; Powered by{' '}
          <a
            href={`https://huggingface.co/${MODEL_ID}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {MODEL_ID}
          </a>{' '}
          on Hugging Face
        </p>

        <nav className="footer__links" aria-label="Footer navigation">
          <a
            className="footer__link"
            href="https://huggingface.co/docs/api-inference/index"
            target="_blank"
            rel="noopener noreferrer"
          >
            HF Inference API
          </a>
          <a
            className="footer__link"
            href="https://huggingface.co/settings/tokens"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get API Key
          </a>
          <a
            className="footer__link"
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  )
}

export default Footer
