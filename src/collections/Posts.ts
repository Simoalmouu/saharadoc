import type { CollectionConfig } from 'payload'
import { isLoggedIn, publishedOrLoggedIn } from '../lib/access'
import { slugField } from '../lib/slug'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'مقال', plural: 'المقالات والأخبار' },
  admin: {
    useAsTitle: 'title',
    group: 'المحتوى',
    defaultColumns: ['title', 'category', 'featured', 'breaking', 'publishedAt', '_status'],
    listSearchableFields: ['title', 'excerpt'],
    preview: (doc) => (doc?.slug ? `/preview?path=${encodeURIComponent(`/${doc.slug}`)}` : null),
  },
  defaultSort: '-publishedAt',
  versions: { drafts: true, maxPerDoc: 20 },
  access: { read: publishedOrLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  fields: [
    { name: 'title', label: 'العنوان', type: 'text', required: true },
    { name: 'excerpt', label: 'المقتطف', type: 'textarea', admin: { description: 'يظهر في البطاقات النصية وفي محركات البحث' } },
    { name: 'featuredImage', label: 'الصورة البارزة', type: 'upload', relationTo: 'media', required: true },
    { name: 'content', label: 'نص المقال', type: 'richText' },
    slugField('title'),
    {
      name: 'publishedAt',
      label: 'تاريخ النشر',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime', displayFormat: 'dd/MM/yyyy HH:mm' } },
    },
    { name: 'category', label: 'التصنيف', type: 'relationship', relationTo: 'categories', required: true, index: true, admin: { position: 'sidebar' } },
    { name: 'author', label: 'الكاتب', type: 'relationship', relationTo: 'authors', admin: { position: 'sidebar' } },
    { name: 'tags', label: 'الوسوم', type: 'relationship', relationTo: 'tags', hasMany: true, admin: { position: 'sidebar' } },
    {
      name: 'featured',
      label: 'خبر مميز (يظهر في السلايدر الرئيسي)',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'breaking',
      label: 'خبر عاجل (يظهر في شريط الأخبار)',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: { position: 'sidebar' },
    },
    { name: 'imageCaption', label: 'تعليق الصورة', type: 'text' },
    {
      name: 'legacyId',
      label: 'رقم المقال في ووردبريس القديم',
      type: 'number',
      index: true,
      admin: { position: 'sidebar', readOnly: true, description: 'الروابط القديمة ?p=رقم تُحوَّل تلقائياً إلى هذا المقال' },
    },
  ],
}
