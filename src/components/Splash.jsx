import { useEffect, useState } from 'react'
// Loading splash shown once per visit. Bilingual (it appears before the language is chosen). Respects reduced motion.
export default function Splash() {
  const [phase, setPhase] = useState(() => { try { return sessionStorage.getItem('csd-splash') ? 'gone' : 'show' } catch { return 'show' } })
  useEffect(() => {
    if (phase === 'gone') return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const a = setTimeout(() => setPhase('hide'), reduce ? 600 : 2200)
    const b = setTimeout(() => { setPhase('gone'); try { sessionStorage.setItem('csd-splash', '1') } catch { /* ignore */ } }, reduce ? 800 : 2800)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [phase === 'gone'])
  if (phase === 'gone') return null
  const skip = () => setPhase('hide')
  return (
    <div className={`splash ${phase === 'hide' ? 'out' : ''}`} role="status" aria-live="polite" aria-label="Loading / लोड हो रहा है">
      <div className="splash-in">
        <div className="splash-logo" aria-hidden><span>CSD</span></div>
        <h1 className="splash-t"><span lang="hi">कैंटीन स्टोर्स विभाग</span><span lang="en">Canteen Stores Department</span></h1>
        <p className="splash-s"><span lang="hi">रक्षा मंत्रालय, भारत सरकार</span> · <span lang="en">Ministry of Defence, Government of India</span></p>
        <div className="splash-bar" aria-hidden><i /></div>
        <p className="splash-l"><span lang="en">Loading CSD AFD Online…</span> <span lang="hi">लोड हो रहा है…</span></p>
        <button type="button" className="splash-skip" onClick={skip}>Skip / छोड़ें</button>
      </div>
      <div className="tricolor" aria-hidden />
    </div>
  )
}
