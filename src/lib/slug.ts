import type { FieldHook, TextField } from 'payload'

/** Arabic-friendly slug: keeps Arabic letters and digits, strips diacritics and punctuation. */
export function slugify(input: string): string {
  return input
    .normalize('NFKC')
    .replace(/[ً-ٰٟـ]/g, '') // tashkeel + tatweel
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 90)
}

const formatSlug =
  (fallbackField: string): FieldHook =>
  ({ value, data, originalDoc }) => {
    if (typeof value === 'string' && value.trim()) return slugify(value)
    const source = data?.[fallbackField] ?? originalDoc?.[fallbackField]
    return typeof source === 'string' ? slugify(source) : value
  }

export const slugField = (fallbackField = 'title'): TextField => ({
  name: 'slug',
  label: 'الرابط (slug)',
  type: 'text',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description: 'يُولَّد تلقائياً من العنوان إذا تُرك فارغاً',
  },
  hooks: { beforeValidate: [formatSlug(fallbackField)] },
})
