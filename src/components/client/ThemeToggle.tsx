'use client'
import { useEffect, useState } from 'react'
import { Icon } from '../Icon'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null)
  useEffect(() => setTheme((document.documentElement.dataset.theme as 'light' | 'dark') || 'light'), [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('theme', next)
    } catch {}
    setTheme(next)
  }

  return (
    <button type="button" className="circle-btn theme-btn" onClick={toggle} aria-label={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الليلي'}>
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
    </button>
  )
}
