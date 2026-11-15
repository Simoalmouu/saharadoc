'use client'
import { useEffect, useState } from 'react'
import { Icon } from '../Icon'

export function ProgressBar() {
  const [p, setP] = useState(0)
  useEffect(() => {
    const on = () => {
      const h = document.documentElement.scrollHeight - innerHeight
      setP(h > 0 ? Math.min(100, (scrollY / h) * 100) : 0)
    }
    on()
    addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])
  return <div className="progress-bar" style={{ width: `${p}%` }} aria-hidden="true" />
}

/** Only shown after scrolling, so it never covers the first screen of content. */
export function BackToTop() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const on = () => setShow(scrollY > 600)
    on()
    addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])
  return (
    <button type="button" className={`back-to-top ${show ? 'show' : ''}`} onClick={() => scrollTo({ top: 0, behavior: 'smooth' })} aria-label="العودة إلى الأعلى" tabIndex={show ? 0 : -1}>
      <Icon name="chevronUp" size={24} />
    </button>
  )
}
