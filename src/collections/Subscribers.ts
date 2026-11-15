import type { CollectionConfig } from 'payload'
import { isLoggedIn } from '../lib/access'

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: { singular: 'مشترك', plural: 'المشتركون في النشرة' },
  admin: { useAsTitle: 'email', group: 'التفاعل', defaultColumns: ['email', 'createdAt'] },
  access: { read: isLoggedIn, create: () => true, update: isLoggedIn, delete: isLoggedIn },
  fields: [{ name: 'email', label: 'البريد الإلكتروني', type: 'email', required: true, unique: true }],
}
