import type { Block, GlobalConfig } from 'payload'
import { isLoggedIn } from '../lib/access'

const background = {
  name: 'background',
  label: 'الخلفية',
  type: 'select' as const,
  defaultValue: 'default',
  options: [
    { label: 'عادية (فاتحة/داكنة حسب الوضع)', value: 'default' },
    { label: 'شريط أحمر بعرض الشاشة', value: 'red' },
  ],
}

const titleOverride = { name: 'title', label: 'عنوان القسم (اختياري — افتراضياً اسم التصنيف)', type: 'text' as const }

const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'الواجهة (السلايدر + على مدار الساعة)', plural: 'الواجهة' },
  fields: [
    { name: 'timelineTitle', label: 'عنوان العمود الزمني', type: 'text', defaultValue: 'على مدار الساعة' },
    { name: 'timelineCount', label: 'عدد الأخبار في العمود الزمني', type: 'number', defaultValue: 8 },
    { name: 'sliderCount', label: 'عدد شرائح السلايدر', type: 'number', defaultValue: 10 },
    {
      name: 'teaserCategories',
      label: 'تصنيفات العمود النصي (2)',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      maxRows: 2,
    },
  ],
}

const CategoryBlock: Block = {
  slug: 'categoryBlock',
  labels: { singular: 'قسم تصنيف (1 كبير + 4)', plural: 'أقسام تصنيفات' },
  fields: [{ name: 'category', label: 'التصنيف', type: 'relationship', relationTo: 'categories', required: true }, titleOverride, background],
}

const TvBlock: Block = {
  slug: 'tvBlock',
  labels: { singular: 'ملفات TV (فيديو 1 كبير + 4)', plural: 'أقسام فيديو' },
  fields: [{ name: 'title', label: 'العنوان', type: 'text', defaultValue: 'ملفات TV' }, { ...background, defaultValue: 'red' }],
}

const OpinionBlock: Block = {
  slug: 'opinionBlock',
  labels: { singular: 'كاتب وفكرة (رأي)', plural: 'أقسام رأي' },
  fields: [{ name: 'category', label: 'التصنيف', type: 'relationship', relationTo: 'categories', required: true }, titleOverride],
}

const ShortsBlock: Block = {
  slug: 'shortsBlock',
  labels: { singular: 'فيديوهات قصيرة (شورتس)', plural: 'أقسام شورتس' },
  fields: [{ name: 'title', label: 'العنوان', type: 'text', defaultValue: 'سوشيال ملفات' }, { ...background, defaultValue: 'red' }],
}

const WidgetsBlock: Block = {
  slug: 'widgetsBlock',
  labels: { singular: 'صورة وتعليق + الطقس + مواقيت الصلاة', plural: 'أقسام ويدجت' },
  fields: [
    { name: 'photoCategory', label: 'تصنيف "صورة وتعليق"', type: 'relationship', relationTo: 'categories' },
    { name: 'photoTitle', label: 'عنوان العمود الأول', type: 'text', defaultValue: 'صورة وتعليق' },
    { ...background, defaultValue: 'red' },
  ],
}

const ThreeColumnsBlock: Block = {
  slug: 'threeColumns',
  labels: { singular: 'ثلاثة تصنيفات جنباً إلى جنب', plural: 'صفوف ثلاثية' },
  fields: [
    { name: 'categories', label: 'التصنيفات (3)', type: 'relationship', relationTo: 'categories', hasMany: true, minRows: 1, maxRows: 3 },
    background,
  ],
}

const AdBlock: Block = {
  slug: 'adBlock',
  labels: { singular: 'مساحة إعلانية', plural: 'مساحات إعلانية' },
  fields: [
    {
      name: 'placement',
      label: 'مكان الإعلان',
      type: 'select',
      defaultValue: 'home-mid',
      options: [{ label: 'الصفحة الرئيسية — بين الأقسام', value: 'home-mid' }],
    },
  ],
}

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'أقسام الصفحة الرئيسية',
  admin: { group: 'الصفحة الرئيسية', description: 'رتّب أقسام الصفحة الرئيسية بالسحب والإفلات، وأضف أو احذف ما تشاء.' },
  access: { read: () => true, update: isLoggedIn },
  fields: [
    {
      name: 'sections',
      label: 'الأقسام',
      type: 'blocks',
      blocks: [HeroBlock, CategoryBlock, TvBlock, OpinionBlock, ShortsBlock, WidgetsBlock, ThreeColumnsBlock, AdBlock],
    },
  ],
}
