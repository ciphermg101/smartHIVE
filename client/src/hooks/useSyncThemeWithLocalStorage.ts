import { useEffect } from 'react'

export function useSyncThemeWithLocalStorage() {
  useEffect(() => {
    function applyThemeFromStorage() {
      const stored = localStorage.getItem('theme')
      if (stored === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    applyThemeFromStorage()
    // Listen for changes from other tabs/windows
    window.addEventListener('storage', applyThemeFromStorage)
    return () => {
      window.removeEventListener('storage', applyThemeFromStorage)
    }
  }, [])
} 