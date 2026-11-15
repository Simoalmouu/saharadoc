import Image from "next/image"
import Link from "next/link"
import type { Post, Video } from "@/payload-types"
import { category, formatDate, formatTime, imgUrl, media, postHref, videoHref } from "@/lib/format"
import { Icon } from "./Icon"

/** Image card with title/date overlaid on a bottom gradient. */
export function OverlayCard({
  post,
  size = 'sm',
  priority = false,
  sizes = '(max-width: 768px) 100vw, 300px',
}: {
  post: Post
  size?: 'sm' | 'lg'
  priority?: boolean
  sizes?: string
}) {
  const img = media(post.featuredImage)
  return (
    <article className={`ocard ocard-${size}`}>
      <Link href={postHref(post)} className="ocard-link">
        {img?.url && (
          <Image
            src={imgUrl(img, size === 'lg' ? 'hero' : 'card')!}
            alt={img.alt || post.title}
            fill
            sizes={sizes}
            priority={priority}
            className="ocard-img"
            style={{ objectPosition: `${img.focalX ?? 50}% ${img.focalY ?? 50}%` }}
          />
        )}
        <div className="ocard-body">
          <time className="ocard-date" dateTime={post.publishedAt}>
            {formatDate(post.publishedAt)} &nbsp; {formatTime(post.publishedAt)}
          </time>
          <h3 className="ocard-title">{post.title}</h3>
        </div>
      </Link>
    </article>
  )
}

export function VideoCard({ video, size = 'sm', vertical = false }: { video: Video; size?: 'sm' | 'lg'; vertical?: boolean }) {
  const img = media(video.thumbnail)
  return (
    <article className={`ocard vcard ocard-${size} ${vertical ? 'vcard-vertical' : ''}`}>
      <Link href={videoHref(video)} className="ocard-link">
        {img?.url && vertical && <Image src={imgUrl(img, 'thumb')!} alt="" fill sizes="300px" className="vcard-blur" aria-hidden />}
        {img?.url && (
          <Image
            src={imgUrl(img, size === 'lg' ? 'hero' : 'card')!}
            alt={img.alt || video.title}
            fill
            sizes={size === 'lg' ? '(max-width: 768px) 100vw, 620px' : '(max-width: 768px) 100vw, 300px'}
            className={vertical ? 'vcard-img-vertical' : 'ocard-img'}
          />
        )}
        <div className="ocard-body">
          <span className="play-badge" aria-hidden>
            <Icon name="play" size={size === 'lg' ? 22 : 16} />
          </span>
          <div>
            <time className="ocard-date" dateTime={video.publishedAt}>
              {formatDate(video.publishedAt)} &nbsp; {formatTime(video.publishedAt)}
            </time>
            <h3 className="ocard-title">{video.title}</h3>
          </div>
        </div>
      </Link>
    </article>
  )
}

/** Thumbnail beside title — used for mobile lists, related posts, search results. */
export function ListCard({ post }: { post: Post }) {
  const img = media(post.featuredImage)
  const cat = category(post.category)
  return (
    <article className="lcard">
      <Link href={postHref(post)} className="lcard-thumb" tabIndex={-1} aria-hidden>
        {img?.url && <Image src={imgUrl(img, 'thumb')!} alt="" fill sizes="140px" />}
      </Link>
      <div className="lcard-body">
        {cat && <span className="lcard-cat">{cat.title}</span>}
        <h3>
          <Link href={postHref(post)}>{post.title}</Link>
        </h3>
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
      </div>
    </article>
  )
}

/** Red time badge + headline — "على مدار الساعة". */
export function Timeline({ posts }: { posts: Post[] }) {
  return (
    <ol className="timeline">
      {posts.map((p) => (
        <li key={p.id}>
          <time className="time-badge" dateTime={p.publishedAt}>{formatTime(p.publishedAt)}</time>
          <Link href={postHref(p)}>{p.title}</Link>
        </li>
      ))}
    </ol>
  )
}

