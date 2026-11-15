import { getPosts, getSettings } from '@/lib/queries'
import { category, SITE_URL } from '@/lib/format'

const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!)

export async function GET() {
  const [s, { docs }] = await Promise.all([getSettings(), getPosts({ limit: 30 })])
  const items = docs
    .map((p) => {
      const url = `${SITE_URL}/${encodeURIComponent(p.slug!)}`
      return `<item><title>${esc(p.title)}</title><link>${url}</link><guid>${url}</guid><pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>${
        category(p.category) ? `<category>${esc(category(p.category)!.title)}</category>` : ''
      }<description>${esc(p.excerpt || '')}</description></item>`
    })
    .join('')
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(s.arabicName || '')}</title><link>${SITE_URL}</link><description>${esc(s.tagline || '')}</description><language>ar</language>${items}</channel></rss>`
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' } })
}
