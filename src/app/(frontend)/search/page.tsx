import type { Metadata } from 'next'
import { Archive, pageNum } from '@/components/Archive'
import { Icon } from '@/components/Icon'

type Props = { searchParams: Promise<{ q?: string; page?: string }> }

export const metadata: Metadata = { title: 'البحث', robots: { index: false } }

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams
  const q = (sp.q || '').trim().slice(0, 100)
  return (
    <>
      <div className="container container-narrow" style={{ paddingTop: 28 }}>
        <form action="/search" className="search-page-form" role="search">
          <input type="search" name="q" defaultValue={q} placeholder="ابحث في ملفات صحراوية..." aria-label="كلمات البحث" />
          <button type="submit" className="btn-red">
            <Icon name="search" size={18} /> بحث
          </button>
        </form>
      </div>
      {q ? (
        <Archive title={`نتائج البحث: ${q}`} filter={{ search: q }} page={pageNum(sp.page)} basePath={`/search?q=${encodeURIComponent(q)}`} />
      ) : (
        <p className="empty">اكتب كلمة أو أكثر للبحث في الأخبار.</p>
      )}
    </>
  )
}
