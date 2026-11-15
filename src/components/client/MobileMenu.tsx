'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Icon } from '../Icon'
import type { NavItem } from '../Header'

/**
 * Hamburger + off-canvas drawer. The drawer is `display:none` until opened, so (unlike the
 * reference site) it can never cause horizontal scrolling.
 */
export function MobileMenu({ items, socials, logo, name }: { items: NavItem[]; socials: { k: string; url: string; label: string }[]; logo: string; name: string }) {
  const [open, setOpen] = useState(false)
  const path = usePathname()
  useEffect(() => setOpen(false), [path])
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <button type="button" className="menu-btn" onClick={() => setOpen(true)} aria-label="القائمة" aria-expanded={open} aria-controls="drawer">
        <Icon name="menu" size={24} />
      </button>
      {open && (
        <div className="drawer-backdrop" onClick={() => setOpen(false)}>
          <aside id="drawer" className="drawer" onClick={(e) => e.stopPropagation()} aria-label="القائمة">
            <div className="drawer-head">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo} alt={name} height={48} />
              <button type="button" className="circle-btn" onClick={() => setOpen(false)} aria-label="إغلاق القائمة">
                <Icon name="close" size={20} />
              </button>
            </div>
            <ul className="drawer-links">
              {items.map((it) => (
                <li key={it.href}>
                  <Link href={it.href}>{it.label}</Link>
                </li>
              ))}
            </ul>
            <div className="drawer-social">
              {socials.map((s) => (
                <a key={s.k} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="circle-btn">
                  <Icon name={s.k} size={18} />
                </a>
              ))}
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
