import Link from 'next/link'
import { getVideos } from '@/lib/queries'
import { SectionHeading, VideoCard } from './Shared'
import { TopArea } from './TopArea'

export async function VideoHub({ kind, title, page }: { kind: 'tv' | 'short'; title: string; page: number }) {
  const res = await getVideos(kind, 12, page)
  const base = kind === 'tv' ? '/tv' : '/shorts'
  return (
    <>
      <TopArea />
      <section className="archive">
        <div className="container container-narrow">
          <SectionHeading as="h1" icon="tv">{title}</SectionHeading>
          {res.docs.length ? (
            <div className={`video-grid ${kind === 'short' ? 'shorts' : ''}`}>
              {res.docs.map((v) => (
                <VideoCard key={v.id} video={v} vertical={kind === 'short'} />
              ))}
            </div>
          ) : (
            <p className="empty">لا توجد فيديوهات بعد.</p>
          )}
          {res.totalPages > 1 && (
            <nav aria-label="صفحات" style={{ marginTop: 26 }}>
              <ul className="pagination">
                {Array.from({ length: res.totalPages }, (_, i) => i + 1).map((n) => (
                  <li key={n}>{n === page ? <span aria-current="page">{n}</span> : <Link href={n > 1 ? `${base}?page=${n}` : base}>{n}</Link>}</li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </section>
    </>
  )
}
