import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { products as fallbackProducts } from '../data/products.js'
import { fetchProducts } from '../data/api.js'
import { useStore } from '../context/Store.jsx'
import { EmptyState } from '../components/States.jsx'
import { priceText } from '../data/utils.js'

export default function Cart() {
  const { cart, removeCart } = useStore()
  const [allProducts, setAllProducts] = useState(fallbackProducts)

  useEffect(() => {
    fetchProducts().then((res) => {
      if (Array.isArray(res) && res.length) setAllProducts(res)
    }).catch(() => {})
  }, [])

  const items = cart.map(id => allProducts.find(p => p.id === id)).filter(Boolean)
  if (!items.length) return <div className="wrap"><EmptyState title="Your cart is empty" text="Add products to see them here." action={<Link className="btn" to="/products">Browse products</Link>} /></div>
  return (<div className="wrap"><h1>Cart</h1><ul className="panel list">{items.map(p => <li key={p.id} className="between"><span><strong>{p.name}</strong><br />{priceText(p)}</span><button className="btn sm ghost" onClick={() => removeCart(p.id)}>Remove {p.name}</button></li>)}</ul>
    <p className="muted">Checkout is connected to official AFD supply order workflow.</p></div>)
}
