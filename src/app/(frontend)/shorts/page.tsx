import type { Metadata } from 'next'
import { VideoHub } from '@/components/VideoHub'
import { pageNum } from '@/components/Archive'

export const metadata: Metadata = { title: 'سوشيال ملفات' }

export default async function ShortsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  return <VideoHub kind="short" title="سوشيال ملفات" page={pageNum((await searchParams).page)} />
}
