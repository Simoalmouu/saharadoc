import type { CollectionConfig } from 'payload'
import { isLoggedIn, publishedOrLoggedIn } from '../lib/access'
import { slugField } from '../lib/slug'

export const Videos: CollectionConfig = {
  slug: 'videos',
  labels: { singular: 'فيديو', plural: 'الفيديوهات' },
  admin: { useAsTitle: 'title', group: 'المحتوى', defaultColumns: ['title', 'kind', 'publishedAt', '_status'] },
  defaultSort: '-publishedAt',
  versions: { drafts: true },
  access: { read: publishedOrLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  fields: [
    { name: 'title', label: 'العنوان', type: 'text', required: true },
    {
      name: 'kind',
      label: 'النوع',
      type: 'select',
      required: true,
      defaultValue: 'tv',
      options: [
        { label: 'ملفات TV (فيديو أفقي)', value: 'tv' },
        { label: 'سوشيال / شورتس (فيديو عمودي)', value: 'short' },
      ],
    },
    { name: 'thumbnail', label: 'الصورة المصغرة', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'youtubeUrl',
      label: 'رابط يوتيوب / فيسبوك / تيك توك',
      type: 'text',
      admin: { description: 'مثال: https://www.youtube.com/watch?v=... أو https://youtube.com/shorts/...' },
    },
    { name: 'file', label: 'أو ملف فيديو مرفوع', type: 'upload', relationTo: 'media' },
    { name: 'description', label: 'الوصف', type: 'textarea' },
    slugField('title'),
    {
      name: 'publishedAt',
      label: 'تاريخ النشر',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    { name: 'category', label: 'التصنيف', type: 'relationship', relationTo: 'categories', admin: { position: 'sidebar' } },
  ],
}
