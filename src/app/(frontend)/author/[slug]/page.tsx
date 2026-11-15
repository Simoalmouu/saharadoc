import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Archive, pageNum } from '@/components/Archive'
import { getClient } from '@/lib/queries'
import { decodeSlug } from '@/lib/format'

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }

async function getAuthor(slug: string) {
  const r = await (await getClient()).find({ collection: 'authors', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  return r.docs[0] ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await getAuthor(decodeSlug((await params).slug))
  return a ? { title: a.name, description: a.bio || undefined } : {}
}

export default async function AuthorPage({ params, searchParams }: Props) {
  const a = await getAuthor(decodeSlug((await params).slug))
  if (!a) notFound()
  return <Archive title={a.name} description={a.bio} filter={{ author: a.id }} page={pageNum((await searchParams).page)} basePath={`/author/${a.slug}`} />
}
