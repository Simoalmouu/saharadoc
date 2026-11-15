import Image from 'next/image'
import Link from 'next/link'
import type { Category, Homepage, Post } from '@/payload-types'
import { category, categoryHref, imgUrl, media, postHref } from '@/lib/format'
import { getPosts, getSettings, getVideos } from '@/lib/queries'
import { AdSlot, ListCard, OverlayCard, SectionHeading, Timeline, VideoCard } from './Shared'
import { HeroSlider, type Slide } from './client/HeroSlider'
import { PrayerWidget, WeatherWidget } from './client/Widgets'

type Section = NonNullable<Homepage['sections']>[number]
type Of<T extends Section['blockType']> = Extract<Section, { blockType: T }>

const catOf = (c: unknown) => category(c)
const Band = ({ bg, children, className = '' }: { bg?: string | null; children: React.ReactNode; className?: string }) => (
  <section className={`home-band ${bg === 'red' ? 'band-red' : ''} ${className}`}>
    <div className="container">{children}</div>
  </section>
)

/* ───────── Hero: timeline | slider | text teasers ───────── */
async function Hero({ b }: { b: Of<'hero'> }) {
  const [latest, featured] = await Promise.all([getPosts({ limit: b.timelineCount ?? 8 }), getPosts({ featured: true, limit: b.sliderCount ?? 10 })])
  const sliderPosts = featured.docs.length ? featured.docs : latest.docs.slice(0, 5)
  const slides: Slide[] = sliderPosts.map((p) => {
    const m = media(p.featuredImage)
    return { id: p.id, title: p.title, href: postHref(p), img: imgUrl(m, 'hero'), alt: m?.alt || p.title, focal: `${m?.focalX ?? 50}% ${m?.focalY ?? 50}%` }
  })
  const teaserCats = (b.teaserCategories ?? []).map(catOf).filter(Boolean) as Category[]
  const teasers = await Promise.all(teaserCats.map(async (c) => ({ c, p: (await getPosts({ category: c.id, limit: 1 })).docs[0] })))

  return (
    <section className="home-band hero-band">
      <div className="container hero-grid">
        <div className="hero-col hero-timeline">
          <SectionHeading>{b.timelineTitle || 'على مدار الساعة'}</SectionHeading>
          <Timeline posts={latest.docs} />
        </div>
        <div className="hero-col hero-center">
          <HeroSlider slides={slides} />
        </div>
        <div className="hero-col hero-teasers">
          {teasers.map(({ c, p }) =>
            p ? (
              <div key={c.id} className="teaser">
                <SectionHeading href={categoryHref(c)}>{c.title}</SectionHeading>
                <Link href={postHref(p)} className="teaser-text">
                  <strong className="sr-only">{p.title}</strong>
                  {p.excerpt}
                </Link>
              </div>
            ) : null,
          )}
        </div>
      </div>
    </section>
  )
}

/* ───────── 1 large + 4 small (desktop) / 1 large + 4 list rows (mobile) ───────── */
function OnePlusFour({ items, render, renderList }: { items: any[]; render: (x: any, size: 'sm' | 'lg') => React.ReactNode; renderList?: (x: any) => React.ReactNode }) {
  const [big, ...rest] = items
  const right = rest.slice(0, 2)
  const left = rest.slice(2, 4)
  return (
    <div className="one-plus-four">
      <div className="opf-side opf-right">{right.map((x) => render(x, 'sm'))}</div>
      <div className="opf-main">{big && render(big, 'lg')}</div>
      <div className="opf-side opf-left">{left.map((x) => render(x, 'sm'))}</div>
      {renderList && <div className="opf-mobile-list">{rest.map((x) => renderList(x))}</div>}
    </div>
  )
}

async function CategoryBlock({ b }: { b: Of<'categoryBlock'> }) {
  const c = catOf(b.category)
  if (!c) return null
  const { docs } = await getPosts({ category: c.id, limit: 5 })
  if (!docs.length) return null
  return (
    <Band bg={b.background}>
      <SectionHeading href={categoryHref(c)} icon={c.icon}>{b.title || c.title}</SectionHeading>
      <OnePlusFour
        items={docs}
        render={(p: Post, size) => <OverlayCard key={p.id} post={p} size={size} sizes={size === 'lg' ? '(max-width: 768px) 100vw, 620px' : '(max-width: 768px) 100vw, 290px'} />}
        renderList={(p: Post) => <ListCard key={p.id} post={p} />}
      />
    </Band>
  )
}

async function TvBlock({ b }: { b: Of<'tvBlock'> }) {
  const { docs } = await getVideos('tv', 5)
  if (!docs.length) return null
  return (
    <Band bg={b.background}>
      <SectionHeading href="/tv" icon="tv">{b.title || 'ملفات TV'}</SectionHeading>
      <OnePlusFour items={docs} render={(v, size) => <VideoCard key={v.id} video={v} size={size} />} />
    </Band>
  )
}

async function OpinionBlock({ b }: { b: Of<'opinionBlock'> }) {
  const c = catOf(b.category)
  if (!c) return null
  const { docs } = await getPosts({ category: c.id, limit: 4 })
  return (
    <Band>
      <SectionHeading href={categoryHref(c)}>{b.title || c.title}</SectionHeading>
      <div className="opinion-row">
        {docs.map((p) => {
          const m = media(p.featuredImage)
          return (
            <article key={p.id} className="opinion-item">
              <Link href={postHref(p)} className="opinion-img" tabIndex={-1} aria-hidden>
                {m?.url && <Image src={imgUrl(m, 'thumb')!} alt="" fill sizes="90px" />}
              </Link>
              <h3>
                <Link href={postHref(p)}>{p.title}</Link>
              </h3>
            </article>
          )
        })}
      </div>
    </Band>
  )
}

async function ShortsBlock({ b }: { b: Of<'shortsBlock'> }) {
  const { docs } = await getVideos('short', 4)
  if (!docs.length) return null
  return (
    <Band bg={b.background}>
      <SectionHeading href="/shorts">{b.title || 'سوشيال ملفات'}</SectionHeading>
      <div className="shorts-row">
        {docs.map((v) => (
          <VideoCard key={v.id} video={v} vertical />
        ))}
      </div>
    </Band>
  )
}

async function WidgetsBlock({ b }: { b: Of<'widgetsBlock'> }) {
  const [s, photo] = await Promise.all([getSettings(), (async () => {
    const c = catOf(b.photoCategory)
    return c ? (await getPosts({ category: c.id, limit: 1 })).docs[0] : null
  })()])
  const city = s.defaultCity || 'laayoune'
  return (
    <Band bg={b.background} className="widgets-band">
      <div className="three-cols">
        <div>
          <SectionHeading href={catOf(b.photoCategory) ? categoryHref(catOf(b.photoCategory)!) : undefined}>{b.photoTitle || 'صورة وتعليق'}</SectionHeading>
          {photo && <OverlayCard post={photo} sizes="(max-width: 768px) 100vw, 380px" />}
        </div>
        <div>
          <SectionHeading>الطقس</SectionHeading>
          <WeatherWidget defaultCity={city} />
        </div>
        <div>
          <SectionHeading>مواقيت الصلاة</SectionHeading>
          <PrayerWidget defaultCity={city} />
        </div>
      </div>
    </Band>
  )
}

async function ThreeColumns({ b }: { b: Of<'threeColumns'> }) {
  const cats = (b.categories ?? []).map(catOf).filter(Boolean) as Category[]
  const cols = await Promise.all(cats.map(async (c) => ({ c, p: (await getPosts({ category: c.id, limit: 1 })).docs[0] })))
  return (
    <Band bg={b.background}>
      <div className="three-cols">
        {cols.map(({ c, p }) => (
          <div key={c.id}>
            <SectionHeading href={categoryHref(c)}>{c.title}</SectionHeading>
            {p && <OverlayCard post={p} sizes="(max-width: 768px) 100vw, 380px" />}
          </div>
        ))}
      </div>
    </Band>
  )
}

export async function HomeSections({ sections }: { sections: Section[] }) {
  const out = await Promise.all(
    sections.map(async (b, i) => {
      switch (b.blockType) {
        case 'hero':
          return <Hero key={i} b={b} />
        case 'categoryBlock':
          return <CategoryBlock key={i} b={b} />
        case 'tvBlock':
          return <TvBlock key={i} b={b} />
        case 'opinionBlock':
          return <OpinionBlock key={i} b={b} />
        case 'shortsBlock':
          return <ShortsBlock key={i} b={b} />
        case 'widgetsBlock':
          return <WidgetsBlock key={i} b={b} />
        case 'threeColumns':
          return <ThreeColumns key={i} b={b} />
        case 'adBlock':
          return (
            <div key={i} className="container">
              <AdSlot placement="home-mid" />
            </div>
          )
        default:
          return null
      }
    }),
  )
  return <>{out}</>
}
