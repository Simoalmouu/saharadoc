import type { CollectionConfig } from 'payload'
import { anyone, isLoggedIn } from '../lib/access'
import { slugField } from '../lib/slug'

export const Authors: CollectionConfig = {
  slug: 'authors',
  labels: { singular: 'صحفي / كاتب', plural: 'الصحفيون والكتّاب' },
  admin: { useAsTitle: 'name', group: 'المحتوى', defaultColumns: ['name', 'role', 'updatedAt'] },
  access: { read: anyone, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  fields: [
    { name: 'name', label: 'الاسم', type: 'text', required: true },
    slugField('name'),
    {
      name: 'role',
      label: 'الصفة',
      type: 'select',
      defaultValue: 'journalist',
      options: [
        { label: 'صحفي', value: 'journalist' },
        { label: 'مراسل', value: 'correspondent' },
        { label: 'كاتب رأي', value: 'columnist' },
        { label: 'هيئة التحرير', value: 'desk' },
      ],
    },
    { name: 'photo', label: 'الصورة', type: 'upload', relationTo: 'media' },
    { name: 'bio', label: 'نبذة', type: 'textarea' },
  ],
}
