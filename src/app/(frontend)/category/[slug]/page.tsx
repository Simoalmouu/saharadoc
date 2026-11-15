import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Archive, pageNum } from '@/components/Archive'
import { getCategoryBySlug } from '@/lib/queries'
import { decodeSlug } from '@/lib/format'

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getCategoryBySlug(decodeSlug((await params).slug))
  if (!c) return {}
  return { title: c.title, description: c.description || undefined, alternates: { canonical: `/category/${c.slug}` } }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const slug = decodeSlug((await params).slug)
  const c = await getCategoryBySlug(slug)
  if (!c) notFound()
  const page = pageNum((await searchParams).page)
  return <Archive title={c.title} description={c.description} icon={c.icon} filter={{ category: c.id }} page={page} basePath={`/category/${c.slug}`} />
}
