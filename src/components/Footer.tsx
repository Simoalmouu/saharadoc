import Link from 'next/link'
import { getCategories, getSettings } from '@/lib/queries'
import { imgUrl } from '@/lib/format'
import { Icon } from './Icon'
import { NewsletterForm } from './client/Forms'

function FooterHeading({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <h2 className="footer-heading">
      <span>
        <Icon name={icon} size={15} /> {children}
      </span>
    </h2>
  )
}

export async function Footer() {
  const [s, cats] = await Promise.all([getSettings(), getCategories()])
  const logo = imgUrl(s.logoOnDark) || '/brand/logo-dark.png'
  const name = s.arabicName || 'ملفات صحراوية'
  const footerCats = cats.filter((c) => c.showInFooter)
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <section className="footer-col">
          <FooterHeading icon="info">عن {name}</FooterHeading>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt={name} className="footer-logo" width={180} height={99} loading="lazy" />
          {(s.about || '').split(/\n+/).filter(Boolean).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>
        <section className="footer-col">
          <FooterHeading icon="list">أقسام الموقع</FooterHeading>
          <ul className="footer-links">
            {footerCats.map((c) => (
              <li key={c.id}>
                <Link href={`/category/${c.slug}`}>{c.title}</Link>
              </li>
            ))}
            <li><Link href="/tv">ملفات TV</Link></li>
            <li><Link href="/about">من نحن</Link></li>
            <li><Link href="/contact">تواصل معنا</Link></li>
            <li><Link href="/privacy">سياسة الخصوصية</Link></li>
            {(s.footerLinks ?? []).map((l) => (
              <li key={l.id}>
                <Link href={l.url}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="footer-col">
          <FooterHeading icon="envelope">تواصل معنا</FooterHeading>
          <p>اشترك في نشرتنا البريدية للحصول على آخر الأخبار</p>
          <NewsletterForm />
          <ul className="footer-contact">
            {s.email && (
              <li>
                <Icon name="mail" size={16} /> <a href={`mailto:${s.email}`}>{s.email}</a>
              </li>
            )}
            {s.phone && (
              <li>
                <Icon name="phone" size={16} /> <a href={`tel:${s.phone.replace(/\s/g, '')}`} dir="ltr">{s.phone}</a>
              </li>
            )}
            {s.address && (
              <li>
                <Icon name="pin" size={16} /> {s.address}
              </li>
            )}
          </ul>
        </section>
      </div>
      <div className="footer-bottom">
        <div className="container">© {new Date().getFullYear()} {s.copyright || `${name}. جميع الحقوق محفوظة.`}</div>
      </div>
    </footer>
  )
}
