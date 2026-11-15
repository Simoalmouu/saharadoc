import type { MetadataRoute } from 'next'
import { getCategories, getClient } from '@/lib/queries'
import { SITE_URL } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const c = await getClient()
  const [cats, posts, videos, pages] = await Promise.all([
    getCategories(),
    c.find({ collection: 'posts', where: { _status: { equals: 'published' } }, limit: 5000, depth: 0, select: { slug: true, updatedAt: true }, sort: '-publishedAt' }),
    c.find({ collection: 'videos', where: { _status: { equals: 'published' } }, limit: 2000, depth: 0, select: { slug: true, updatedAt: true } }),
    c.find({ collection: 'pages', where: { _status: { equals: 'published' } }, limit: 100, depth: 0, select: { slug: true, updatedAt: true } }),
  ])
  return [
    { url: SITE_URL, changeFrequency: 'hourly', priority: 1 },
    { url: `${SITE_URL}/tv`, changeFrequency: 'daily' },
    { url: `${SITE_URL}/shorts`, changeFrequency: 'daily' },
    ...cats.map((x) => ({ url: `${SITE_URL}/category/${encodeURIComponent(x.slug!)}`, changeFrequency: 'hourly' as const })),
    ...posts.docs.map((p) => ({ url: `${SITE_URL}/${encodeURIComponent(p.slug!)}`, lastModified: p.updatedAt })),
    ...videos.docs.map((v) => ({ url: `${SITE_URL}/video/${encodeURIComponent(v.slug!)}`, lastModified: v.updatedAt })),
    ...pages.docs.map((p) => ({ url: `${SITE_URL}/${encodeURIComponent(p.slug!)}`, lastModified: p.updatedAt })),
  ]
}
