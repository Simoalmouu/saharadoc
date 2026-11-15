import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '80px 16px' }}>
      <p style={{ fontSize: 72, fontWeight: 800, color: 'var(--red)', margin: 0 }}>404</p>
      <h1 style={{ fontSize: 26, marginBottom: 12 }}>الصفحة غير موجودة</h1>
      <p style={{ color: 'var(--muted)' }}>ربما حُذفت هذه الصفحة أو تغيّر رابطها.</p>
      <Link href="/" className="btn-red" style={{ marginTop: 16 }}>
        العودة إلى الرئيسية
      </Link>
    </div>
  )
}
