/** Minimal Lexical JSON builders for seeding rich text. */
const text = (t: string, format = 0) => ({ type: 'text', text: t, format, detail: 0, mode: 'normal', style: '', version: 1 })

const block = (type: string, children: any[], extra: Record<string, unknown> = {}) => ({
  type,
  children,
  direction: 'rtl',
  format: '',
  indent: 0,
  version: 1,
  ...extra,
})

export const paragraph = (t: string, bold = false) => block('paragraph', [text(t, bold ? 1 : 0)], { textFormat: 0, textStyle: '' })
export const heading = (t: string, tag: 'h2' | 'h3' = 'h2') => block('heading', [text(t)], { tag })

export const doc = (...children: any[]): any => ({ root: block("root", children) })
