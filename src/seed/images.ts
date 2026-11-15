import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

/**
 * Generated placeholder artwork (desert landscapes) so the demo site has images
 * without using anyone else's photos. Replace them from the admin with your own.
 */
const dir = path.dirname(fileURLToPath(import.meta.url))
export const assetPath = (f: string) => path.join(dir, 'assets', f)

const PALETTES: [string, string, string, string, string][] = [
  // sky top, sky bottom, sun, dune1, dune2
  ['#1d2b53', '#e6875a', '#ffd59e', '#c8763f', '#8e4a26'],
  ['#5aa6d6', '#f3e2c0', '#fff6d8', '#e0a96d', '#b8743d'],
  ['#2b1b3d', '#c6426e', '#ffcf7a', '#a33a3a', '#5e1f2b'],
  ['#0f2027', '#2c5364', '#e8f1f5', '#3a6073', '#16222a'],
  ['#f2994a', '#f2c94c', '#fffbe6', '#d9822b', '#9c5518'],
  ['#3a1c71', '#d76d77', '#ffaf7b', '#b2563f', '#6b2b2b'],
  ['#134e5e', '#71b280', '#f7f7d0', '#c9a26b', '#7d5a35'],
  ['#200122', '#6f0000', '#ff9a8b', '#ba1622', '#3d0a0e'],
]

function rand(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

function dunePath(w: number, h: number, base: number, amp: number, r: () => number) {
  const pts = 5
  let d = `M0 ${h} L0 ${base}`
  for (let i = 1; i <= pts; i++) {
    const x = (w / pts) * i
    const cx = x - w / pts / 2
    const cy = base - amp * (0.4 + r())
    d += ` Q${cx.toFixed(0)} ${cy.toFixed(0)} ${x.toFixed(0)} ${(base + (r() - 0.5) * amp * 0.4).toFixed(0)}`
  }
  return d + ` L${w} ${h} Z`
}

export function landscapeSVG(seed: number, w = 1200, h = 750, opts: { vertical?: boolean } = {}) {
  const r = rand(seed * 9973 + 7)
  const [sky1, sky2, sun, d1, d2] = PALETTES[seed % PALETTES.length]
  const sunX = w * (0.2 + r() * 0.6)
  const sunY = h * (0.25 + r() * 0.2)
  const sunR = Math.min(w, h) * (0.07 + r() * 0.06)
  const palms = r() > 0.6
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky1}"/><stop offset="1" stop-color="${sky2}"/></linearGradient>
    <radialGradient id="g"><stop offset="0" stop-color="${sun}" stop-opacity=".9"/><stop offset="1" stop-color="${sun}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#s)"/>
  <circle cx="${sunX}" cy="${sunY}" r="${sunR * 3}" fill="url(#g)"/>
  <circle cx="${sunX}" cy="${sunY}" r="${sunR}" fill="${sun}"/>
  <path d="${dunePath(w, h, h * 0.62, h * 0.12, r)}" fill="${d1}" opacity=".85"/>
  <path d="${dunePath(w, h, h * 0.74, h * 0.14, r)}" fill="${d2}"/>
  <path d="${dunePath(w, h, h * 0.88, h * 0.08, r)}" fill="${d2}" opacity=".7" style="mix-blend-mode:multiply"/>
  ${
    palms
      ? `<g fill="#1a0d08" opacity=".85" transform="translate(${w * 0.8} ${h * 0.6}) scale(${h / 750})">
      <rect x="-6" y="-10" width="12" height="190" rx="5" transform="rotate(4)"/>
      <path d="M0 -10 C-60 -50 -120 -30 -150 10 C-100 -20 -50 -20 0 -10Z"/><path d="M0 -10 C60 -60 120 -40 150 0 C100 -30 50 -25 0 -10Z"/>
      <path d="M0 -10 C-30 -80 -90 -100 -120 -90 C-70 -70 -30 -50 0 -10Z"/><path d="M0 -10 C30 -90 80 -110 110 -100 C70 -80 30 -50 0 -10Z"/></g>`
      : ''
  }
  ${opts.vertical ? '' : ''}
</svg>`
}

export async function landscapeJPG(seed: number, w = 1200, h = 750) {
  return sharp(Buffer.from(landscapeSVG(seed, w, h))).jpeg({ quality: 82, mozjpeg: true }).toBuffer()
}

/** Video thumbnail: landscape + bold headline band, like a TV cover. */
export async function videoThumbJPG(seed: number, headline: string, w = 1280, h = 720) {
  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#f)"/>
    <rect x="${w - 330}" y="40" width="290" height="70" rx="6" fill="#BA1622"/>
    <text x="${w - 185}" y="88" font-family="Segoe UI, Tahoma, Arial" font-weight="700" font-size="38" fill="#fff" text-anchor="middle">&#x202B;ملفات TV&#x202C;</text>
    <text x="${w / 2}" y="${h - 90}" font-family="Segoe UI, Tahoma, Arial" font-weight="800" font-size="76" fill="#fff" text-anchor="middle">${headline}</text>
  </svg>`
  const logo = await sharp(assetPath('logo-white.png')).resize({ width: 200 }).toBuffer()
  return sharp(Buffer.from(landscapeSVG(seed, w, h)))
    .composite([
      { input: Buffer.from(overlay), top: 0, left: 0 },
      { input: logo, top: 30, left: 40 },
    ])
    .jpeg({ quality: 84, mozjpeg: true })
    .toBuffer()
}

/** Vertical 9:16 cover for shorts. */
export async function shortThumbJPG(seed: number, headline: string, w = 720, h = 1280) {
  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#f)"/>
    <rect x="60" y="${h - 330}" width="${w - 120}" height="110" rx="10" fill="#BA1622"/>
    <text x="${w / 2}" y="${h - 255}" font-family="Segoe UI, Tahoma, Arial" font-weight="800" font-size="60" fill="#fff" text-anchor="middle">${headline}</text>
  </svg>`
  const logo = await sharp(assetPath('logo-white.png')).resize({ width: 220 }).toBuffer()
  return sharp(Buffer.from(landscapeSVG(seed + 3, w, h)))
    .composite([
      { input: Buffer.from(overlay), top: 0, left: 0 },
      { input: logo, top: 50, left: Math.round((w - 220) / 2) },
    ])
    .jpeg({ quality: 84, mozjpeg: true })
    .toBuffer()
}

/** Campaign banner 1170×250 promoting the site itself. */
export async function bannerJPG(w = 1170, h = 250) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0b0b0b"/><stop offset=".55" stop-color="#2a0507"/><stop offset="1" stop-color="#BA1622"/></linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#b)"/>
    <path d="M0 ${h} Q ${w * 0.25} ${h * 0.55} ${w * 0.5} ${h * 0.8} T ${w} ${h * 0.65} V ${h} Z" fill="#BA1622" opacity=".35"/>
    <path d="M0 ${h} Q ${w * 0.3} ${h * 0.75} ${w * 0.6} ${h * 0.92} T ${w} ${h * 0.85} V ${h} Z" fill="#000" opacity=".45"/>
    <rect x="${w * 0.62 - 135}" y="34" width="270" height="52" rx="26" fill="#BA1622"/>
    <text x="${w * 0.62}" y="70" font-family="Segoe UI, Tahoma, Arial" font-weight="700" font-size="30" fill="#fff" text-anchor="middle">• متابعة مستمرة •</text>
    <text x="${w * 0.62}" y="150" font-family="Segoe UI, Tahoma, Arial" font-weight="800" font-size="62" fill="#fff" text-anchor="middle">أخبار الصحراء المغربية</text>
    <text x="${w * 0.62}" y="208" font-family="Segoe UI, Tahoma, Arial" font-weight="600" font-size="30" fill="#f2d7d9" text-anchor="middle">جريدة إلكترونية متجددة على مدار الساعة</text>
  </svg>`
  const logo = await sharp(assetPath('logo-dark.png')).resize({ height: 150 }).toBuffer()
  return sharp(Buffer.from(svg))
    .composite([{ input: logo, top: 50, left: 36 }])
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer()
}
