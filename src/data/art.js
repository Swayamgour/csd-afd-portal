// Only a neutral "image not available" placeholder (used when a product image is missing or fails to load).
const enc = svg => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

export const placeholder = label =>
  enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#e6ecf8"/><g fill="none" stroke="#7b8bb0" stroke-width="6" stroke-linejoin="round"><rect x="140" y="95" width="120" height="90" rx="10"/><circle cx="175" cy="125" r="12"/><path d="M148 178 L190 140 L215 162 L235 146 L252 178"/></g><text x="200" y="228" font-family="Arial" font-size="18" text-anchor="middle" fill="#4a5878">${(label || 'Image not available').replace(/[<&>]/g, '').slice(0, 34)}</text></svg>`)
