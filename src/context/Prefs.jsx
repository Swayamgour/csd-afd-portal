import { createContext, useContext, useEffect, useState } from 'react'
import { T } from '../data/i18n.js'

// Site ki default language. Hindi default chahiye to 'hi' kar do.
const DEFAULT_LANG = 'en'
const FONT_MIN = 87.5, FONT_MAX = 125, FONT_STEP = 12.5

const Ctx = createContext(null)
export const usePrefs = () => useContext(Ctx)

const read = (k, d) => { try { return localStorage.getItem(k) ?? d } catch { return d } }
const write = (k, v) => { try { localStorage.setItem(k, v) } catch { /* ignore */ } }

export function PrefsProvider({ children }) {
  const [lang, setLang] = useState(() => read('csd-lang', DEFAULT_LANG))
  const [font, setFont] = useState(() => Number(read('csd-font', 100)))
  const [contrast, setContrast] = useState(() => read('csd-contrast', '0') === '1')

  useEffect(() => {
    const el = document.documentElement
    el.lang = lang
    el.style.fontSize = `${font}%`
    el.classList.toggle('hc', contrast)
    write('csd-lang', lang); write('csd-font', font); write('csd-contrast', contrast ? '1' : '0')
  }, [lang, font, contrast])

  const value = {
    lang, font, contrast,
    t: key => T[lang]?.[key] ?? T.en[key] ?? key,
    pick: obj => obj?.[lang] ?? obj?.en,
    toggleLang: () => setLang(l => (l === 'en' ? 'hi' : 'en')),
    fontUp: () => setFont(f => Math.min(FONT_MAX, f + FONT_STEP)),
    fontDown: () => setFont(f => Math.max(FONT_MIN, f - FONT_STEP)),
    fontReset: () => setFont(100),
    toggleContrast: () => setContrast(c => !c),
    atMin: font <= FONT_MIN, atMax: font >= FONT_MAX,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
