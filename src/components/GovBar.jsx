import { Link } from 'react-router-dom'
import { Contrast, Languages } from 'lucide-react'
import { usePrefs } from '../context/Prefs.jsx'

export default function GovBar() {
  const { t, lang, contrast, toggleLang, toggleContrast, fontUp, fontDown, fontReset, atMin, atMax } = usePrefs()
  const skip = e => {
    e.preventDefault()
    const m = document.getElementById('main')
    if (m) { m.focus(); m.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  }
  return (
    <div className="govbar">
      <div className="govbar-flag" aria-hidden><i /><i /><i /></div>
      <div className="govbar-in">
        <p className="govbar-id" lang="hi">
          <span>{t('govHindi')}</span><b aria-hidden>|</b>
          <span lang="en">{t('govEn')}</span><b aria-hidden>|</b>
          <span>{t('modHindi')}</span><b aria-hidden>|</b>
          <span lang="en">{t('modEn')}</span>
        </p>
        <div className="govbar-tools">
          <a href="#main" className="govbar-link" onClick={skip}>{t('skip')}</a>
          <Link to="/info/accessibility" className="govbar-link">{t('screenReader')}</Link>
          <div className="govbar-group" role="group" aria-label="Text size">
            <button type="button" onClick={fontDown} disabled={atMin} aria-label={t('fontSmaller')}>A-</button>
            <button type="button" onClick={fontReset} aria-label={t('fontNormal')}>A</button>
            <button type="button" onClick={fontUp} disabled={atMax} aria-label={t('fontLarger')}>A+</button>
          </div>
          <button type="button" className="govbar-btn" onClick={toggleContrast} aria-pressed={contrast} aria-label={t('contrast')}><Contrast size={18} aria-hidden /></button>
          <button type="button" className="govbar-lang" onClick={toggleLang} lang={lang === 'en' ? 'hi' : 'en'} aria-label={t('switchLabel')}>
            <Languages size={18} aria-hidden />{t('switchTo')}
          </button>
        </div>
      </div>
    </div>
  )
}
