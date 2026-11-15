import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'
import { getClient } from '@/lib/queries'

/** Draft preview for logged-in editors: /preview?path=/my-article */
export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path') || '/'
  if (!path.startsWith('/') || path.startsWith('//')) return new Response('Bad path', { status: 400 })
  const payload = await getClient()
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return new Response('يجب تسجيل الدخول إلى لوحة التحكم أولاً', { status: 401 })
  ;(await draftMode()).enable()
  redirect(path)
}
