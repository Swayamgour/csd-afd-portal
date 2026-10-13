import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useI18n } from '../i18n/index.jsx'
// items: [[label, to?], ...] - last item is the current page.
export default function Breadcrumb({ items }) {
  const { t } = useI18n()
  const all = [[t('bc.home'), '/'], ...items]
  return (
    <nav className="bc" aria-label={t('bc.label')}>
      <ol>{all.map(([l, to], i) => (
        <li key={i}>{i < all.length - 1 && to ? <Link to={to}>{l}</Link> : <span aria-current="page">{l}</span>}{i < all.length - 1 && <ChevronRight size={14} aria-hidden />}</li>
      ))}</ol>
    </nav>
  )
}
