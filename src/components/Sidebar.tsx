import { getPosts } from '@/lib/queries'
import { AdSlot, SectionHeading, Timeline } from './Shared'

/** Sticky sidebar with the "على مدار الساعة" timeline, as on the reference article page. */
export async function Sidebar() {
  const latest = await getPosts({ limit: 8 })
  return (
    <aside className="sidebar" aria-label="أحدث الأخبار">
      <div className="sidebar-box">
        <SectionHeading icon="clock">على مدار الساعة</SectionHeading>
        <Timeline posts={latest.docs} />
      </div>
      <AdSlot placement="sidebar" />
    </aside>
  )
}
