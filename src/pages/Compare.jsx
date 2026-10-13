import { Link, useNavigate } from 'react-router-dom'
import { X, ArrowLeft, ShoppingCart } from 'lucide-react'
import { products } from '../data/products.js'
import { useStore } from '../context/Store.jsx'
import { EmptyState } from '../components/States.jsx'
import { priceText } from '../data/utils.js'
import { Stars, Img } from '../components/ProductCard.jsx'
const rows = [['Transmission', 'trans'], ['Engine', 'engine'], ['Fuel Type', 'fuel'], ['Power', 'power'], ['Mileage', 'mileage'], ['Boot Space', 'boot'], ['Airbags', 'airbags']]
export default function Compare() {
  const { cmp, toggleCmp, addCart } = useStore(), back = useNavigate(), items = cmp.map(id => products.find(p => p.id === id)).filter(Boolean)
  if (!items.length) return <div className="wrap"><EmptyState title="Nothing to compare yet" text="Select Compare on up to 4 products." action={<Link className="btn" to="/products">Browse products</Link>} /></div>
  const v = (p, k) => (Array.isArray(p[k]) ? p[k].join(' / ') : p[k] || '-')
  return (
    <div className="wrap"><div className="titlebar"><button className="circle" aria-label="Go back" onClick={() => back(-1)}><ArrowLeft /></button><h1>Comparing {items[0].name}</h1></div>
      <ul className="cmpgrid">{items.map(p => (
        <li key={p.id} className="cmpcard"><div className="card-img"><Img p={p} /><button className="close" aria-label={`Remove ${p.name} from comparison`} onClick={() => toggleCmp(p)}><X size={16} /></button></div>
          <div className="cmpbody"><h2>{p.name}</h2><p className="cprice">{priceText(p)}</p><Stars v={p.rating} n={p.reviews} /> <span className="muted small">{p.rating}</span>
            <dl>{rows.map(([l, k]) => <div key={k}><dt>{l}</dt><dd>{v(p, k)}</dd></div>)}</dl>
            <button className="btn wide" onClick={() => addCart(p)}>ADD TO CART <ShoppingCart size={16} aria-hidden /></button></div></li>))}</ul></div>
  )
}
