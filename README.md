# Saharadoc — ملفات صحراوية

Arabic news website (RTL) with a built-in admin panel.
**Stack:** Next.js 16 · Payload CMS 3 (admin at `/admin`) · SQLite · Cairo font · no icon fonts, no jQuery.

## Run it locally

```bash
npm install
npm run seed      # first time only: logo, categories, demo articles, videos, ads, homepage layout
npm run dev       # http://localhost:3000  ·  admin: http://localhost:3000/admin
```

`npm run seed -- --reset` wipes the database and media folder, then seeds again.
If `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` are set in `.env`, the seed creates that admin user.
Otherwise `/admin` asks you to create the first user.

## What the editors manage (`/admin`)

| Admin section | Controls |
|---|---|
| المقالات والأخبار | Articles: title, excerpt, image, rich text, category, author, tags, **مميز** (hero slider), **عاجل** (ticker), drafts + preview |
| الفيديوهات | ملفات TV (16:9) and شورتس (9:16): YouTube/TikTok link or uploaded file |
| التصنيفات | Name, slug, order, show in menu / footer, heading icon |
| الصحفيون والكتّاب | Journalists, correspondents, columnists (each gets an `/author/...` page) |
| الصور والوسائط | Image library with alt text, credit, focal point; auto-resized |
| أقسام الصفحة الرئيسية | Drag-and-drop homepage sections: hero, 1+4 category blocks, TV, opinion, shorts, widgets, 3-column rows, ad slots; red or default background |
| شريط الأخبار العاجلة | Ticker on/off, label, source (breaking → latest), manual items |
| الإعلانات | Ads by placement (top banner, home, sidebar, in-article), image + link or AdSense code, start/end dates |
| التعليقات / المشتركون | Comment moderation (nothing is public until approved), newsletter list |
| الصفحات الثابتة | About, contact, privacy, … served at `/<slug>` |
| إعدادات الموقع | Name, logos, social links, footer text, contact info, default weather/prayer city, English-site link |

## Content imported from the old WordPress site

All 1,290 posts from saharadoc.com (Apr 2025 → Nov 2026) were imported with their categories, authors,
dates, featured images and in-article photos (about 4,400 images, shrunk to ≤1600px).
YouTube embeds became links. The TV/shorts sections hold the 15 latest videos of the YouTube channel.

Old links like `saharadoc.com/?p=14041` redirect permanently (308) to the new article URL
(each post keeps its WordPress ID in the read-only **رقم المقال في ووردبريس القديم** field).

To pull in posts published on WordPress after the import (the import is resumable and skips what is already in):

```bash
cd ../wp-import
rm posts/page-*.json posts/meta.json   # re-download the post list
node fetch.mjs posts                    # paced; stops if the host shows its bot-verification page
node fetch.mjs images
cd ../saharadoc
npm run import:wp -- --dir ../wp-import
npm run import:youtube -- --feed ../wp-import/youtube.xml   # refresh videos (replaces existing ones)
```

`saharadoc.backup-before-import.db` is the database as it was before the import.

## Deploying

Any Node 22+ host (VPS, Railway, Render, Fly.io…):

```bash
npm run build
npm start
```

Set `PAYLOAD_SECRET` (long random string), `DATABASE_URL`, and `NEXT_PUBLIC_SITE_URL=https://www.saharadoc.com`.
SQLite needs a persistent disk. For serverless hosts, swap to Postgres (`@payloadcms/db-postgres`) and an S3/R2 storage adapter for media.

## Routes

`/` · `/category/[slug]` · `/[article-slug]` · `/tag/[slug]` · `/author/[slug]` · `/search?q=` · `/tv` · `/shorts` · `/video/[slug]` ·
`/about` `/contact` `/privacy` · `/feed.xml` · `/sitemap.xml` · `/robots.txt` · `/admin`
