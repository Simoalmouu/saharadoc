import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminField, isLoggedIn } from '../lib/access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'مستخدم', plural: 'المستخدمون' },
  admin: { useAsTitle: 'email', group: 'الإدارة', defaultColumns: ['name', 'email', 'role'] },
  auth: true,
  access: {
    read: isLoggedIn,
    create: isAdmin,
    delete: isAdmin,
    update: ({ req, id }) => (req.user as any)?.role === 'admin' || req.user?.id === id,
  },
  fields: [
    { name: 'name', label: 'الاسم', type: 'text' },
    {
      name: 'role',
      label: 'الصلاحية',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      access: { update: isAdminField },
      options: [
        { label: 'مدير', value: 'admin' },
        { label: 'محرر', value: 'editor' },
      ],
    },
  ],
}
