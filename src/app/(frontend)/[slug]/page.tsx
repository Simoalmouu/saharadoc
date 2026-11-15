import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Post, Tag } from '@/payload-types'
import { AdSlot, Breadcrumbs, PostGrid, SectionHeading } from '@/components/Shared'
import { Sidebar } from '@/components/Sidebar'
import { TopArea } from '@/components/TopArea'
import { Icon } from '@/components/Icon'
import { Share } from '@/components/client/Share'
import { CommentForm } from '@/components/client/Forms'
import { author, category, decodeSlug, formatDate, formatTime, imgUrl, media, SITE_URL } from '@/lib/format'
import { getAdjacentPosts, getApprovedComments, getPageBySlug, getPostBySlug, getPosts, getSettings } from '@/lib/queries'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeSlug((await params).slug)
  const post = await getPostBySlug(slug)
  if (!post) {
    const page = await getPageBySlug(slug)
    return page ? { title: page.title } : {}
  }
  const img = imgUrl(post.featuredImage, 'hero')
  return {
    title: post.title,
    description: post.excerpt || undefined,
    alternates: { canonical: `/${post.slug}` },
    openGraph: { type: 'article', title: post.title, description: post.excerpt || undefined, publishedTime: post.publishedAt, images: img ? [{ url: img }] : undefined },
    twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt || undefined, images: img ? [img] : undefined },
  }
}

export default async function SlugPage({ params }: Props) {
  const slug = decodeSlug((await params).slug)
  const { isEnabled: draft } = await draftMode()
  const post = await getPostBySlug(slug, draft)
  if (post) return <Article post={post} />

  const page = await getPageBySlug(slug)
  if (!page) notFound()
  return (
    <div className="container">
      <article className="article-card page-card">
        <Breadcrumbs items={[{ label: 'الرئيسية', href: '/' }, { label: page.title }]} />
        <h1 className="article-title">{page.title}</h1>
        {page.content && <RichText data={page.content} className="prose" />}
      </article>
    </div>
  )
}

async function Article({ post }: { post: Post }) {
  const cat = category(post.category)
  const auth = author(post.author)
  const img = media(post.featuredImage)
  const tags = (post.tags ?? []).filter((t): t is Tag => typeof t === 'object')
  const url = `${SITE_URL}/${post.slug}`

  const [related, adjacent, comments, s] = await Promise.all([
    cat ? getPosts({ category: cat.id, exclude: [post.id], limit: 4 }) : getPosts({ exclude: [post.id], limit: 4 }),
    getAdjacentPosts(post),
    getApprovedComments(post.id),
    getSettings(),
  ])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: post.excerpt,
    image: img?.url ? [`${SITE_URL}${img.url}`] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: auth ? { '@type': 'Person', name: auth.name, url: `${SITE_URL}/author/${auth.slug}` } : undefined,
    publisher: { '@type': 'NewsMediaOrganization', name: s.arabicName, logo: { '@type': 'ImageObject', url: `${SITE_URL}/brand/logo.png` } },
    mainEntityOfPage: url,
    articleSection: cat?.title,
    inLanguage: 'ar',
  }
  const crumbsLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: s.arabicName, item: SITE_URL },
      ...(cat ? [{ '@type': 'ListItem', position: 2, name: cat.title, item: `${SITE_URL}/category/${cat.slug}` }] : []),
      { '@type': 'ListItem', position: cat ? 3 : 2, name: post.title },
    ],
  }

  return (
    <>
      <TopArea />
      <Share url={url} title={post.title} variant="rail" />
      <div className="container article-layout">
        <article className="article-card">
          <Breadcrumbs items={[{ label: s.arabicName || 'الرئيسية', href: '/' }, ...(cat ? [{ label: cat.title, href: `/category/${cat.slug}` }] : [])]} />
          <h1 className="article-title">{post.title}</h1>

          {img?.url && (
            <figure className="article-figure">
              <div className="img-wrap">
                <Image src={imgUrl(img, 'hero')!} alt={img.alt || post.title} fill priority sizes="(max-width: 900px) 100vw, 780px" style={{ objectPosition: `${img.focalX ?? 50}% ${img.focalY ?? 50}%` }} />
              </div>
              {(post.imageCaption || img.credit) && <figcaption>{[post.imageCaption, img.credit && `© ${img.credit}`].filter(Boolean).join(' — ')}</figcaption>}
            </figure>
          )}

          <div className="article-meta">
            {auth && (
              <span className="meta-author">
                <Icon name="user" size={15} /> <Link href={`/author/${auth.slug}`}>{auth.name}</Link>
              </span>
            )}
            <span>
              <Icon name="calendar" size={15} /> <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            </span>
            <span>
              <Icon name="clock" size={15} /> {formatTime(post.publishedAt)}
            </span>
          </div>

          <Share url={url} title={post.title} variant="inline" />

          {post.content && <RichText data={post.content} className="prose" />}

          <AdSlot placement="article-inline" />

          {tags.length > 0 && (
            <div className="tags">
              <Icon name="tag" size={16} />
              {tags.map((t) => (
                <Link key={t.id} href={`/tag/${t.slug}`} rel="tag">
                  {t.title}
                </Link>
              ))}
            </div>
          )}

          {(adjacent.prev || adjacent.next) && (
            <nav className="post-nav" aria-label="مقالات أخرى">
              {adjacent.next ? (
                <Link href={`/${adjacent.next.slug}`} rel="next">
                  <small>المقال التالي</small>
                  {adjacent.next.title}
                </Link>
              ) : (
                <span />
              )}
              {adjacent.prev ? (
                <Link href={`/${adjacent.prev.slug}`} rel="prev" className="next">
                  <small>المقال السابق</small>
                  {adjacent.prev.title}
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}

          {related.docs.length > 0 && (
            <section className="related related-heading">
              <SectionHeading icon="news">مقالات ذات صلة</SectionHeading>
              <PostGrid posts={related.docs} />
            </section>
          )}

          <section className="comments related-heading" id="comments">
            <SectionHeading icon="comment">{comments.length ? `التعليقات (${comments.length})` : 'اترك تعليقاً'}</SectionHeading>
            {comments.length > 0 && (
              <ol className="comment-list">
                {comments.map((c) => (
                  <li key={c.id}>
                    <strong>{c.name}</strong>
                    <time dateTime={c.createdAt}>{formatDate(c.createdAt)}</time>
                    <p>{c.body}</p>
                  </li>
                ))}
              </ol>
            )}
            <CommentForm postId={post.id} />
          </section>
        </article>
        <Sidebar />
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, crumbsLd]) }} />
    </>
  )
}
