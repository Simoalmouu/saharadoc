import type { Media, Post, Category, Author, Video } from '@/payload-types'

const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر']
const TZ = 'Africa/Casablanca'

function parts(iso: string) {
  const d = new Date(iso)
  const f = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    year: 'numeric',
    month: 'numeric',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d)
  const g = (t: string) => f.find((p) => p.type === t)?.value ?? ''
  return { day: g('day'), month: Number(g('month')), year: g('year'), hour: g('hour'), minute: g('minute') }
}

/** "15 نونبر 2026" */
export const formatDate = (iso?: string | null) => {
  if (!iso) return ''
  const p = parts(iso)
  return `${p.day} ${MONTHS[p.month - 1]} ${p.year}`
}
/** "12:21" */
export const formatTime = (iso?: string | null) => {
  if (!iso) return ''
  const p = parts(iso)
  return `${p.hour}:${p.minute}`
}

export const isObj = <T extends object>(v: unknown): v is T => typeof v === 'object' && v !== null

export const media = (m: unknown): Media | null => (isObj<Media>(m) && 'url' in m ? m : null)
export const imgUrl = (m: unknown, size?: 'thumb' | 'card' | 'hero') => {
  const x = media(m)
  if (!x) return null
  return (size && x.sizes?.[size]?.url) || x.url || null
}
export const category = (c: unknown): Category | null => (isObj<Category>(c) && 'title' in c ? c : null)
export const author = (a: unknown): Author | null => (isObj<Author>(a) && 'name' in a ? a : null)

export const postHref = (p: Pick<Post, 'slug'>) => `/${p.slug}`
export const videoHref = (v: Pick<Video, 'slug'>) => `/video/${v.slug}`
export const categoryHref = (c: Pick<Category, 'slug'>) => `/category/${c.slug}`

/** Next.js gives route params still percent-encoded for non-ASCII slugs. */
export const decodeSlug = (s: string) => {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}

export function youTubeId(url?: string | null) {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|v=|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/)
  return m ? m[1] : null
}

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

export const PER_PAGE = 12
