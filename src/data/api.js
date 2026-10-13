// Single place to swap mock data for a real backend.
import { products } from './products.js'
const wait = ms => new Promise(r => setTimeout(r, ms))
export async function fetchProducts() { await wait(150); return products }
export async function fetchProduct(id) { await wait(150); return products.find(p => p.id === id) || null }
