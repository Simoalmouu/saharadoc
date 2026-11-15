import type { GlobalConfig } from 'payload'
import { isLoggedIn } from '../lib/access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'إعدادات الموقع',
  admin: { group: 'الموقع' },
  access: { read: () => true, update: isLoggedIn },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'الهوية',
          fields: [
            { name: 'siteName', label: 'اسم الموقع (لاتيني)', type: 'text', defaultValue: 'Saharadoc' },
            { name: 'arabicName', label: 'اسم الموقع (عربي)', type: 'text', defaultValue: 'ملفات صحراوية' },
            { name: 'tagline', label: 'الشعار النصي', type: 'text', defaultValue: 'نافذتك على الصحراء والمغرب والعالم' },
            { name: 'logoLight', label: 'الشعار على خلفية فاتحة', type: 'upload', relationTo: 'media' },
            { name: 'logoOnRed', label: 'الشعار على الشريط الأحمر (أبيض)', type: 'upload', relationTo: 'media' },
            { name: 'logoOnDark', label: 'الشعار على خلفية داكنة', type: 'upload', relationTo: 'media' },
            { name: 'englishSiteUrl', label: 'رابط النسخة الإنجليزية (يخفى الزر إذا كان فارغاً)', type: 'text' },
          ],
        },
        {
          label: 'التواصل الاجتماعي',
          fields: [
            { name: 'facebook', type: 'text' },
            { name: 'youtube', type: 'text' },
            { name: 'instagram', type: 'text' },
            { name: 'tiktok', type: 'text' },
            { name: 'x', label: 'X (Twitter)', type: 'text' },
          ],
        },
        {
          label: 'التذييل والتواصل',
          fields: [
            { name: 'about', label: 'نبذة "عن الموقع"', type: 'textarea' },
            { name: 'email', label: 'البريد الإلكتروني', type: 'email' },
            { name: 'phone', label: 'الهاتف', type: 'text' },
            { name: 'address', label: 'العنوان', type: 'text' },
            { name: 'copyright', label: 'نص الحقوق', type: 'text', defaultValue: 'ملفات صحراوية. جميع الحقوق محفوظة.' },
            {
              name: 'footerLinks',
              label: 'روابط إضافية في التذييل',
              type: 'array',
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'url', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          label: 'الويدجت',
          fields: [
            { name: 'defaultCity', label: 'المدينة الافتراضية للطقس والصلاة', type: 'text', defaultValue: 'laayoune' },
          ],
        },
      ],
    },
  ],
}
