import type { CollectionConfig } from 'payload'
import { anyone, isLoggedIn } from '../lib/access'
import { slugField } from '../lib/slug'

export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: { singular: 'وسم', plural: 'الوسوم' },
  admin: { useAsTitle: 'title', group: 'المحتوى' },
  access: { read: anyone, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  fields: [{ name: 'title', label: 'الوسم', type: 'text', required: true }, slugField('title')],
}
