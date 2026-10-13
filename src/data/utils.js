import { placeholder } from './art.js'

export const CAT_LABEL = { car: 'Car', bike: 'Bike', 'white-goods': 'Appliance' }
export const CAT_PLURAL = { all: 'All products', car: 'Cars', bike: 'Bikes', 'white-goods': 'Home appliances' }

export const inr = n => '₹' + Number(n).toLocaleString('en-IN')
const lk = v => String(+Number(v).toFixed(2))

/** Human readable price: "₹6.66 – 9.83 Lakh" for vehicles, "₹21,990" for appliances. */
export function priceText(p) {
  if (p.category === 'white-goods') return inr(p.lo)
  return p.lo === p.hi ? `₹${lk(p.lo)} Lakh` : `₹${lk(p.lo)} – ${lk(p.hi)} Lakh`
}
export const priceFrom = p => (p.category === 'white-goods' ? inr(p.lo) : `₹${lk(p.lo)} Lakh`)
/** Price in plain rupees, so cars, bikes and appliances can be sorted together. */
export const rupees = p => (p.category === 'white-goods' ? p.lo : Math.round(p.lo * 100000))

/** Words a product can be found by (used by search + suggestions). */
export const haystack = p =>
  `${p.name} ${p.brand} ${p.type} ${(p.fuel || []).join(' ')} ${CAT_LABEL[p.category]} ${p.category === 'white-goods' ? 'home appliance white goods' : ''}`.toLowerCase()

export const matches = (p, q) => {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return true
  const h = haystack(p)
  return words.every(w => h.includes(w))
}

export const onImgError = (e, label) => {
  const el = e.currentTarget
  if (el.dataset.fallback) return
  el.dataset.fallback = '1'
  el.src = placeholder(label)
}
