import { createContext, useContext, useState } from 'react'
const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)
const tog = (a, id) => (a.includes(id) ? a.filter(x => x !== id) : [...a, id])
export function StoreProvider({ children }) {
  const [cart, setCart] = useState([]), [wish, setWish] = useState([]), [cmp, setCmp] = useState([]), [toast, setToast] = useState('')
  const say = m => { setToast(m); setTimeout(() => setToast(''), 2500) }
  const value = {
    cart, wish, cmp,
    addCart: p => { if (cart.includes(p.id)) return say('Already in cart'); setCart(c => [...c, p.id]); say(`${p.name} added to cart`) },
    removeCart: id => setCart(c => c.filter(x => x !== id)),
    toggleWish: p => { setWish(w => tog(w, p.id)); say(wish.includes(p.id) ? 'Removed from wishlist' : 'Saved to wishlist') },
    toggleCmp: p => {
      if (!cmp.includes(p.id) && cmp.length >= 4) return say('You can compare up to 4 products')
      setCmp(c => tog(c, p.id))
    },
  }
  return <Ctx.Provider value={value}>{children}<div className="toast" role="status" aria-live="polite">{toast}</div></Ctx.Provider>
}
