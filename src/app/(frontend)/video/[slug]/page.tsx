import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Breadcrumbs, SectionHeading, VideoCard } from '@/components/Shared'
import { Sidebar } from '@/components/Sidebar'
import { TopArea } from '@/components/TopArea'
import { Share } from '@/components/client/Share'
import { decodeSlug, formatDate, imgUrl, media, SITE_URL, youTubeId } from '@/lib/format'
import { getVideoBySlug, getVideos } from '@/lib/queries'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const v = await getVideoBySlug(decodeSlug((await params).slug))
  if (!v) return {}
  const img = imgUrl(v.thumbnail, 'hero')
  return { title: v.title, description: v.description || undefined, openGraph: { type: 'video.other', images: img ? [{ url: img }] : undefined } }
}

export default async function VideoPage({ params }: Props) {
  const v = await getVideoBySlug(decodeSlug((await params).slug))
  if (!v) notFound()
  const vertical = v.kind === 'short'
  const yt = youTubeId(v.youtubeUrl)
  const file = media(v.file)
  const thumb = media(v.thumbnail)
  const more = (await getVideos(v.kind, 7)).docs.filter((x) => x.id !== v.id).slice(0, 6)
  const url = `${SITE_URL}/video/${v.slug}`
  const hub = vertical ? { label: 'سوشيال ملفات', href: '/shorts' } : { label: 'ملفات TV', href: '/tv' }

  return (
    <>
      <TopArea />
      <Share url={url} title={v.title} variant="rail" />
      <div className="container article-layout">
        <article className="article-card">
          <Breadcrumbs items={[{ label: 'الرئيسية', href: '/' }, hub]} />
          <h1 className="article-title">{v.title}</h1>
          <div className={`player ${vertical ? 'vertical' : ''}`}>
            {yt ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${yt}`}
                title={v.title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : file?.url && file.mimeType?.startsWith('video/') ? (
              <video src={file.url} controls preload="metadata" poster={thumb?.url || undefined} playsInline />
            ) : v.youtubeUrl ? (
              <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer" className="player-poster">
                {thumb?.url && <Image src={thumb.url} alt={thumb.alt || v.title} fill sizes="780px" />}
                <span className="player-note">▶ مشاهدة الفيديو على المنصة الأصلية</span>
              </a>
            ) : (
              <div className="player-poster">
                {thumb?.url && <Image src={thumb.url} alt={thumb.alt || v.title} fill priority sizes="780px" />}
                <span className="player-note">سيتوفر الفيديو قريباً.</span>
              </div>
            )}
          </div>
          <div className="article-meta">
            <span>{formatDate(v.publishedAt)}</span>
          </div>
          <Share url={url} title={v.title} variant="inline" />
          {v.description && <div className="prose"><p>{v.description}</p></div>}
          {more.length > 0 && (
            <section className="related related-heading">
              <SectionHeading icon="tv">فيديوهات أخرى</SectionHeading>
              <div className={`video-grid ${vertical ? 'shorts' : ''}`} style={{ gridTemplateColumns: undefined }}>
                {more.map((x) => (
                  <VideoCard key={x.id} video={x} vertical={vertical} />
                ))}
              </div>
            </section>
          )}
        </article>
        <Sidebar />
      </div>
    </>
  )
}
