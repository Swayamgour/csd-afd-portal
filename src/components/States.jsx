import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, SearchX, AlertTriangle, CloudOff } from 'lucide-react'

/** Spinner. If loading takes longer than `slowAfter` ms, a "taking longer" hint (and Retry) appears. */
export const Loader = ({ label = 'Loading', slowAfter = 8000, onRetry }) => {
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), slowAfter)
    return () => clearTimeout(t)
  }, [slowAfter])
  return (
    <div className="state" role="status" aria-live="polite">
      <Loader2 className="spin" aria-hidden />
      <p>{label}…</p>
      {slow && (
        <>
          <p className="muted">This is taking longer than usual. Please wait a moment.</p>
          {onRetry && <button className="btn out" onClick={onRetry}>Retry</button>}
        </>
      )}
    </div>
  )
}

export const EmptyState = ({ title, text, action }) => (<div className="state"><SearchX aria-hidden size={36} /><h2>{title}</h2><p>{text}</p>{action}</div>)

export const ErrorState = ({ onRetry }) => (<div className="state" role="alert"><AlertTriangle aria-hidden size={36} /><h2>Unable to load information</h2><p>We could not retrieve the requested information. Please try again.</p><button className="btn" onClick={onRetry}>Try again</button></div>)

/** Shown when the server did not return the data (error, or nothing published yet). */
export const UnavailableState = ({ title = 'Not available', text = 'This information is not available right now. Please try again later.', onRetry }) => (
  <div className="state" role="alert">
    <CloudOff aria-hidden size={36} />
    <h2>{title}</h2>
    <p>{text}</p>
    {onRetry && <button className="btn" onClick={onRetry}>Try again</button>}
  </div>
)

/** Small inline version for sections (banners, notices ...). */
export const InlineNote = ({ children }) => <p className="muted" role="status">{children}</p>

export const HomeLink = () => <Link className="btn" to="/">Go to home</Link>
