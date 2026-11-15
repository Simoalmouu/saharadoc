'use server'
import { getClient } from './queries'

export type FormState = { ok: boolean; message: string } | null

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function subscribe(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get('email') || '').trim().toLowerCase()
  if (!EMAIL.test(email)) return { ok: false, message: 'يرجى إدخال بريد إلكتروني صحيح.' }
  const payload = await getClient()
  const exists = await payload.count({ collection: 'subscribers', where: { email: { equals: email } }, overrideAccess: true })
  if (exists.totalDocs === 0) await payload.create({ collection: 'subscribers', data: { email }, overrideAccess: false })
  return { ok: true, message: 'شكراً لاشتراكك في نشرتنا البريدية.' }
}

export async function addComment(_: FormState, form: FormData): Promise<FormState> {
  const post = String(form.get('post') || '')
  const name = String(form.get('name') || '').trim()
  const email = String(form.get('email') || '').trim()
  const body = String(form.get('body') || '').trim()
  if (String(form.get('website') || '')) return { ok: true, message: 'شكراً، تعليقك في انتظار المراجعة.' } // honeypot
  if (!post || !name || !body) return { ok: false, message: 'يرجى ملء الاسم ونص التعليق.' }
  if (!EMAIL.test(email)) return { ok: false, message: 'يرجى إدخال بريد إلكتروني صحيح.' }
  if (body.length > 2000) return { ok: false, message: 'التعليق طويل جداً (2000 حرف كحد أقصى).' }
  const payload = await getClient()
  await payload.create({
    collection: 'comments',
    data: { post: Number(post), name: name.slice(0, 80), email, body, approved: false },
    overrideAccess: false,
  })
  return { ok: true, message: 'شكراً، تعليقك في انتظار المراجعة قبل النشر.' }
}
