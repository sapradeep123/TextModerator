import { useContext } from 'react'
import { ThemeContext } from '../App.jsx'

/**
 * Convenience hook for consuming ThemeContext.
 * @returns {{ theme: 'light'|'dark', toggleTheme: () => void }}
 */
export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <App> (ThemeContext provider)')
  return ctx
}
