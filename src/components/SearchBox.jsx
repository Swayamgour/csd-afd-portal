import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, X, ArrowUpRight, Tag, Layers } from 'lucide-react'
import { useStoreProducts } from '../hooks/useStoreProducts.js'
import { CAT_LABEL, matches, priceFrom, onImgError } from '../data/utils.js'

const MIN = 2

const Mark = ({ text, q }) => {
  const words = q.split(/\s+/).filter(Boolean).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  if (!words.length) return text
  const re = new RegExp(`(${words.join('|')})`, 'ig')
  return text.split(re).map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part))
}

export function buildSuggestions(q, productList = []) {
  const s = q.trim().toLowerCase()
  if (s.length < MIN) return []
  const score = p => {
    const n = (p.name || '').toLowerCase()
    const sku = String(p.sku || p.indexNo || '').toLowerCase()
    const mfr = String(p.mfrCode || p.mfr || p.firmCode || '').toLowerCase()
    if (sku.startsWith(s) || mfr.startsWith(s)) return 0
    if (n.startsWith(s)) return 1
    if (sku.includes(s) || mfr.includes(s)) return 2
    if (n.split(' ').some(w => w.startsWith(s))) return 3
    if (n.includes(s)) return 4
    return 5
  }
  const prods = (productList || []).filter(p => matches(p, s)).sort((a, b) => score(a) - score(b)).slice(0, 6)
  const out = prods.map(p => ({
    kind: 'product',
    key: p.id || p._id,
    label: p.name,
    sub: `${p.sku ? `SKU: ${p.sku} ` : ''}${p.mfrCode ? `· Mfr: ${p.mfrCode} ` : ''}· ${CAT_LABEL[p.category] || 'Vehicle'} · ${p.brand} · ${priceFrom(p)}`,
    p
  }))
  const brands = [...new Set((productList || []).filter(p => (p.brand || '').toLowerCase().includes(s)).map(p => p.brand))].slice(0, 2)
  brands.forEach(b => out.push({ kind: 'brand', key: 'b-' + b, label: b, sub: `${(productList || []).filter(p => p.brand === b).length} products` }))
  const types = [...new Set((productList || []).filter(p => (p.type || '').toLowerCase().includes(s)).map(p => p.type))].slice(0, 2)
  types.forEach(t => out.push({ kind: 'type', key: 't-' + t, label: t, sub: 'Category' }))
  return out
}

export default function SearchBox({ variant = 'header', placeholder = 'Search cars, bikes, SKU, Mfr code…' }) {
  const loc = useLocation(), go = useNavigate()
  const fromUrl = loc.pathname === '/search' ? new URLSearchParams(loc.search).get('q') || '' : ''
  const [q, setQ] = useState(fromUrl), [open, setOpen] = useState(false), [active, setActive] = useState(-1)
  const [wantData, setWantData] = useState(false)
  const box = useRef(null), input = useRef(null)

  // Shared, cached request - only fires once the user actually touches the search box
  // (or the products are already cached by Home / Catalog, in which case no new call is made).
  const { products: liveProducts, isLoading, isError, refetch } = useStoreProducts({ skip: !wantData })

  useEffect(() => { setQ(fromUrl) }, [fromUrl])
  useEffect(() => {
    const away = e => { if (box.current && !box.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', away)
    return () => document.removeEventListener('mousedown', away)
  }, [])

  const items = useMemo(() => buildSuggestions(q, liveProducts), [q, liveProducts])
  const ready = q.trim().length >= MIN
  const total = items.length + (ready ? 1 : 0)

  const run = text => {
    const t = text.trim()
    if (!t) return
    setQ(t); setOpen(false); setActive(-1); input.current?.blur()
    go(`/search?q=${encodeURIComponent(t)}`)
  }
  const onKey = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive(a => (a + 1) % Math.max(total, 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => (a <= 0 ? total - 1 : a - 1)) }
    else if (e.key === 'Escape') { setOpen(false); setActive(-1) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      if (active >= 0 && active < items.length) run(items[active].label)
      else run(q)
    }
  }
  const icon = it => it.kind === 'brand' ? <Tag size={16} /> : <Layers size={16} />

  return (
    <div className={`sbox ${variant}`} ref={box}>
      <form role="search" onSubmit={e => { e.preventDefault(); run(q) }}>
        <Search aria-hidden size={19} className="sbox-ic" />
        <input
          ref={input} id={`q-${variant}`} type="search" autoComplete="off" value={q} placeholder={placeholder}
          role="combobox" aria-expanded={open} aria-controls={`sg-${variant}`} aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `sg-${variant}-${active}` : undefined}
          aria-label="Search products, brands or categories"
          onChange={e => { setWantData(true); setQ(e.target.value); setOpen(true); setActive(-1) }}
          onFocus={() => { setWantData(true); setOpen(true) }} onKeyDown={onKey}
        />
        {q && <button type="button" className="sbox-clear" aria-label="Clear search" onClick={() => { setQ(''); input.current?.focus() }}><X size={16} /></button>}
        <button type="submit" className="sbox-go">Search</button>
      </form>

      {open && (
        <div className="sbox-pop" id={`sg-${variant}`} role="listbox">
          {!ready && (
            <div className="sbox-hint">
              <p>{q.trim() ? `Type ${MIN - q.trim().length} more letter${MIN - q.trim().length > 1 ? 's' : ''} to see suggestions` : `Type at least ${MIN} letters to see suggestions`}</p>
            </div>
          )}
          {ready && isLoading && <p className="sbox-empty">Loading products…</p>}
          {ready && isError && <p className="sbox-empty">Search suggestions are not available right now. <button type="button" className="link" onMouseDown={e => e.preventDefault()} onClick={refetch}>Retry</button></p>}
          {ready && !isLoading && !isError && !items.length && <p className="sbox-empty">No matches for “{q}”. Try another name or brand.</p>}
          {items.map((it, i) => (
            <button
              type="button" role="option" key={it.key} id={`sg-${variant}-${i}`} aria-selected={active === i}
              className={`sbox-row ${active === i ? 'on' : ''}`} onMouseEnter={() => setActive(i)}
              onMouseDown={e => e.preventDefault()} onClick={() => run(it.label)}
            >
              {it.kind === 'product'
                ? <img src={it.p.image} alt="" loading="lazy" onError={e => onImgError(e, it.p.name)} />
                : <span className="sbox-ico">{icon(it)}</span>}
              <span className="sbox-txt">
                <strong><Mark text={it.label} q={q.trim()} /></strong>
                <small><Mark text={it.sub} q={q.trim()} /></small>
              </span>
              <ArrowUpRight size={16} aria-hidden className="sbox-arrow" />
            </button>
          ))}
          {ready && (
            <button type="button" role="option" id={`sg-${variant}-${items.length}`} aria-selected={active === items.length}
              className={`sbox-all ${active === items.length ? 'on' : ''}`} onMouseDown={e => e.preventDefault()} onClick={() => run(q)}>
              <Search size={15} aria-hidden /> See all results for “{q.trim()}”
            </button>
          )}
        </div>
      )}
    </div>
  )
}
