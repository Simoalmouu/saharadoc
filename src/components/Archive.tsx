import Link from 'next/link'
import { getPosts } from '@/lib/queries'
import { PostGrid, SectionHeading } from './Shared'
import { TopArea } from './TopArea'
import { LoadMore } from './client/LoadMore'

export { PER_PAGE } from '@/lib/format'
import { PER_PAGE } from '@/lib/format'

type Filter = { category?: number | string; tag?: number | string; author?: number | string; search?: string }

/** Shared layout for category / tag / author / search: banner, heading, 3-column card grid, load-more + pagination. */
export async function Archive({
  title,
  description,
  filter,
  page,
  basePath,
  icon,
}: {
  title: string
  description?: string | null
  filter: Filter
  page: number
  basePath: string
  icon?: string | null
}) {
  const res = await getPosts({ ...filter, limit: PER_PAGE, page })
  const qs = new URLSearchParams(Object.entries(filter).filter(([, v]) => v != null && v !== '').map(([k, v]) => [k, String(v)])).toString()
  const pageHref = (n: number) => {
    const u = new URLSearchParams(basePath.split('?')[1] || '')
    if (n > 1) u.set('page', String(n))
    const q = u.toString()
    return basePath.split('?')[0] + (q ? `?${q}` : '')
  }

  return (
    <>
      <TopArea />
      <section className="archive">
        <div className="container container-narrow">
          <SectionHeading as="h1" icon={icon}>{title}</SectionHeading>
          {description && <p className="archive-desc">{description}</p>}
          {res.docs.length ? <PostGrid posts={res.docs} /> : <p className="empty">لا توجد مقالات بعد.</p>}
          <LoadMore query={qs} startPage={page} totalPages={res.totalPages} />
          {res.totalPages > 1 && (
            <noscript>
            <nav aria-label="صفحات" style={{ marginTop: 22 }}>
              <ul className="pagination">
                {Array.from({ length: res.totalPages }, (_, i) => i + 1).map((n) => (
                  <li key={n}>
                    {n === page ? <span aria-current="page">{n}</span> : <Link href={pageHref(n)}>{n}</Link>}
                  </li>
                ))}
              </ul>
            </nav>
            </noscript>
          )}
        </div>
      </section>
    </>
  )
}

export const pageNum = (v: unknown) => Math.max(1, parseInt(String(v || '1'), 10) || 1)
