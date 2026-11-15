'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '../Icon'

export function SearchButton() {
  const [open, setOpen] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    input.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <button type="button" className="circle-btn" onClick={() => setOpen(true)} aria-label="بحث">
        <Icon name="search" size={18} />
      </button>
      {open && (
        <div className="search-overlay" role="dialog" aria-modal="true" aria-label="البحث في الموقع" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <button type="button" className="search-close" onClick={() => setOpen(false)} aria-label="إغلاق">
            <Icon name="close" size={28} />
          </button>
          <form
            className="search-form"
            role="search"
            onSubmit={(e) => {
              e.preventDefault()
              const q = input.current?.value.trim()
              if (q) {
                setOpen(false)
                router.push(`/search?q=${encodeURIComponent(q)}`)
              }
            }}
          >
            <input ref={input} type="search" name="q" placeholder="ابحث في ملفات صحراوية..." aria-label="كلمات البحث" />
            <button type="submit" aria-label="ابحث">
              <Icon name="search" size={22} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
