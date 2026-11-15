'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '../Icon'

export type Slide = { id: number | string; title: string; href: string; img: string | null; alt: string; focal: string }

/** Featured-news slider: title above image, arrows on the image, dots at the bottom. Swipe-enabled. */
export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0)
  const n = slides.length
  const go = useCallback((d: number) => setI((x) => (x + d + n) % n), [n])
  const hover = useRef(false)
  const touchX = useRef<number | null>(null)

  useEffect(() => {
    if (n < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => !hover.current && go(1), 6000)
    return () => clearInterval(t)
  }, [go, n])

  if (!n) return null
  const s = slides[i]

  return (
    <div
      className="hero-slider"
      onMouseEnter={() => (hover.current = true)}
      onMouseLeave={() => (hover.current = false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 40) go(dx > 0 ? 1 : -1) // RTL: swipe right = next
        touchX.current = null
      }}
      aria-roledescription="carousel"
      aria-label="أبرز الأخبار"
    >
      <h2 className="hero-title">
        <Link href={s.href}>{s.title}</Link>
      </h2>
      <div className="hero-frame">
        {slides.map((sl, k) =>
          sl.img ? (
            <Link key={sl.id} href={sl.href} className={`hero-slide ${k === i ? 'on' : ''}`} aria-hidden={k !== i} tabIndex={k === i ? 0 : -1}>
              <Image src={sl.img} alt={sl.alt} fill priority={k === 0} loading={k === 0 ? undefined : 'lazy'} sizes="(max-width: 768px) 100vw, 620px" style={{ objectPosition: sl.focal }} />
            </Link>
          ) : null,
        )}
        {n > 1 && (
          <>
            <button type="button" className="hero-arrow next" onClick={() => go(1)} aria-label="الشريحة التالية">
              <Icon name="chevronRight" size={22} />
            </button>
            <button type="button" className="hero-arrow prev" onClick={() => go(-1)} aria-label="الشريحة السابقة">
              <Icon name="chevronLeft" size={22} />
            </button>
            <div className="hero-dots" role="tablist">
              {slides.map((sl, k) => (
                <button key={sl.id} type="button" role="tab" aria-selected={k === i} aria-label={`الشريحة ${k + 1}`} className={k === i ? 'on' : ''} onClick={() => setI(k)} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
