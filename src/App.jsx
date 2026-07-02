import React, { createContext, useState, useCallback, useEffect } from 'react'
import Home from './pages/Home.jsx'
import Toast from './components/Toast.jsx'

/** Theme context — exposes the active theme and a toggle function. */
export const ThemeContext = createContext(null)

/** Toast context — exposes addToast for firing notifications from any component. */
export const ToastContext = createContext(null)

function App() {
  // Initialise theme from localStorage, or from the OS preference
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('ftm-theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const [toasts, setToasts] = useState([])

  // Sync theme attribute on <html> and persist choice
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('ftm-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ToastContext.Provider value={{ addToast }}>
        <Home />
        <Toast toasts={toasts} onRemove={removeToast} />
      </ToastContext.Provider>
    </ThemeContext.Provider>
  )
}

export default App
