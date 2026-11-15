import type { CollectionConfig } from 'payload'
import { isLoggedIn } from '../lib/access'

export const Comments: CollectionConfig = {
  slug: 'comments',
  labels: { singular: 'تعليق', plural: 'التعليقات' },
  admin: { useAsTitle: 'name', group: 'التفاعل', defaultColumns: ['name', 'post', 'approved', 'createdAt'] },
  defaultSort: '-createdAt',
  access: {
    // Visitors only ever see approved comments; editors see everything.
    read: ({ req }) => (req.user ? true : { approved: { equals: true } }),
    create: () => true,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    { name: 'post', label: 'المقال', type: 'relationship', relationTo: 'posts', required: true, index: true },
    { name: 'name', label: 'الاسم', type: 'text', required: true, maxLength: 80 },
    { name: 'email', label: 'البريد الإلكتروني', type: 'email', required: true, access: { read: ({ req }) => Boolean(req.user) } },
    { name: 'body', label: 'التعليق', type: 'textarea', required: true, maxLength: 2000 },
    {
      name: 'approved',
      label: 'منشور',
      type: 'checkbox',
      defaultValue: false,
      access: { create: ({ req }) => Boolean(req.user), update: ({ req }) => Boolean(req.user) },
      admin: { position: 'sidebar' },
    },
  ],
}
