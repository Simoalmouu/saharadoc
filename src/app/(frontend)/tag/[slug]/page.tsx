import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Archive, pageNum } from '@/components/Archive'
import { getClient } from '@/lib/queries'
import { decodeSlug } from '@/lib/format'

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }

async function getTag(slug: string) {
  const r = await (await getClient()).find({ collection: 'tags', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  return r.docs[0] ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTag(decodeSlug((await params).slug))
  return t ? { title: `وسم: ${t.title}` } : {}
}

export default async function TagPage({ params, searchParams }: Props) {
  const t = await getTag(decodeSlug((await params).slug))
  if (!t) notFound()
  return <Archive title={`# ${t.title}`} filter={{ tag: t.id }} page={pageNum((await searchParams).page)} basePath={`/tag/${t.slug}`} />
}
