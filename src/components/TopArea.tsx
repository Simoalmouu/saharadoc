import { getSettings, getTickerItems } from '@/lib/queries'
import { imgUrl } from '@/lib/format'
import { AdSlot } from './Shared'
import { Ticker } from './client/Ticker'

/** Ticker (home only, like the reference) + campaign banner (every page). */
export async function TopArea({ ticker = false }: { ticker?: boolean }) {
  const [t, s] = await Promise.all([ticker ? getTickerItems() : null, getSettings()])
  return (
    <>
      {t && <Ticker label={t.label} items={t.items} logo={imgUrl(s.logoOnRed) || '/brand/logo-white.png'} />}
      <div className="container">
        <AdSlot placement="top-banner" className="top-banner" />
      </div>
    </>
  )
}
