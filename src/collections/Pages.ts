import type { CollectionConfig } from 'payload'
import { isLoggedIn, publishedOrLoggedIn } from '../lib/access'
import { slugField } from '../lib/slug'

/** Static pages: about, contact, privacy… served at /<slug> */
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'صفحة', plural: 'الصفحات الثابتة' },
  admin: { useAsTitle: 'title', group: 'الموقع' },
  versions: { drafts: true },
  access: { read: publishedOrLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  fields: [
    { name: 'title', label: 'العنوان', type: 'text', required: true },
    { name: 'content', label: 'المحتوى', type: 'richText' },
    slugField('title'),
  ],
}
