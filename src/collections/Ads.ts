import type { CollectionConfig } from 'payload'
import { anyone, isLoggedIn } from '../lib/access'

export const AD_PLACEMENTS = [
  { label: 'بانر أعلى الصفحات (1170×250)', value: 'top-banner' },
  { label: 'الصفحة الرئيسية — بين الأقسام (1170×150)', value: 'home-mid' },
  { label: 'الشريط الجانبي للمقال (300×250)', value: 'sidebar' },
  { label: 'داخل المقال (728×90)', value: 'article-inline' },
] as const

export const Ads: CollectionConfig = {
  slug: 'ads',
  labels: { singular: 'إعلان', plural: 'الإعلانات' },
  admin: { useAsTitle: 'name', group: 'الموقع', defaultColumns: ['name', 'placement', 'active', 'endsAt'] },
  access: { read: anyone, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  fields: [
    { name: 'name', label: 'اسم الإعلان', type: 'text', required: true },
    { name: 'placement', label: 'مكان الظهور', type: 'select', required: true, options: [...AD_PLACEMENTS] },
    {
      name: 'type',
      label: 'النوع',
      type: 'radio',
      defaultValue: 'image',
      options: [
        { label: 'صورة + رابط', value: 'image' },
        { label: 'كود (AdSense أو غيره)', value: 'code' },
      ],
    },
    { name: 'image', label: 'الصورة', type: 'upload', relationTo: 'media', admin: { condition: (d) => d?.type !== 'code' } },
    { name: 'link', label: 'الرابط عند النقر', type: 'text', admin: { condition: (d) => d?.type !== 'code' } },
    { name: 'code', label: 'كود الإعلان (HTML)', type: 'code', admin: { language: 'html', condition: (d) => d?.type === 'code' } },
    {
      type: 'row',
      fields: [
        { name: 'active', label: 'مفعّل', type: 'checkbox', defaultValue: true },
        { name: 'priority', label: 'الأولوية', type: 'number', defaultValue: 1 },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'startsAt', label: 'يبدأ في', type: 'date' },
        { name: 'endsAt', label: 'ينتهي في', type: 'date' },
      ],
    },
  ],
}
