import 'server-only'
import { cache } from 'react'
import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import type { Ad, Category, Post, Video } from '@/payload-types'

export const getClient = cache(() => getPayload({ config }))

const published: Where = { _status: { equals: 'published' } }

export const getSettings = cache(async () => (await getClient()).findGlobal({ slug: 'site-settings', depth: 1 }))
export const getHomepage = cache(async () => (await getClient()).findGlobal({ slug: 'homepage', depth: 1 }))
export const getTicker = cache(async () => (await getClient()).findGlobal({ slug: 'ticker', depth: 0 }))

export const getCategories = cache(async () => {
  const r = await (await getClient()).find({ collection: 'categories', sort: 'order', limit: 100, depth: 0 })
  return r.docs as Category[]
})

export const getCategoryBySlug = cache(async (slug: string) => {
  const r = await (await getClient()).find({ collection: 'categories', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  return (r.docs[0] as Category) ?? null
})

type PostQuery = { category?: number | string; tag?: number | string; author?: number | string; featured?: boolean; breaking?: boolean; exclude?: (number | string)[]; search?: string }

function postWhere(q: PostQuery): Where {
  const and: Where[] = [published]
  if (q.category) and.push({ category: { equals: q.category } })
  if (q.tag) and.push({ tags: { contains: q.tag } })
  if (q.author) and.push({ author: { equals: q.author } })
  if (q.featured) and.push({ featured: { equals: true } })
  if (q.breaking) and.push({ breaking: { equals: true } })
  if (q.exclude?.length) and.push({ id: { not_in: q.exclude } })
  if (q.search) and.push({ or: [{ title: { like: q.search } }, { excerpt: { like: q.search } }] })
  return { and }
}

export async function getPosts(q: PostQuery & { limit?: number; page?: number } = {}) {
  const r = await (await getClient()).find({
    collection: 'posts',
    where: postWhere(q),
    sort: '-publishedAt',
    limit: q.limit ?? 12,
    page: q.page ?? 1,
    depth: 1,
    select: { title: true, slug: true, excerpt: true, featuredImage: true, category: true, author: true, publishedAt: true },
  })
  return { ...r, docs: r.docs as Post[] }
}

export const getPostBySlug = cache(async (slug: string, draft = false) => {
  const r = await (await getClient()).find({
    collection: 'posts',
    where: draft ? { slug: { equals: slug } } : { and: [{ slug: { equals: slug } }, published] },
    draft,
    limit: 1,
    depth: 2,
  })
  return (r.docs[0] as Post) ?? null
})

export async function getAdjacentPosts(post: Post) {
  const c = await getClient()
  const [prev, next] = await Promise.all([
    c.find({ collection: 'posts', where: { and: [published, { publishedAt: { less_than: post.publishedAt } }] }, sort: '-publishedAt', limit: 1, depth: 0, select: { title: true, slug: true } }),
    c.find({ collection: 'posts', where: { and: [published, { publishedAt: { greater_than: post.publishedAt } }] }, sort: 'publishedAt', limit: 1, depth: 0, select: { title: true, slug: true } }),
  ])
  return { prev: (prev.docs[0] as Post) ?? null, next: (next.docs[0] as Post) ?? null }
}

export async function getVideos(kind: 'tv' | 'short', limit = 5, page = 1) {
  const r = await (await getClient()).find({
    collection: 'videos',
    where: { and: [published, { kind: { equals: kind } }] },
    sort: '-publishedAt',
    limit,
    page,
    depth: 1,
  })
  return { ...r, docs: r.docs as Video[] }
}

export const getVideoBySlug = cache(async (slug: string) => {
  const r = await (await getClient()).find({ collection: 'videos', where: { and: [{ slug: { equals: slug } }, published] }, limit: 1, depth: 1 })
  return (r.docs[0] as Video) ?? null
})

export async function getAd(placement: Ad['placement']) {
  const now = new Date().toISOString()
  const r = await (await getClient()).find({
    collection: 'ads',
    where: {
      and: [
        { placement: { equals: placement } },
        { active: { equals: true } },
        { or: [{ startsAt: { exists: false } }, { startsAt: { less_than_equal: now } }] },
        { or: [{ endsAt: { exists: false } }, { endsAt: { greater_than: now } }] },
      ],
    },
    sort: '-priority',
    limit: 1,
    depth: 1,
  })
  return (r.docs[0] as Ad) ?? null
}

export async function getTickerItems() {
  const t = await getTicker()
  if (!t.enabled) return { label: t.label ?? 'شريط الأخبار', items: [] as { text: string; url?: string | null }[] }
  const count = t.count ?? 10
  const manual = (t.manualItems ?? []).map((m) => ({ text: m.text, url: m.url }))
  let posts: Post[] = []
  if (t.source === 'latest') posts = (await getPosts({ limit: count })).docs
  else {
    posts = (await getPosts({ breaking: true, limit: count })).docs
    if (t.source === 'breaking-then-latest' && posts.length < count) {
      const more = await getPosts({ limit: count - posts.length, exclude: posts.map((p) => p.id) })
      posts = posts.concat(more.docs)
    }
  }
  return { label: t.label ?? 'شريط الأخبار', items: [...manual, ...posts.map((p) => ({ text: p.title, url: `/${p.slug}` }))] }
}

export async function getApprovedComments(postId: number | string) {
  const r = await (await getClient()).find({
    collection: 'comments',
    where: { and: [{ post: { equals: postId } }, { approved: { equals: true } }] },
    sort: 'createdAt',
    limit: 100,
    depth: 0,
    overrideAccess: false,
  })
  return r.docs
}

export async function getPageBySlug(slug: string) {
  const r = await (await getClient()).find({ collection: 'pages', where: { and: [{ slug: { equals: slug } }, published] }, limit: 1, depth: 0 })
  return r.docs[0] ?? null
}
