import Image from 'next/image'
import Link from 'next/link'
import type { Ad, Post } from '@/payload-types'
import { media } from '@/lib/format'
import { OverlayCard } from './Cards'
export { OverlayCard, VideoCard, ListCard, Timeline } from './Cards'
import { getAd } from '@/lib/queries'
import { Icon } from './Icon'

/** "—— [ Title ] ——" section label used everywhere on the reference design. */
export function SectionHeading({ children, href, icon, as: Tag = 'h2' }: { children: React.ReactNode; href?: string; icon?: string | null; as?: 'h1' | 'h2' }) {
  const label = (
    <>
      {icon && icon !== 'none' ? <Icon name={icon} size={18} /> : null}
      {children}
    </>
  )
  return (
    <div className="section-heading">
      <Tag className="section-heading-label">{href ? <Link href={href}>{label}</Link> : label}</Tag>
    </div>
  )
}

export async function AdSlot({ placement, className = '' }: { placement: Ad['placement']; className?: string }) {
  const ad = await getAd(placement)
  if (!ad) return null
  if (ad.type === 'code' && ad.code) {
    return <div className={`ad-slot ad-${placement} ${className}`} dangerouslySetInnerHTML={{ __html: ad.code }} />
  }
  const img = media(ad.image)
  if (!img?.url) return null
  const inner = (
    <Image src={img.url} alt={img.alt || ad.name} width={img.width || 1170} height={img.height || 250} sizes="(max-width: 1200px) 100vw, 1170px" priority={placement === 'top-banner'} />
  )
  return (
    <div className={`ad-slot ad-${placement} ${className}`}>
      {ad.link ? (
        <a href={ad.link} {...(ad.link.startsWith('http') ? { target: '_blank', rel: 'noopener sponsored' } : {})}>
          {inner}
        </a>
      ) : (
        inner
      )}
    </div>
  )
}

export function PostGrid({ posts }: { posts: Post[] }) {
  return (
    <div className="post-grid">
      {posts.map((p, i) => (
        <OverlayCard key={p.id} post={p} priority={i < 3} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px" />
      ))}
    </div>
  )
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="مسار التنقل" className="breadcrumbs">
      <ol>
        {items.map((it, i) => (
          <li key={i}>{it.href ? <Link href={it.href}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}</li>
        ))}
      </ol>
    </nav>
  )
}
