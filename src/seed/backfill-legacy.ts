/** Stores each imported post's WordPress ID (from import-state.json) so /?p=<id> can redirect. */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
const dir = path.resolve(process.argv[2] || '../wp-import')
const state = JSON.parse(fs.readFileSync(path.join(dir, 'import-state.json'), 'utf8'))
const { default: config } = await import('../payload.config')
const payload = await getPayload({ config })
let n = 0
for (const [wpId, id] of Object.entries(state.posts as Record<string, number>)) {
  await payload.db.updateOne({ collection: 'posts', id, data: { legacyId: Number(wpId) } })
  n++
}
console.log(`• stored ${n} WordPress IDs`)
process.exit(0)
