import type { CollectionConfig } from 'payload'
import { anyone, isLoggedIn } from '../lib/access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'وسائط', plural: 'الصور والوسائط' },
  admin: { group: 'المحتوى', defaultColumns: ['filename', 'alt', 'updatedAt'] },
  access: { read: anyone, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  fields: [
    { name: 'alt', label: 'النص البديل', type: 'text', required: true },
    { name: 'credit', label: 'المصدر / حقوق الصورة', type: 'text' },
  ],
  upload: {
    mimeTypes: ['image/*', 'video/mp4', 'video/webm'],
    focalPoint: true,
    imageSizes: [
      { name: 'thumb', width: 400, height: 260, position: 'centre' },
      { name: 'card', width: 800, height: 520, position: 'centre' },
      { name: 'hero', width: 1400, height: undefined, position: 'centre' },
    ],
  },
}
