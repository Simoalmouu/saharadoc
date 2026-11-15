'use client'
import { useState } from 'react'
import type { Post } from '@/payload-types'
import { OverlayCard } from '../Cards'

/**
 * "تحميل المزيد" like the reference. Appends the next page in place; the server-rendered
 * numbered pagination underneath keeps every page reachable without JavaScript.
 */
export function LoadMore({ query, startPage, totalPages }: { query: string; startPage: number; totalPages: number }) {
  const [page, setPage] = useState(startPage)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const more = async () => {
    setLoading(true)
    setError(false)
    try {
      const r = await fetch(`/load-more?${query}&page=${page + 1}`)
      if (!r.ok) throw new Error()
      const j = (await r.json()) as { docs: Post[] }
      setPosts((p) => [...p, ...j.docs])
      setPage((x) => x + 1)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {posts.length > 0 && (
        <div className="post-grid" style={{ marginTop: 18 }}>
          {posts.map((p) => (
            <OverlayCard key={p.id} post={p} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px" />
          ))}
        </div>
      )}
      {page < totalPages && (
        <div className="load-more-wrap">
          <button type="button" className="btn-red" onClick={more} disabled={loading}>
            {loading ? 'جارٍ التحميل...' : 'تحميل المزيد'}
          </button>
          {error && <p className="form-msg err">تعذّر تحميل المزيد، حاول مجدداً.</p>}
        </div>
      )}
    </>
  )
}
