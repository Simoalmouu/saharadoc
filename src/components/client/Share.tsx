'use client'
import { useState } from 'react'
import { Icon } from '../Icon'

export function Share({ url, title, variant }: { url: string; title: string; variant: 'rail' | 'inline' }) {
  const [copied, setCopied] = useState(false)
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)
  const links = [
    { k: 'facebook', label: 'فيسبوك', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { k: 'x', label: 'إكس', href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { k: 'whatsapp', label: 'واتساب', href: `https://wa.me/?text=${t}%20${u}` },
  ]
  return (
    <div className={`share ${variant === 'rail' ? 'share-rail' : 'share-inline'}`} aria-label="شارك المقال">
      <span className="share-label">شارك:</span>
      {links.map((l) => (
        <a key={l.k} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={`شارك عبر ${l.label}`}>
          <Icon name={l.k} size={18} />
        </a>
      ))}
      <button
        type="button"
        aria-label={copied ? 'تم نسخ الرابط' : 'نسخ الرابط'}
        title={copied ? 'تم النسخ' : 'نسخ الرابط'}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          } catch {}
        }}
      >
        <Icon name={copied ? 'info' : 'link'} size={18} />
      </button>
    </div>
  )
}
