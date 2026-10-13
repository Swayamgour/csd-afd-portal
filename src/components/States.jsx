import { Link } from 'react-router-dom'
import { Loader2, SearchX, AlertTriangle } from 'lucide-react'
export const Loader = ({ label = 'Loading' }) => (<div className="state" role="status"><Loader2 className="spin" aria-hidden /><p>{label}…</p></div>)
export const EmptyState = ({ title, text, action }) => (<div className="state"><SearchX aria-hidden size={36} /><h2>{title}</h2><p>{text}</p>{action}</div>)
export const ErrorState = ({ onRetry }) => (<div className="state" role="alert"><AlertTriangle aria-hidden size={36} /><h2>Unable to load information</h2><p>We could not retrieve the requested information. Please try again.</p><button className="btn" onClick={onRetry}>Try again</button></div>)
export const HomeLink = () => <Link className="btn" to="/">Go to home</Link>
