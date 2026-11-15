/**
 * Replaces the demo videos with the latest uploads from the Saharadoc YouTube channel.
 *   npm run import:youtube -- --feed ../wp-import/youtube.xml
 * Shorts are detected by whether youtube.com/shorts/<id> serves the video (200) or redirects (303).
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import { decodeEntities } from './wp-html'
import { slugify } from '../lib/slug'

const arg = (k: string, d: string) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d)
const FEED = path.resolve(arg('--feed', '../wp-import/youtube.xml'))
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const xml = fs.readFileSync(FEED, 'utf8')
const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => {
  const e = m[1]
  return {
    id: e.match(/<yt:videoId>([^<]+)/)![1],
    title: decodeEntities(e.match(/<title>([^<]*)/)![1]).trim(),
    published: e.match(/<published>([^<]+)/)![1],
    description: decodeEntities(e.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1] || '').trim(),
  }
})

const { default: config } = await import('../payload.config')
const payload = await getPayload({ config })

// remove demo videos and their thumbnails
const old = await payload.find({ collection: 'videos', limit: 200, depth: 0, overrideAccess: true })
for (const v of old.docs) {
  await payload.delete({ collection: 'videos', id: v.id, overrideAccess: true })
  if (typeof v.thumbnail === 'number') await payload.delete({ collection: 'media', id: v.thumbnail, overrideAccess: true }).catch(() => {})
}
console.log(`• removed ${old.docs.length} demo videos`)

let tv = 0, shorts = 0
for (const e of entries) {
  const s = await fetch(`https://www.youtube.com/shorts/${e.id}`, { redirect: 'manual', headers: { 'User-Agent': UA } })
  const isShort = s.status === 200
  await sleep(1500)
  let thumb: Buffer | null = null
  for (const name of ['maxresdefault', 'hq720', 'hqdefault']) {
    const r = await fetch(`https://i.ytimg.com/vi/${e.id}/${name}.jpg`, { headers: { 'User-Agent': UA } })
    if (r.ok) {
      thumb = Buffer.from(await r.arrayBuffer())
      break
    }
  }
  if (!thumb) {
    console.log(`  ! no thumbnail for ${e.id}, skipped`)
    continue
  }
  const media = await payload.create({
    collection: 'media',
    data: { alt: e.title, credit: 'YouTube — ملفات صحراوية' },
    file: { data: thumb, name: `yt-${e.id}.jpg`, mimetype: 'image/jpeg', size: thumb.length },
  })
  await payload.create({
    collection: 'videos',
    data: {
      title: e.title || 'فيديو ملفات صحراوية',
      slug: `${slugify(e.title) || 'video'}-${e.id.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6)}`,
      kind: isShort ? 'short' : 'tv',
      thumbnail: media.id,
      youtubeUrl: isShort ? `https://www.youtube.com/shorts/${e.id}` : `https://www.youtube.com/watch?v=${e.id}`,
      description: e.description.slice(0, 1500),
      publishedAt: new Date(e.published).toISOString(),
      _status: 'published',
    },
  })
  isShort ? shorts++ : tv++
}
console.log(`• imported ${tv} TV videos and ${shorts} shorts`)
process.exit(0)
