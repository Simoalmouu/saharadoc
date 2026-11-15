import type { GlobalConfig } from 'payload'
import { isLoggedIn } from '../lib/access'

export const Ticker: GlobalConfig = {
  slug: 'ticker',
  label: 'شريط الأخبار العاجلة',
  admin: { group: 'الصفحة الرئيسية' },
  access: { read: () => true, update: isLoggedIn },
  fields: [
    { name: 'enabled', label: 'إظهار الشريط', type: 'checkbox', defaultValue: true },
    { name: 'label', label: 'عنوان الشريط', type: 'text', defaultValue: 'شريط الأخبار' },
    {
      name: 'source',
      label: 'مصدر الأخبار',
      type: 'radio',
      defaultValue: 'breaking-then-latest',
      options: [
        { label: 'الأخبار المعلّمة "عاجل" ثم أحدث الأخبار', value: 'breaking-then-latest' },
        { label: 'الأخبار المعلّمة "عاجل" فقط', value: 'breaking' },
        { label: 'أحدث الأخبار', value: 'latest' },
      ],
    },
    { name: 'count', label: 'عدد العناصر', type: 'number', defaultValue: 10, min: 3, max: 30 },
    {
      name: 'manualItems',
      label: 'عناصر يدوية إضافية (تظهر أولاً)',
      type: 'array',
      fields: [
        { name: 'text', label: 'النص', type: 'text', required: true },
        { name: 'url', label: 'الرابط (اختياري)', type: 'text' },
      ],
    },
  ],
}
