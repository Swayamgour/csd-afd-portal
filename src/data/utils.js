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

/** Words a product can be found by (used by search + suggestions). Includes SKU, Mfr Code, Index No, Brand, Name, Variant, Type. */
export const haystack = p => {
  const sku = p.sku || p.indexNo || ''
  const mfr = p.mfrCode || p.mfr || p.firmCode || p.attributes?.mfrCode || ''
  const cleanSku = String(sku).replace(/[^a-z0-9]/gi, '')
  const cleanMfr = String(mfr).replace(/[^a-z0-9]/gi, '')
  return `${p.name || ''} ${p.brand || ''} ${p.type || ''} ${sku} ${cleanSku} ${mfr} ${cleanMfr} ${p.indexNo || ''} ${p.firmCode || ''} ${p.variant || ''} ${p.nomenclature || ''} ${(p.fuel || []).join(' ')} ${CAT_LABEL[p.category] || ''} ${p.category === 'white-goods' ? 'home appliance white goods' : ''}`.toLowerCase()
}

export const matches = (p, q) => {
  if (!q) return true
  const rawQ = String(q).trim().toLowerCase()
  if (!rawQ) return true
  const h = haystack(p)
  if (h.includes(rawQ)) return true
  const cleanQ = rawQ.replace(/[^a-z0-9]/gi, '')
  if (cleanQ && cleanQ.length >= 3 && h.includes(cleanQ)) return true
  const words = rawQ.split(/\s+/).filter(Boolean)
  return words.every(w => {
    if (h.includes(w)) return true
    const cw = w.replace(/[^a-z0-9]/gi, '')
    return cw && cw.length >= 3 && h.includes(cw)
  })
}

export const onImgError = (e, label) => {
  const el = e.currentTarget
  if (el.dataset.fallback) return
  el.dataset.fallback = '1'
  el.src = placeholder(label)
}
