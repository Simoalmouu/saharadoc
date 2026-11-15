import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { ar } from '@payloadcms/translations/languages/ar'
import { en } from '@payloadcms/translations/languages/en'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Authors } from './collections/Authors'
import { Categories } from './collections/Categories'
import { Tags } from './collections/Tags'
import { Posts } from './collections/Posts'
import { Videos } from './collections/Videos'
import { Ads } from './collections/Ads'
import { Comments } from './collections/Comments'
import { Subscribers } from './collections/Subscribers'
import { Pages } from './collections/Pages'
import { SiteSettings } from './globals/SiteSettings'
import { Homepage } from './globals/Homepage'
import { Ticker } from './globals/Ticker'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' — لوحة تحكم ملفات صحراوية', icons: [{ url: '/favicon.png' }] },
    components: {
      graphics: {
        Logo: '/components/admin/Brand#AdminLogo',
        Icon: '/components/admin/Brand#AdminIcon',
      },
    },
    importMap: { baseDir: path.resolve(dirname) },
  },
  i18n: { supportedLanguages: { ar, en }, fallbackLanguage: 'ar' },
  collections: [Posts, Videos, Categories, Tags, Authors, Media, Pages, Ads, Comments, Subscribers, Users],
  globals: [Homepage, Ticker, SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: sqliteAdapter({ client: { url: process.env.DATABASE_URL || '' } }),
  sharp,
  upload: { limits: { fileSize: 200_000_000 } },
})
