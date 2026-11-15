/**
 * Imports the saharadoc.com WordPress export (fetched by wp-import/fetch.mjs) into Payload.
 *   npm run import:wp -- --dir ../wp-import
 * Resumable: progress is kept in <dir>/import-state.json, so re-running skips what is already in.
 * First run removes the demo articles, tags, authors and categories created by `npm run seed`.
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { createHash } from 'crypto'
import { getPayload } from 'payload'
import { slugify } from '../lib/slug'
import { decodeEntities, htmlToLexical, htmlToPlain } from './wp-html'

const arg = (k: string, d: string) => {
  const i = process.argv.indexOf(k)
  return i > -1 ? process.argv[i + 1] : d
}
const DIR = path.resolve(arg('--dir', '../wp-import'))
const STATE_FILE = path.resolve(arg('--state', path.join(DIR, 'import-state.json')))
const LIMIT = Number(arg('--limit', '0')) || Infinity

type State = { cleaned: boolean; layoutDone?: boolean; categories: Record<string, number>; authors: Record<string, number>; images: Record<string, number>; posts: Record<string, number> }
const state: State = fs.existsSync(STATE_FILE)
  ? JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'))
  : { cleaned: false, categories: {}, authors: {}, images: {}, posts: {} }
const save = () => fs.writeFileSync(STATE_FILE, JSON.stringify(state))

// Must match imageKey() in wp-import/fetch.mjs (Windows MAX_PATH guard).
const imageKey = (u: string) => {
  const key = u.replace(/^https?:\/\/[^/]+\/wp-content\/uploads\//, '').replace(/[/\\]/g, '_').replace(/\.(png|jpe?g|webp|gif)$/i, '') + '.jpg'
  if (path.join(DIR, 'images', key + '.part').length <= 240) return key
  return key.slice(0, 8) + createHash('md5').update(key).digest('hex').slice(0, 12) + '.jpg'
}
// Short stored file names keep Payload's media folder (and its resized copies) under the path limit.
const uploadName = (key: string) => `${key.slice(0, 7)}-${createHash('md5').update(key).digest('hex').slice(0, 10)}.jpg`
const baseName = (u: string) => u.replace(/-\d+x\d+(?=\.\w+$)/, '').replace(/-scaled(?=\.\w+$)/, '')

const { default: config } = await import('../payload.config')
const payload = await getPayload({ config })

// ── 1. Remove demo content (once) ──
if (!state.cleaned) {
  // the homepage layout references the demo categories; it is rebuilt at the end of the import
  await payload.updateGlobal({ slug: 'homepage', data: { sections: [] } })
  for (const collection of ['comments', 'posts', 'tags', 'authors', 'categories'] as const) {
    let removed = 0
    for (;;) {
      const r = await payload.delete({ collection, where: { id: { exists: true } }, overrideAccess: true })
      removed += r.docs.length
      if (!r.docs.length || (await payload.count({ collection, overrideAccess: true })).totalDocs === 0) break
    }
    console.log(`• removed ${removed} demo ${collection}`)
  }
  const demoMedia = await payload.delete({ collection: 'media', where: { filename: { like: 'demo-' } }, overrideAccess: true })
  console.log(`• removed ${demoMedia.docs.length} demo images`)
  state.cleaned = true
  save()
}

// ── 2. Categories ──
type WpCat = { id: number; name: string; slug: string; count: number }
const wpCats: WpCat[] = JSON.parse(fs.readFileSync(path.join(DIR, 'categories.json'), 'utf8'))
// Main menu, in this order (the rest still get pages and footer links).
const NAV = ['الصحراء', 'وطني', 'سياسة', 'العالم', 'تحقيقات', 'رياضة', 'فن وثقافة', 'مال وأعمال', 'رائدات']
const HIDDEN = ['غير مصنف', 'إعلانات']
const ICONS: Record<string, string> = { 'رياضة': 'trophy', 'جولات مصورة': 'camera', 'فن وثقافة': 'camera', 'العالم': 'globe', 'الصحراء': 'globe', 'قرأنا لكم': 'pen', 'تصريحات و حوارات': 'pen' }
for (const c of wpCats) {
  if (state.categories[c.id]) continue
  const title = decodeEntities(c.name)
  const navIdx = NAV.indexOf(title)
  const doc = await payload.create({
    collection: 'categories',
    data: {
      title,
      slug: slugify(title),
      order: navIdx > -1 ? navIdx + 1 : 20 + Math.max(0, 200 - c.count) / 10,
      showInNav: navIdx > -1,
      showInFooter: !HIDDEN.includes(title) && c.count >= 20,
      icon: (ICONS[title] as any) || 'none',
    },
  })
  state.categories[c.id] = doc.id
}
save()
console.log(`• ${Object.keys(state.categories).length} categories`)

// ── 3. Authors ──
const AUTHORS: Record<string, { name: string; slug: string; role: 'desk' | 'journalist' }> = {
  '1': { name: 'هشام عباسي', slug: 'hicham-abbassi', role: 'journalist' },
  '2': { name: 'هيئة التحرير', slug: 'desk', role: 'desk' }, // WordPress user "tech"
}
for (const [wpId, a] of Object.entries(AUTHORS)) {
  if (state.authors[wpId]) continue
  state.authors[wpId] = (await payload.create({ collection: 'authors', data: a })).id
}
save()

// ── 4. Images (uploaded once, reused across posts) ──
let missingImages = 0
async function resolveImage(src: string, alt: string): Promise<number | null> {
  if (!/saharadoc\.com\/wp-content\/uploads\//.test(src)) return null
  const key = imageKey(src)
  if (state.images[key]) return state.images[key]
  const file = path.join(DIR, 'images', key)
  if (!fs.existsSync(file)) {
    missingImages++
    return null
  }
  const data = fs.readFileSync(file)
  const doc = await payload.create({
    collection: 'media',
    data: { alt: alt || 'ملفات صحراوية' },
    file: { data, name: uploadName(key), mimetype: 'image/jpeg', size: data.length },
  })
  state.images[key] = doc.id
  return doc.id
}

// ── 5. Posts (oldest first so "latest" ordering stays natural) ──
const posts: any[] = fs
  .readdirSync(path.join(DIR, 'posts'))
  .filter((f) => f.startsWith('page-'))
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(DIR, 'posts', f), 'utf8')))
  .sort((a, b) => a.date_gmt.localeCompare(b.date_gmt))

const newestIds = new Set(posts.slice(-12).map((p) => p.id))
const usedSlugs = new Set<string>()
let done = 0, skipped = 0, failed = 0
const t0 = Date.now()

for (const p of LIMIT < Infinity ? posts.slice(-LIMIT) : posts) {
  if (state.posts[p.id]) {
    skipped++
    continue
  }
  try {
    // a few WordPress posts have no title — fall back to the opening words of the article
    const title = decodeEntities(p.title.rendered).trim() || htmlToPlain(p.content.rendered, 90)
    const featuredSrc: string | undefined = p._embedded?.['wp:featuredmedia']?.[0]?.source_url
    const featuredAlt = decodeEntities(p._embedded?.['wp:featuredmedia']?.[0]?.alt_text || '') || title
    let featuredId = featuredSrc ? await resolveImage(featuredSrc, featuredAlt) : null

    const content = await htmlToLexical(p.content.rendered, resolveImage, featuredSrc ? (src) => baseName(src) === baseName(featuredSrc) : undefined)
    if (!featuredId) {
      // no featured image → use the first body image
      const first = content.root.children.find((n: any) => n.type === 'upload')
      featuredId = first?.value ?? null
    }
    if (!featuredId) {
      // text-only article → show the site logo as its picture
      const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
      featuredId = (settings.logoLight as number | null) ?? null
      console.log(`  • ${p.id} has no image — using the site logo`)
    }
    if (!featuredId) {
      console.log(`  ! ${p.id} has no usable image — skipped`)
      failed++
      continue
    }

    let slug = decodeURIComponent(p.slug) || slugify(title)
    slug = slugify(slug) || `post-${p.id}`
    while (usedSlugs.has(slug)) slug = `${slug}-${p.id}`
    usedSlugs.add(slug)

    const excerpt = htmlToPlain(p.excerpt?.rendered || p.content.rendered, 280)
    const cats = (p.categories as number[]).map((c) => state.categories[c]).filter(Boolean)
    const doc = await payload.create({
      collection: 'posts',
      data: {
        title,
        slug,
        excerpt,
        content: content as any,
        featuredImage: featuredId,
        category: cats[0] ?? Object.values(state.categories)[0],
        author: state.authors[String(p.author)] ?? state.authors['1'],
        publishedAt: new Date(p.date_gmt + 'Z').toISOString(),
        legacyId: p.id,
        featured: newestIds.has(p.id),
        breaking: newestIds.has(p.id),
        _status: 'published',
      },
    })
    state.posts[p.id] = doc.id
    done++
    if (done % 25 === 0) {
      save()
      const rate = (Date.now() - t0) / done / 1000
      console.log(`  ${done + skipped}/${posts.length} posts (${rate.toFixed(1)}s each, ~${Math.round(((posts.length - done - skipped) * rate) / 60)} min left)`)
    }
  } catch (e: any) {
    failed++
    console.log(`  ! ${p.id} failed: ${e.message?.slice(0, 200)}`)
  }
}
save()
console.log(`• posts: ${done} imported, ${skipped} already there, ${failed} failed; ${missingImages} image references not downloaded`)

// ── 6. Homepage layout + ticker using the imported categories (first import only, so later runs
//       never overwrite the layout editors have changed in the admin) ──
if (state.layoutDone) {
  console.log('• homepage layout left as is (already set by an earlier import)')
  console.log('✓ Import complete')
  process.exit(0)
}
const cat = async (title: string) => {
  const r = await payload.find({ collection: 'categories', where: { title: { equals: title } }, limit: 1, depth: 0 })
  return r.docs[0]?.id
}
const c = Object.fromEntries(
  await Promise.all(
    ['الصحراء', 'وطني', 'سياسة', 'العالم', 'تحقيقات', 'رياضة', 'فن وثقافة', 'رائدات', 'قرأنا لكم', 'مغاربة العالم', 'جولات مصورة', 'مال وأعمال', 'حوادث', 'شكاية مواطن', 'الصحة والجمال', 'تكنولوجيا', 'دين و دنيا', 'أنشطة ملكية', 'المرأة و الطفل'].map(async (t) => [t, await cat(t)]),
  ),
)
const block = (category: string, background = 'default') => ({ blockType: 'categoryBlock', category: c[category], background })
await payload.updateGlobal({
  slug: 'homepage',
  data: {
    sections: [
      { blockType: 'hero', timelineTitle: 'على مدار الساعة', timelineCount: 8, sliderCount: 10, teaserCategories: [c['سياسة'], c['العالم']].filter(Boolean) },
      { blockType: 'tvBlock', title: 'ملفات TV', background: 'red' },
      block('الصحراء'),
      block('وطني'),
      { blockType: 'opinionBlock', category: c['قرأنا لكم'], title: 'قرأنا لكم' },
      block('تحقيقات'),
      block('رياضة', 'red'),
      block('أنشطة ملكية'),
      { blockType: 'shortsBlock', title: 'سوشيال ملفات', background: 'red' },
      block('رائدات'),
      block('مغاربة العالم'),
      { blockType: 'widgetsBlock', photoCategory: c['جولات مصورة'], photoTitle: 'جولات مصورة', background: 'red' },
      { blockType: 'threeColumns', categories: [c['مال وأعمال'], c['حوادث'], c['فن وثقافة']].filter(Boolean), background: 'default' },
      { blockType: 'threeColumns', categories: [c['شكاية مواطن'], c['الصحة والجمال'], c['المرأة و الطفل']].filter(Boolean), background: 'default' },
      { blockType: 'threeColumns', categories: [c['تكنولوجيا'], c['دين و دنيا'], c['سياسة']].filter(Boolean), background: 'default' },
    ].filter((s: any) => s.blockType !== 'categoryBlock' || s.category) as any,
  },
})
await payload.updateGlobal({ slug: 'ticker', data: { enabled: true, label: 'شريط الأخبار', source: 'latest', count: 10 } })
state.layoutDone = true
save()
console.log('• homepage layout + ticker updated')
console.log('✓ Import complete')
process.exit(0)
