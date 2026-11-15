import type { Metadata } from 'next'
import { VideoHub } from '@/components/VideoHub'
import { pageNum } from '@/components/Archive'

export const metadata: Metadata = { title: 'ملفات TV' }

export default async function TvPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  return <VideoHub kind="tv" title="ملفات TV" page={pageNum((await searchParams).page)} />
}
