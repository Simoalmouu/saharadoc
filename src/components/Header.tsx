import Link from 'next/link'
import { getCategories, getSettings } from '@/lib/queries'
import { imgUrl } from '@/lib/format'
import { Icon } from './Icon'
import { ThemeToggle } from './client/ThemeToggle'
import { SearchButton } from './client/SearchOverlay'
import { MobileMenu } from './client/MobileMenu'
import { NavLinks } from './client/NavLinks'

export type NavItem = { label: string; href: string }

export async function Header() {
  const [s, cats] = await Promise.all([getSettings(), getCategories()])
  const logo = imgUrl(s.logoOnRed) || '/brand/logo-white.png'
  const name = s.arabicName || 'ملفات صحراوية'

  const nav: NavItem[] = [
    { label: 'الرئيسية', href: '/' },
    ...cats.filter((c) => c.showInNav).map((c) => ({ label: c.title, href: `/category/${c.slug}` })),
    { label: 'ملفات TV', href: '/tv' },
  ]
  const allLinks: NavItem[] = [
    ...nav,
    ...cats.filter((c) => !c.showInNav).map((c) => ({ label: c.title, href: `/category/${c.slug}` })),
    { label: 'سوشيال ملفات', href: '/shorts' },
  ]
  const socials = [
    { k: 'youtube', url: s.youtube, label: 'يوتيوب' },
    { k: 'facebook', url: s.facebook, label: 'فيسبوك' },
    { k: 'instagram', url: s.instagram, label: 'إنستغرام' },
    { k: 'tiktok', url: s.tiktok, label: 'تيك توك' },
    { k: 'x', url: s.x, label: 'إكس' },
  ].filter((x) => x.url)

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="topbar-start">
            <SearchButton />
            {socials.map((x, i) => (
              <a key={x.k} href={x.url!} className={`circle-btn ${i > 1 ? 'hide-sm' : ''}`} target="_blank" rel="noopener noreferrer" aria-label={x.label}>
                <Icon name={x.k} size={17} />
              </a>
            ))}
          </div>
          <Link href="/" className="brand" aria-label={`${name} — الصفحة الرئيسية`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt={name} width={152} height={84} />
          </Link>
          <div className="topbar-end">
            {s.englishSiteUrl ? (
              <a href={s.englishSiteUrl} className="pill-btn" hrefLang="en" lang="en">
                EN <Icon name="globe" size={15} />
              </a>
            ) : null}
            <ThemeToggle />
          </div>
        </div>
      </div>
      <nav className="mainnav" aria-label="القائمة الرئيسية">
        <div className="container mainnav-inner">
          <MobileMenu items={allLinks} socials={socials.map((x) => ({ k: x.k, url: x.url!, label: x.label }))} logo={logo} name={name} />
          <NavLinks items={nav} />
        </div>
      </nav>
    </header>
  )
}
