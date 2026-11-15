import { NextResponse, type NextRequest } from 'next/server'
import { getPosts } from '@/lib/queries'
import { PER_PAGE } from '@/lib/format'

/** JSON feed for the "تحميل المزيد" button. Only published posts; fields limited to what cards need. */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  const page = Math.max(1, Math.min(500, Number(p.get('page')) || 1))
  const res = await getPosts({
    category: p.get('category') || undefined,
    tag: p.get('tag') || undefined,
    author: p.get('author') || undefined,
    search: p.get('search')?.slice(0, 100) || undefined,
    limit: PER_PAGE,
    page,
  })
  return NextResponse.json({ docs: res.docs, totalPages: res.totalPages, page }, { headers: { 'Cache-Control': 'public, max-age=60' } })
}
