import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { dict, values } from './dict.js'

const Ctx = createContext(null)
export const useI18n = () => useContext(Ctx)
const read = (k, d) => { try { return localStorage.getItem(k) || d } catch { return d } }
const write = (k, v) => { try { localStorage.setItem(k, v) } catch { /* storage unavailable */ } }
const SIZES = [90, 100, 115, 130]
const vkeys = Object.keys(values).sort((a, b) => b.length - a.length)

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => (read('csd-lang', 'en') === 'hi' ? 'hi' : 'en'))
  const [size, setSize] = useState(() => Number(read('csd-size', 100)) || 100)
  const [contrast, setContrast] = useState(() => read('csd-contrast', '0') === '1')

  useEffect(() => { document.documentElement.lang = lang; write('csd-lang', lang) }, [lang])
  useEffect(() => { document.documentElement.style.fontSize = `${size}%`; write('csd-size', size) }, [size])
  useEffect(() => {
    document.documentElement.dataset.theme = contrast ? 'contrast' : 'light'
    write('csd-contrast', contrast ? '1' : '0')
  }, [contrast])

  const t = useCallback((key, vars) => {
    let s = dict[lang][key] ?? dict.en[key] ?? key
    if (vars) for (const k in vars) s = s.split(`{${k}}`).join(vars[k])
    return s
  }, [lang])
  // Translate catalogue values such as "Petrol", "Manual / Automatic", "Disc / Disc".
  const tv = useCallback(v => {
    if (v == null || lang === 'en' || typeof v !== 'string') return v
    let out = v
    for (const k of vkeys) out = out.replace(new RegExp(`\\b${k}\\b`, 'g'), values[k])
    return out
  }, [lang])
  // Content that is stored as a string (English only) or as { en, hi }.
  const L = useCallback(x => (x && typeof x === 'object' && !Array.isArray(x) ? x[lang] ?? x.en : x), [lang])
  const fmtDate = useCallback(d => d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), [lang])

  const value = useMemo(() => ({
    lang, setLang, t, tv, L, fmtDate, size, contrast, setContrast,
    toggleLang: () => setLang(l => (l === 'en' ? 'hi' : 'en')),
    incSize: () => setSize(s => SIZES[Math.min(SIZES.indexOf(s) + 1, SIZES.length - 1)] ?? 100),
    decSize: () => setSize(s => SIZES[Math.max(SIZES.indexOf(s) - 1, 0)] ?? 100),
    resetSize: () => setSize(100),
  }), [lang, t, tv, L, fmtDate, size, contrast])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// Per-page <title> (GIGW: every page needs a unique, meaningful title).
export function usePageTitle(title) {
  const { t } = useI18n()
  useEffect(() => { document.title = title ? `${title} | ${t('site.title')}` : t('site.title') }, [title, t])
}

// Product helpers
export function useProductText() {
  const { t, tv, L, lang } = useI18n()
  const name = p => (lang === 'hi' && p.nameHi) || p.name
  const price = p => {
    if (p.category === 'white-goods') return `₹${p.lo.toLocaleString('en-IN')}`
    const f = v => (Number.isInteger(v) ? String(v) : v.toFixed(2))
    const r = p.lo === p.hi ? f(p.lo) : `${f(p.lo)} - ${f(p.hi)}`
    return `₹${r} ${t('unit.lakh')}`
  }
  return { name, price, t, tv, L, lang }
}
