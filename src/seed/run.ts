/**
 * Seeds the database with Saharadoc branding, categories, demo articles, videos, ads and homepage layout.
 *   npm run seed            → seeds only if the database is empty
 *   npm run seed -- --reset → wipes saharadoc.db first
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import { AUTHORS, CATEGORIES, DEMO_NOTE, LOREM, SHORTS, TAGS, TV_VIDEOS } from './data'
import { assetPath, bannerJPG, landscapeJPG, shortThumbJPG, videoThumbJPG } from './images'
import { doc, heading, paragraph } from './lexical'

const reset = process.argv.includes('--reset')
if (reset) {
  const dbFile = path.resolve((process.env.DATABASE_URL || 'file:./saharadoc.db').replace(/^file:/, ''))
  for (const f of [dbFile, dbFile + '-wal', dbFile + '-shm']) if (fs.existsSync(f)) fs.rmSync(f)
  fs.rmSync(path.resolve('media'), { recursive: true, force: true })
  console.log('• database reset')
}

const { default: config } = await import('../payload.config')
const payload = await getPayload({ config })

const existing = await payload.count({ collection: 'posts', overrideAccess: true })
if (existing.totalDocs > 0 && !reset) {
  console.log('Database already has content — skipping. Use `npm run seed -- --reset` to start over.')
  process.exit(0)
}

const upload = async (data: Buffer, name: string, alt: string, mimetype = 'image/jpeg') =>
  payload.create({ collection: 'media', data: { alt }, file: { data, name, mimetype, size: data.length } })

const uploadFile = async (file: string, alt: string) => {
  const data = fs.readFileSync(assetPath(file))
  return upload(data, file, alt, file.endsWith('.png') ? 'image/png' : 'image/jpeg')
}

// ── Admin user (local credentials come from .env, never hard-coded) ──
if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) {
  await payload.create({
    collection: 'users',
    data: { email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD, name: 'المدير', role: 'admin' },
  })
  console.log('• admin user created from .env')
}

// ── Branding ──
const logo = await uploadFile('logo.png', 'شعار ملفات صحراوية')
const logoWhite = await uploadFile('logo-white.png', 'شعار ملفات صحراوية (أبيض)')
const logoDark = await uploadFile('logo-dark.png', 'شعار ملفات صحراوية (للخلفية الداكنة)')

await payload.updateGlobal({
  slug: 'site-settings',
  data: {
    siteName: 'Saharadoc',
    arabicName: 'ملفات صحراوية',
    tagline: 'جريدة إلكترونية متجددة على مدار الساعة',
    logoLight: logo.id,
    logoOnRed: logoWhite.id,
    logoOnDark: logoDark.id,
    facebook: 'https://www.facebook.com/Saharadoc',
    instagram: 'https://www.instagram.com/saharadoc',
    youtube: 'https://www.youtube.com/@SAHARADOC_COM',
    tiktok: 'https://www.tiktok.com/@saharadoc',
    about:
      'ملفات صحراوية جريدة إلكترونية متجددة على مدار الساعة، تهتم بأخبار الصحراء المغربية والمغرب والعالم، وتسعى لتقديم المعلومة الموثوقة بدقة وموضوعية.\n\nالموقع منفتح على الكتّاب والمفكرين للمساهمة بآرائهم في القضايا التي تهم القراء.',
    email: '',
    phone: '',
    address: 'العيون — المغرب',
    copyright: 'ملفات صحراوية. جميع الحقوق محفوظة.',
    defaultCity: 'laayoune',
  },
})
console.log('• site settings')

// ── Authors & tags ──
const authors: Record<string, number> = {}
for (const a of AUTHORS) authors[a.slug] = (await payload.create({ collection: 'authors', data: { ...a } })).id
const tags: number[] = []
for (const t of TAGS) tags.push((await payload.create({ collection: 'tags', data: { title: t } })).id)

// ── Categories & posts ──
const cats: Record<string, number> = {}
let seed = 1
let minutesAgo = 25
const allPosts: { id: number; cat: string }[] = []
const featuredSlugs = new Set(['sahara', 'morocco', 'america', 'sports', 'diaspora'])
const breakingSlugs = new Set(['sahara', 'morocco'])

for (const c of CATEGORIES) {
  const cat = await payload.create({
    collection: 'categories',
    data: { title: c.title, slug: c.slug, order: c.order, showInNav: c.nav, showInFooter: c.nav, icon: (c.icon as any) || 'none' },
  })
  cats[c.slug] = cat.id
}

// Interleave categories so "latest" mixes sections like a real newsroom feed.
const queue: { title: string; cat: string; idx: number }[] = []
const maxLen = Math.max(...CATEGORIES.map((c) => c.posts.length))
for (let i = 0; i < maxLen; i++) for (const c of CATEGORIES) if (c.posts[i]) queue.push({ title: c.posts[i], cat: c.slug, idx: i })

for (const item of queue) {
  const img = await upload(await landscapeJPG(seed), `demo-${seed}.jpg`, item.title)
  const author =
    item.cat === 'sports' ? 'sports-desk' : item.cat === 'opinion' ? 'columnist' : item.cat === 'sahara' ? (seed % 2 ? 'laayoune-correspondent' : 'dakhla-correspondent') : 'desk'
  const publishedAt = new Date(Date.now() - minutesAgo * 60_000).toISOString()
  minutesAgo += 95 + ((seed * 37) % 240)
  const post = await payload.create({
    collection: 'posts',
    data: {
      title: item.title,
      excerpt: `${LOREM[seed % LOREM.length]} ${LOREM[(seed + 1) % LOREM.length]}`,
      featuredImage: img.id,
      category: cats[item.cat],
      author: authors[author],
      tags: [tags[seed % tags.length], tags[(seed + 3) % tags.length]],
      publishedAt,
      featured: featuredSlugs.has(item.cat) && item.idx < 2,
      breaking: breakingSlugs.has(item.cat) && item.idx < 3,
      _status: 'published',
      content: doc(
        paragraph(DEMO_NOTE, true),
        paragraph(LOREM[0]),
        paragraph(LOREM[1]),
        heading('تفاصيل إضافية'),
        paragraph(LOREM[2]),
        paragraph(LOREM[3]),
      ),
    },
  })
  allPosts.push({ id: post.id, cat: item.cat })
  seed++
}
console.log(`• ${allPosts.length} demo articles`)

// ── Videos ──
let vSeed = 40
for (const [i, v] of TV_VIDEOS.entries()) {
  const thumb = v.thumb
    ? await uploadFile(v.thumb, v.title)
    : await upload(await videoThumbJPG(vSeed++, v.headline), `tv-${i}.jpg`, v.title)
  await payload.create({
    collection: 'videos',
    data: {
      title: v.title,
      kind: 'tv',
      thumbnail: thumb.id,
      description: 'فيديو تجريبي. أضف رابط يوتيوب أو ارفع ملف الفيديو من لوحة التحكم.',
      publishedAt: new Date(Date.now() - (i + 1) * 26 * 3600_000).toISOString(),
      _status: 'published',
    },
  })
}
for (const [i, s] of SHORTS.entries()) {
  const thumb = await upload(await shortThumbJPG(vSeed++, s.headline), `short-${i}.jpg`, s.title)
  await payload.create({
    collection: 'videos',
    data: {
      title: s.title,
      kind: 'short',
      thumbnail: thumb.id,
      description: 'فيديو قصير تجريبي. أضف رابط يوتيوب شورتس أو تيك توك من لوحة التحكم.',
      publishedAt: new Date(Date.now() - (i + 1) * 20 * 3600_000).toISOString(),
      _status: 'published',
    },
  })
}
console.log('• videos')

// ── Ads ──
const banner = await upload(await bannerJPG(), 'banner-saharadoc.jpg', 'ملفات صحراوية — متابعة مستمرة')
await payload.create({
  collection: 'ads',
  data: { name: 'بانر ترويجي — ملفات صحراوية', placement: 'top-banner', type: 'image', image: banner.id, link: '/category/sahara', active: true },
})
console.log('• ads')

// ── Static pages ──
const pages = [
  { title: 'من نحن', slug: 'about', body: ['ملفات صحراوية جريدة إلكترونية متجددة على مدار الساعة، تهتم بأخبار الصحراء المغربية والمغرب والعالم.', 'عدّل هذه الصفحة من لوحة التحكم ← الصفحات الثابتة.'] },
  { title: 'تواصل معنا', slug: 'contact', body: ['للتواصل مع هيئة التحرير أو لاقتراح موضوع، راسلونا عبر البريد الإلكتروني أو صفحاتنا على مواقع التواصل الاجتماعي.', 'عدّل هذه الصفحة من لوحة التحكم ← الصفحات الثابتة.'] },
  { title: 'سياسة الخصوصية', slug: 'privacy', body: ['نحترم خصوصية زوار موقعنا. لا نجمع إلا البيانات الضرورية لتشغيل الموقع، مثل البريد الإلكتروني عند الاشتراك في النشرة أو كتابة تعليق.', 'عدّل هذه الصفحة من لوحة التحكم ← الصفحات الثابتة.'] },
]
for (const p of pages)
  await payload.create({ collection: 'pages', data: { title: p.title, slug: p.slug, _status: 'published', content: doc(...p.body.map((b) => paragraph(b))) } })

// ── Ticker & homepage layout (mirrors the reference section order) ──
await payload.updateGlobal({ slug: 'ticker', data: { enabled: true, label: 'شريط الأخبار', source: 'breaking-then-latest', count: 10 } })
await payload.updateGlobal({
  slug: 'homepage',
  data: {
    sections: [
      { blockType: 'hero', timelineTitle: 'على مدار الساعة', timelineCount: 8, sliderCount: 10, teaserCategories: [cats['middle-east'], cats['africa']] },
      { blockType: 'tvBlock', title: 'ملفات TV', background: 'red' },
      { blockType: 'categoryBlock', category: cats['sports'], background: 'default' },
      { blockType: 'opinionBlock', category: cats['opinion'] },
      { blockType: 'categoryBlock', category: cats['sahara'], background: 'default' },
      { blockType: 'categoryBlock', category: cats['morocco'], background: 'default' },
      { blockType: 'categoryBlock', category: cats['america'], background: 'default' },
      { blockType: 'shortsBlock', title: 'سوشيال ملفات', background: 'red' },
      { blockType: 'categoryBlock', category: cats['diaspora'], background: 'default' },
      { blockType: 'widgetsBlock', photoCategory: cats['photo'], photoTitle: 'صورة وتعليق', background: 'red' },
      { blockType: 'threeColumns', categories: [cats['economy'], cats['incidents'], cats['culture']], background: 'default' },
      { blockType: 'threeColumns', categories: [cats['europe'], cats['society'], cats['africa']], background: 'default' },
    ] as any,
  },
})
console.log('• homepage layout + ticker')
console.log('✓ Seed complete')
process.exit(0)
