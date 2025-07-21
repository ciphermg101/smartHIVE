import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'

export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggleTheme() {
    const html = document.documentElement
    if (html.classList.contains('dark')) {
      html.classList.remove('dark')
      setIsDark(false)
      localStorage.setItem('theme', 'light')
    } else {
      html.classList.add('dark')
      setIsDark(true)
      localStorage.setItem('theme', 'dark')
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'dark') {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    } else if (stored === 'light') {
      document.documentElement.classList.remove('dark')
      setIsDark(false)
    }
  }, [])

  return (
    <Toggle
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      pressed={isDark}
      onClick={toggleTheme}
      className={className}
      variant="outline"
      size="default"
    >
      {isDark ? <Sun className="text-yellow-400" /> : <Moon className="text-blue-600" />}
      <span className="sr-only">Toggle theme</span>
    </Toggle>
  )
} 