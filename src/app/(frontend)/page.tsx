import { HomeSections } from '@/components/HomeSections'
import { TopArea } from '@/components/TopArea'
import { permanentRedirect } from 'next/navigation'
import { getClient, getHomepage, getSettings } from '@/lib/queries'
import { SITE_URL } from '@/lib/format'

export default async function HomePage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  // Old WordPress links (saharadoc.com/?p=14041) → permanent redirect to the article's new URL
  const legacy = Number((await searchParams).p)
  if (legacy) {
    const r = await (await getClient()).find({ collection: 'posts', where: { legacyId: { equals: legacy } }, limit: 1, depth: 0, select: { slug: true } })
    if (r.docs[0]?.slug) permanentRedirect(`/${encodeURIComponent(r.docs[0].slug)}`)
  }
  const [home, s] = await Promise.all([getHomepage(), getSettings()])
  const name = s.arabicName || 'ملفات صحراوية'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name,
    alternateName: s.siteName || 'Saharadoc',
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo.png`,
    sameAs: [s.facebook, s.youtube, s.instagram, s.tiktok, s.x].filter(Boolean),
  }
  return (
    <>
      <h1 className="sr-only">
        {name} — {s.tagline}
      </h1>
      <TopArea ticker />
      <HomeSections sections={home.sections ?? []} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  )
}
