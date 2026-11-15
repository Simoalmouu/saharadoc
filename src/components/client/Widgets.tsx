'use client'
import { useEffect, useMemo, useState } from 'react'

export const CITIES = [
  { id: 'laayoune', ar: 'العيون', en: 'Laayoune', lat: 27.1536, lon: -13.2033 },
  { id: 'dakhla', ar: 'الداخلة', en: 'Dakhla', lat: 23.6848, lon: -15.958 },
  { id: 'smara', ar: 'السمارة', en: 'Smara', lat: 26.7384, lon: -11.6719 },
  { id: 'boujdour', ar: 'بوجدور', en: 'Boujdour', lat: 26.1253, lon: -14.4846 },
  { id: 'guelmim', ar: 'كلميم', en: 'Guelmim', lat: 28.987, lon: -10.0574 },
  { id: 'tan-tan', ar: 'طانطان', en: 'Tan-Tan', lat: 28.438, lon: -11.103 },
  { id: 'rabat', ar: 'الرباط', en: 'Rabat', lat: 34.0209, lon: -6.8416 },
  { id: 'casablanca', ar: 'الدار البيضاء', en: 'Casablanca', lat: 33.5731, lon: -7.5898 },
  { id: 'marrakech', ar: 'مراكش', en: 'Marrakech', lat: 31.6295, lon: -7.9811 },
  { id: 'agadir', ar: 'أكادير', en: 'Agadir', lat: 30.4278, lon: -9.5981 },
  { id: 'fes', ar: 'فاس', en: 'Fes', lat: 34.0181, lon: -5.0078 },
  { id: 'tangier', ar: 'طنجة', en: 'Tangier', lat: 35.7595, lon: -5.834 },
  { id: 'beni-mellal', ar: 'بني ملال', en: 'Beni Mellal', lat: 32.3373, lon: -6.3498 },
]

function useCity(defaultCity: string, key: string) {
  const [city, setCity] = useState(defaultCity)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved && CITIES.some((c) => c.id === saved)) setCity(saved)
    } catch {}
  }, [key])
  const update = (v: string) => {
    setCity(v)
    try {
      localStorage.setItem(key, v)
    } catch {}
  }
  return [CITIES.find((c) => c.id === city) ?? CITIES[0], update] as const
}

function CitySelect({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <select className="city-select" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
      {CITIES.map((c) => (
        <option key={c.id} value={c.id}>
          {c.ar}
        </option>
      ))}
    </select>
  )
}

/* ───────────── Prayer times (Aladhan API, Moroccan method 21) ───────────── */
const PRAYERS = [
  { k: 'Fajr', ar: 'الفجر' },
  { k: 'Sunrise', ar: 'الشروق' },
  { k: 'Dhuhr', ar: 'الظهر' },
  { k: 'Asr', ar: 'العصر' },
  { k: 'Maghrib', ar: 'المغرب' },
  { k: 'Isha', ar: 'العشاء' },
]

type PrayerData = { timings: Record<string, string>; hijri: string }

export function PrayerWidget({ defaultCity }: { defaultCity: string }) {
  const [city, setCity] = useCity(defaultCity, 'prayer-city')
  const [data, setData] = useState<PrayerData | null>(null)
  const [err, setErr] = useState(false)
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    let alive = true
    setErr(false)
    const d = new Date()
    const date = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
    fetch(`https://api.aladhan.com/v1/timings/${date}?latitude=${city.lat}&longitude=${city.lon}&method=21`)
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return
        const h = j.data.date.hijri
        setData({ timings: j.data.timings, hijri: `${h.day} ${h.month.ar} ${h.year} هـ` })
      })
      .catch(() => alive && setErr(true))
    return () => {
      alive = false
    }
  }, [city])

  const next = useMemo(() => {
    if (!data || !now) return null
    const mins = now.getHours() * 60 + now.getMinutes()
    const list = PRAYERS.filter((p) => p.k !== 'Sunrise').map((p) => {
      const [h, m] = data.timings[p.k].split(':').map(Number)
      return { ...p, at: h * 60 + m }
    })
    const n = list.find((p) => p.at > mins) ?? { ...list[0], at: list[0].at + 1440 }
    const left = n.at - mins
    return { k: n.k, ar: n.ar, left: left >= 60 ? `بعد ${Math.floor(left / 60)} س ${left % 60} د` : `بعد ${left} د` }
  }, [data, now])

  return (
    <div className="widget prayer-widget">
      <div className="widget-top">
        <CitySelect value={city.id} onChange={setCity} label="اختر المدينة لمواقيت الصلاة" />
        <span className="widget-date">{data?.hijri ?? '…'}</span>
      </div>
      {err ? (
        <p className="widget-error">تعذّر تحميل المواقيت حالياً.</p>
      ) : (
        <>
          <div className="prayer-next">
            <span>
              الصلاة القادمة: <strong>{next?.ar ?? '…'}</strong>
            </span>
            {next && <span className="prayer-left">{next.left}</span>}
          </div>
          <ul className="prayer-grid">
            {PRAYERS.map((p) => (
              <li key={p.k} className={next?.k === p.k ? 'on' : ''}>
                <span>{p.ar}</span>
                <strong>{data?.timings[p.k]?.slice(0, 5) ?? '--:--'}</strong>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

/* ───────────── Weather (Open-Meteo, no key needed) ───────────── */
const WMO: Record<number, [string, string]> = {
  0: ['صحو', '☀️'], 1: ['صحو غالباً', '🌤️'], 2: ['غائم جزئياً', '⛅'], 3: ['غائم', '☁️'],
  45: ['ضباب', '🌫️'], 48: ['ضباب', '🌫️'], 51: ['رذاذ خفيف', '🌦️'], 53: ['رذاذ', '🌦️'], 55: ['رذاذ كثيف', '🌧️'],
  61: ['أمطار خفيفة', '🌦️'], 63: ['أمطار', '🌧️'], 65: ['أمطار غزيرة', '🌧️'], 71: ['ثلوج خفيفة', '🌨️'], 73: ['ثلوج', '🌨️'],
  75: ['ثلوج كثيفة', '❄️'], 80: ['زخات مطرية', '🌦️'], 81: ['زخات مطرية', '🌧️'], 82: ['زخات قوية', '⛈️'], 95: ['عواصف رعدية', '⛈️'], 96: ['عواصف وبرد', '⛈️'], 99: ['عواصف وبرد', '⛈️'],
}

type Wx = { temp: number; code: number; hum: number; wind: number; max: number; min: number }

export function WeatherWidget({ defaultCity }: { defaultCity: string }) {
  const [city, setCity] = useCity(defaultCity, 'weather-city')
  const [wx, setWx] = useState<Wx | null>(null)
  const [err, setErr] = useState(false)
  const [today, setToday] = useState('')

  useEffect(() => {
    setToday(new Intl.DateTimeFormat('ar-MA', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Casablanca' }).format(new Date()))
  }, [])

  useEffect(() => {
    let alive = true
    setErr(false)
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Africa%2FCasablanca&forecast_days=1`,
    )
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return
        setWx({
          temp: Math.round(j.current.temperature_2m),
          code: j.current.weather_code,
          hum: j.current.relative_humidity_2m,
          wind: Math.round(j.current.wind_speed_10m),
          max: Math.round(j.daily.temperature_2m_max[0]),
          min: Math.round(j.daily.temperature_2m_min[0]),
        })
      })
      .catch(() => alive && setErr(true))
    return () => {
      alive = false
    }
  }, [city])

  const [desc, icon] = wx ? (WMO[wx.code] ?? ['—', '🌡️']) : ['…', '⏳']

  return (
    <div className="widget weather-widget">
      <div className="widget-top">
        <CitySelect value={city.id} onChange={setCity} label="اختر المدينة لحالة الطقس" />
        <span className="widget-date">{today}</span>
      </div>
      {err ? (
        <p className="widget-error">تعذّر تحميل حالة الطقس حالياً.</p>
      ) : (
        <>
          <div className="wx-main">
            <span className="wx-icon" aria-hidden>{icon}</span>
            <span className="wx-temp" dir="ltr">{wx ? `${wx.temp}°` : '--°'}</span>
            <span className="wx-desc">{desc}</span>
          </div>
          <ul className="wx-stats">
            <li><span>العظمى</span><strong dir="ltr">{wx ? `${wx.max}°` : '--'}</strong></li>
            <li><span>الصغرى</span><strong dir="ltr">{wx ? `${wx.min}°` : '--'}</strong></li>
            <li><span>الرطوبة</span><strong dir="ltr">{wx ? `${wx.hum}%` : '--'}</strong></li>
            <li><span>الرياح</span><strong>{wx ? `${wx.wind} كم/س` : '--'}</strong></li>
          </ul>
        </>
      )}
    </div>
  )
}
