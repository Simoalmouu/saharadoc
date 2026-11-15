import type { Access, FieldAccess } from 'payload'

type U = { role?: string | null } | null | undefined

export const isLoggedIn: Access = ({ req }) => Boolean(req.user)
export const isAdmin: Access = ({ req }) => (req.user as U)?.role === 'admin'
export const isAdminField: FieldAccess = ({ req }) => (req.user as U)?.role === 'admin'
export const anyone: Access = () => true

/** Public sees published only; editors see drafts too. */
export const publishedOrLoggedIn: Access = ({ req }) => {
  if (req.user) return true
  return { _status: { equals: 'published' } }
}
