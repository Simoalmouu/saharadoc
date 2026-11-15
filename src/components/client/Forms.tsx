'use client'
import { useActionState } from 'react'
import { addComment, subscribe, type FormState } from '@/lib/actions'

export function NewsletterForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(subscribe, null)
  return (
    <form action={action} className="newsletter">
      <label htmlFor="nl-email" className="sr-only">البريد الإلكتروني</label>
      <input id="nl-email" type="email" name="email" placeholder="البريد الإلكتروني" required autoComplete="email" />
      <button type="submit" disabled={pending}>{pending ? '...' : 'اشترك'}</button>
      {state && <p className={`form-msg ${state.ok ? 'ok' : 'err'}`} role="status">{state.message}</p>}
    </form>
  )
}

export function CommentForm({ postId }: { postId: number | string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addComment, null)
  if (state?.ok) return <p className="form-msg ok" role="status">{state.message}</p>
  return (
    <form action={action} className="comment-form">
      <input type="hidden" name="post" value={String(postId)} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
      <label>
        <span>التعليق *</span>
        <textarea name="body" rows={5} required maxLength={2000} />
      </label>
      <div className="comment-row">
        <label>
          <span>الاسم *</span>
          <input type="text" name="name" required maxLength={80} autoComplete="name" />
        </label>
        <label>
          <span>البريد الإلكتروني * (لن يُنشر)</span>
          <input type="email" name="email" required autoComplete="email" />
        </label>
      </div>
      <button type="submit" className="btn-red" disabled={pending}>{pending ? 'جارٍ الإرسال...' : 'إرسال التعليق'}</button>
      {state && !state.ok && <p className="form-msg err" role="alert">{state.message}</p>}
    </form>
  )
}
