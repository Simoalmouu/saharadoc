/**
 * WordPress HTML → Payload Lexical JSON.
 * Handles paragraphs, headings, quotes, lists, bold/italic/underline, links, line breaks,
 * images (as upload nodes) and YouTube iframes (as a link paragraph).
 */
import { parse, NodeType, type HTMLElement, type Node } from 'node-html-parser'
import { randomUUID } from 'crypto'

export type ImageResolver = (src: string, alt: string) => Promise<number | null>

const BOLD = 1, ITALIC = 2, UNDERLINE = 8

const base = { direction: 'rtl', format: '', indent: 0, version: 1 }
const textNode = (text: string, format: number) => ({ type: 'text', text, format, detail: 0, mode: 'normal', style: '', version: 1 })
const paragraph = (children: any[]) => ({ ...base, type: 'paragraph', textFormat: 0, textStyle: '', children })
const linkNode = (url: string, children: any[]) => ({
  ...base,
  type: 'link',
  version: 3,
  id: randomUUID(),
  fields: { linkType: 'custom', newTab: true, url },
  children,
})
const uploadNode = (id: number) => ({ type: 'upload', version: 3, format: '', id: randomUUID(), fields: null, relationTo: 'media', value: id })

export function decodeEntities(s: string) {
  return parse(`<p>${s}</p>`).text
}

const INLINE = new Set(['strong', 'b', 'em', 'i', 'u', 'a', 'span', 'br', 'sup', 'sub', 'small', 'mark', 'code', 'abbr', 'time', 'font', 'del', 's', 'ins'])

function isBlank(children: any[]) {
  return !children.some((c) => (c.type === 'text' ? c.text.trim() : c.type !== 'linebreak'))
}

/** Inline content of one block → lexical inline nodes; images found inline are hoisted out. */
function inlineNodes(node: Node, format: number, hoisted: HTMLElement[]): any[] {
  if (node.nodeType === NodeType.TEXT_NODE) {
    const t = (node as any).text.replace(/[\s ]+/g, ' ')
    return t ? [textNode(t, format)] : []
  }
  if (node.nodeType !== NodeType.ELEMENT_NODE) return []
  const el = node as HTMLElement
  const tag = el.tagName?.toLowerCase()
  if (tag === 'img' || tag === 'iframe' || tag === 'figure') {
    hoisted.push(el)
    return []
  }
  if (tag === 'br') return [{ type: 'linebreak', version: 1 }]
  let f = format
  if (tag === 'strong' || tag === 'b') f |= BOLD
  if (tag === 'em' || tag === 'i') f |= ITALIC
  if (tag === 'u') f |= UNDERLINE
  const kids = el.childNodes.flatMap((c) => inlineNodes(c, f, hoisted))
  if (tag === 'a') {
    const href = el.getAttribute('href')
    if (href && /^https?:\/\//.test(href) && kids.length) return [linkNode(href, kids.filter((k) => k.type === 'text'))]
  }
  return kids
}

function trimEdges(children: any[]) {
  const c = [...children]
  while (c.length && c[0].type === 'linebreak') c.shift()
  while (c.length && c[c.length - 1].type === 'linebreak') c.pop()
  if (c[0]?.type === 'text') c[0] = { ...c[0], text: c[0].text.replace(/^\s+/, '') }
  const last = c[c.length - 1]
  if (last?.type === 'text') c[c.length - 1] = { ...last, text: last.text.replace(/\s+$/, '') }
  return c.filter((x) => x.type !== 'text' || x.text)
}

export async function htmlToLexical(html: string, resolveImage: ImageResolver, skipSrc?: (src: string) => boolean) {
  const root = parse(html, { blockTextElements: { script: false, style: false, pre: true } })
  const out: any[] = []
  let skippedFirst = false

  const media = async (el: HTMLElement) => {
    const img = el.tagName.toLowerCase() === 'img' ? el : el.querySelector('img')
    if (img) {
      const src = img.getAttribute('src') || img.getAttribute('data-src') || ''
      if (!src) return
      // the featured image is often repeated as the first image of the body — show it once
      if (!skippedFirst && skipSrc?.(src)) {
        skippedFirst = true
        return
      }
      const id = await resolveImage(src, decodeEntities(img.getAttribute('alt') || ''))
      if (id) out.push(uploadNode(id))
      const cap = el.querySelector('figcaption')?.text.trim()
      if (cap) out.push(paragraph([textNode(cap, ITALIC)]))
      return
    }
    const frame = el.tagName.toLowerCase() === 'iframe' ? el : el.querySelector('iframe')
    const src = frame?.getAttribute('src') || ''
    const yt = src.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]{11})/)
    if (yt) {
      const url = `https://www.youtube.com/watch?v=${yt[1]}`
      out.push(paragraph([textNode('▶ ', BOLD), linkNode(url, [textNode(decodeEntities(frame!.getAttribute('title') || 'شاهد الفيديو على يوتيوب'), BOLD)])]))
    }
  }

  const block = async (el: HTMLElement) => {
    const tag = el.tagName?.toLowerCase()
    if (!tag) return
    if (tag === 'img' || tag === 'iframe' || tag === 'figure') return media(el)
    if (/^h[1-6]$/.test(tag)) {
      const hoisted: HTMLElement[] = []
      const kids = trimEdges(el.childNodes.flatMap((c) => inlineNodes(c, 0, hoisted)))
      if (!isBlank(kids)) out.push({ ...base, type: 'heading', tag: tag === 'h1' || tag === 'h2' ? 'h2' : tag === 'h3' ? 'h3' : 'h4', children: kids })
      for (const h of hoisted) await media(h)
      return
    }
    if (tag === 'ul' || tag === 'ol') {
      const items = el.childNodes.filter((c) => (c as HTMLElement).tagName?.toLowerCase() === 'li') as HTMLElement[]
      const children = items
        .map((li, i) => ({ ...base, type: 'listitem', value: i + 1, children: trimEdges(li.childNodes.flatMap((c) => inlineNodes(c, 0, []))) }))
        .filter((li) => !isBlank(li.children))
      if (children.length) out.push({ ...base, type: 'list', listType: tag === 'ul' ? 'bullet' : 'number', tag, start: 1, children })
      return
    }
    if (tag === 'blockquote') {
      if (el.classList.contains('twitter-tweet')) {
        const a = el.querySelectorAll('a').pop()
        if (a?.getAttribute('href')) out.push(paragraph([linkNode(a.getAttribute('href')!, [textNode('عرض التغريدة', 0)])]))
        return
      }
      const kids = trimEdges(el.childNodes.flatMap((c) => [...inlineNodes(c, 0, []), ...((c as HTMLElement).tagName === 'P' ? [{ type: 'linebreak', version: 1 }] : [])]))
      if (!isBlank(kids)) out.push({ ...base, type: 'quote', children: kids })
      return
    }
    if (tag === 'p' || INLINE.has(tag)) {
      const hoisted: HTMLElement[] = []
      const kids = trimEdges(inlineNodes(el, 0, hoisted))
      if (!isBlank(kids)) out.push(paragraph(kids))
      for (const h of hoisted) await media(h)
      return
    }
    if (tag === 'script' || tag === 'style' || tag === 'noscript') return
    // div, section, article, figure wrappers, tables… → walk children
    let pending: Node[] = []
    const flush = () => {
      const hoisted: HTMLElement[] = []
      const kids = trimEdges(pending.flatMap((c) => inlineNodes(c, 0, hoisted)))
      if (!isBlank(kids)) out.push(paragraph(kids))
      pending = []
      return hoisted
    }
    for (const c of el.childNodes) {
      const ct = (c as HTMLElement).tagName?.toLowerCase()
      if (c.nodeType === NodeType.TEXT_NODE || (ct && INLINE.has(ct))) {
        pending.push(c)
        continue
      }
      for (const h of flush()) await media(h)
      if (ct) await block(c as HTMLElement)
    }
    for (const h of flush()) await media(h)
  }

  // top level: treat root like a div
  const wrapper = parse('<div></div>').firstChild as HTMLElement
  wrapper.childNodes.push(...root.childNodes)
  await block(wrapper)

  return { root: { ...base, type: 'root', children: out.length ? out : [paragraph([])] } }
}

export function htmlToPlain(html: string, max = 300) {
  const t = parse(html)
    .text.replace(/[​-‏﻿]/g, '')
    .replace(/[\s ]+/g, ' ')
    .replace(/\[(…|&hellip;|\.\.\.)\]/g, '')
    .trim()
  return t.length > max ? t.slice(0, max).replace(/\s+\S*$/, '') + '…' : t
}
