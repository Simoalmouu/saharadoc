'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import type { NavItem } from '../Header'

/** Desktop: centred row. Mobile: horizontally scrollable chip row (fixes the empty mobile nav bar). */
export function NavLinks({ items }: { items: NavItem[] }) {
  const path = decodeURI(usePathname() || '/')
  const ref = useRef<HTMLUListElement>(null)
  const isActive = (href: string) => (href === '/' ? path === '/' : path === href || path.startsWith(href + '/'))

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('.active')?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [path])

  return (
    <ul className="nav-links" ref={ref}>
      {items.map((it) => (
        <li key={it.href}>
          <Link href={it.href} className={isActive(it.href) ? 'active' : undefined} aria-current={isActive(it.href) ? 'page' : undefined}>
            {it.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
