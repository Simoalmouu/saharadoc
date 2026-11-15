import type { CollectionConfig } from 'payload'
import { anyone, isLoggedIn } from '../lib/access'
import { slugField } from '../lib/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'تصنيف', plural: 'التصنيفات' },
  admin: { useAsTitle: 'title', group: 'المحتوى', defaultColumns: ['title', 'slug', 'order', 'showInNav'] },
  defaultSort: 'order',
  access: { read: anyone, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  fields: [
    { name: 'title', label: 'الاسم', type: 'text', required: true },
    slugField('title'),
    { name: 'description', label: 'وصف (لمحركات البحث)', type: 'textarea' },
    {
      type: 'row',
      fields: [
        { name: 'order', label: 'الترتيب', type: 'number', defaultValue: 10 },
        { name: 'showInNav', label: 'يظهر في القائمة الرئيسية', type: 'checkbox', defaultValue: true },
        { name: 'showInFooter', label: 'يظهر في التذييل', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      name: 'icon',
      label: 'أيقونة العنوان',
      type: 'select',
      options: [
        { label: 'بدون', value: 'none' },
        { label: 'تلفاز', value: 'tv' },
        { label: 'كأس', value: 'trophy' },
        { label: 'قلم', value: 'pen' },
        { label: 'كاميرا', value: 'camera' },
        { label: 'كرة أرضية', value: 'globe' },
      ],
      defaultValue: 'none',
    },
  ],
}
