'use client'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { Icon } from '../Icon'

type Item = { text: string; url?: string | null }

/**
 * Continuous RTL marquee (items drift toward the left, like the reference). Pauses on hover/focus;
 * arrows nudge the track. Respects prefers-reduced-motion.
 */
export function Ticker({ label, items, logo }: { label: string; items: Item[]; logo: string }) {
  const track = useRef<HTMLDivElement>(null)
  const offset = useRef(0)
  const paused = useRef(false)

  useEffect(() => {
    const el = track.current
    if (!el) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let last = performance.now()
    const step = (t: number) => {
      const dt = t - last
      last = t
      const half = el.scrollWidth / 2
      if (!paused.current && !reduce) offset.current += dt * 0.045
      if (offset.current >= half) offset.current -= half
      if (offset.current < 0) offset.current += half
      el.style.transform = `translateX(${offset.current}px)`
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  if (!items.length) return null
  const nudge = (d: number) => (offset.current += d)
  const list = [...items, ...items] // duplicated for a seamless loop

  return (
    <div className="container">
      <div className="ticker" onMouseEnter={() => (paused.current = true)} onMouseLeave={() => (paused.current = false)} onFocus={() => (paused.current = true)} onBlur={() => (paused.current = false)}>
        <div className="ticker-label">
          <Icon name="news" size={16} /> <span>{label}</span>
        </div>
        <div className="ticker-viewport" aria-live="off">
          <div className="ticker-track" ref={track}>
            {list.map((it, i) => (
              <span className="ticker-item" key={i} aria-hidden={i >= items.length || undefined}>
                <span className="ticker-chip">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logo} alt="" width={46} height={25} />
                </span>
                {it.url ? (
                  <Link href={it.url} tabIndex={i >= items.length ? -1 : undefined}>
                    {it.text}
                  </Link>
                ) : (
                  <span>{it.text}</span>
                )}
              </span>
            ))}
          </div>
        </div>
        <div className="ticker-arrows">
          <button type="button" onClick={() => nudge(-260)} aria-label="الخبر السابق">
            <Icon name="chevronRight" size={20} />
          </button>
          <button type="button" onClick={() => nudge(260)} aria-label="الخبر التالي">
            <Icon name="chevronLeft" size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
