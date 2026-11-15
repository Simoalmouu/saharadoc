import type { Metadata, Viewport } from 'next'
import { Cairo } from 'next/font/google'
import React from 'react'
import Script from 'next/script'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { BackToTop, ProgressBar } from '@/components/client/ScrollUi'
import { getSettings } from '@/lib/queries'
import { SITE_URL } from '@/lib/format'
import './styles.css'

const cairo = Cairo({ subsets: ['arabic', 'latin'], weight: ['400', '600', '700', '800'], display: 'swap', variable: '--font-cairo' })

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  const name = s.arabicName || 'ملفات صحراوية'
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${name} - ${s.tagline ?? ''}`, template: `%s - ${name}` },
    description: s.tagline ?? undefined,
    applicationName: name,
    icons: { icon: '/favicon.png', apple: '/apple-touch-icon.png' },
    openGraph: { siteName: name, locale: 'ar_MA', type: 'website' },
    alternates: { types: { 'application/rss+xml': '/feed.xml' } },
  }
}

export const viewport: Viewport = {
  themeColor: '#BA1622',
  width: 'device-width',
  initialScale: 1,
}

// Applies the saved/system theme before paint so there is no light/dark flash.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})()`

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">{themeScript}</Script>
      </head>
      <body>
        <ProgressBar />
        <a className="skip-link" href="#main">تخطي إلى المحتوى</a>
        <Header />
        <main id="main" className="site-main">
          {children}
        </main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  )
}
