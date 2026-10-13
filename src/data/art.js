// Generated illustrations (no external images needed). Used for the demo product and as image fallback.
const enc = svg => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
export const COLOR_HEX = { Red: '#c62828', Black: '#2b2f38', Silver: '#aeb6c4', Blue: '#2457d6', White: '#eef1f6', Grey: '#6b7280' }
const shade = (hex, k) => {
  const n = parseInt(hex.slice(1), 16)
  const f = c => Math.max(0, Math.min(255, Math.round(c * k)))
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join('')}`
}
const bg = `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9effb"/><stop offset="1" stop-color="#cfd9ee"/></linearGradient></defs><rect width="800" height="520" fill="url(#g)"/><ellipse cx="400" cy="430" rx="300" ry="22" fill="#0b2a5b" opacity=".12"/>`
const wheel = (x, y) => `<circle cx="${x}" cy="${y}" r="52" fill="#15181f"/><circle cx="${x}" cy="${y}" r="30" fill="#cfd5df"/><circle cx="${x}" cy="${y}" r="9" fill="#15181f"/>`
const views = {
  side: c => `<path d="M95 360 Q100 300 190 285 L270 210 Q300 185 350 185 L500 185 Q560 188 595 240 L650 275 Q715 290 718 345 L718 372 L95 372 Z" fill="${c}"/>
<path d="M285 215 L330 200 L400 200 L400 275 L240 275 Z" fill="#9fc3e8"/><path d="M415 200 L500 200 Q540 205 565 240 L585 275 L415 275 Z" fill="#9fc3e8"/>
<rect x="398" y="200" width="6" height="76" fill="${shade(c, .7)}"/><rect x="430" y="300" width="40" height="7" rx="3" fill="${shade(c, .6)}"/>
<path d="M690 320 L715 322 L715 338 L690 336Z" fill="#ffd966"/><path d="M98 322 L120 322 L120 340 L98 340Z" fill="#e74c3c"/>${wheel(210, 372)}${wheel(600, 372)}`,
  front: c => `<path d="M230 370 L230 280 Q232 235 270 215 L330 150 Q360 125 400 125 Q440 125 470 150 L530 215 Q568 235 570 280 L570 370 Z" fill="${c}"/>
<path d="M290 215 L340 160 Q400 142 460 160 L510 215 Z" fill="#9fc3e8"/><rect x="262" y="262" width="82" height="34" rx="12" fill="#fff6d0"/><rect x="456" y="262" width="82" height="34" rx="12" fill="#fff6d0"/>
<rect x="340" y="312" width="120" height="40" rx="8" fill="#1b2230"/><g stroke="#6b7a90" stroke-width="3">${[352, 364, 376, 388, 400, 412, 424, 436, 448].map(x => `<line x1="${x}" y1="318" x2="${x}" y2="346"/>`).join('')}</g>
<rect x="196" y="318" width="38" height="60" rx="10" fill="#15181f"/><rect x="566" y="318" width="38" height="60" rx="10" fill="#15181f"/>`,
  rear: c => `<path d="M230 370 L230 270 Q232 225 262 205 L318 150 Q360 128 400 128 Q440 128 482 150 L538 205 Q568 225 570 270 L570 370 Z" fill="${c}"/>
<path d="M300 200 L338 160 Q400 146 462 160 L500 200 Z" fill="#7fa6cf"/><rect x="244" y="250" width="70" height="30" rx="10" fill="#e53935"/><rect x="486" y="250" width="70" height="30" rx="10" fill="#e53935"/>
<rect x="352" y="300" width="96" height="34" rx="6" fill="#fff"/><rect x="360" y="308" width="80" height="18" rx="3" fill="#dfe6f2"/>
<rect x="196" y="318" width="38" height="60" rx="10" fill="#15181f"/><rect x="566" y="318" width="38" height="60" rx="10" fill="#15181f"/>`,
  interior: () => `<rect x="60" y="60" width="680" height="400" rx="28" fill="#222733"/><path d="M60 330 Q400 250 740 330 L740 460 L60 460Z" fill="#2e3544"/>
<rect x="110" y="110" width="580" height="90" rx="30" fill="#161a23"/><rect x="520" y="125" width="150" height="60" rx="8" fill="#6db3ff" opacity=".85"/><rect x="535" y="140" width="120" height="8" rx="4" fill="#fff" opacity=".8"/><rect x="535" y="158" width="80" height="8" rx="4" fill="#fff" opacity=".6"/>
<circle cx="250" cy="300" r="100" fill="none" stroke="#10131a" stroke-width="22"/><circle cx="250" cy="300" r="28" fill="#10131a"/><line x1="150" y1="300" x2="350" y2="300" stroke="#10131a" stroke-width="18"/>
<circle cx="205" cy="160" r="38" fill="#0d1017"/><circle cx="205" cy="160" r="30" fill="none" stroke="#7dd3fc" stroke-width="4"/><circle cx="320" cy="160" r="26" fill="#0d1017"/>`,
}
export const carArt = (view = 'side', color = 'Blue') =>
  enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" role="img">${bg}${views[view](COLOR_HEX[color] || '#2457d6')}</svg>`)
export const placeholder = label =>
  enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#e6ecf8"/><g fill="none" stroke="#7b8bb0" stroke-width="6" stroke-linejoin="round"><rect x="140" y="95" width="120" height="90" rx="10"/><circle cx="175" cy="125" r="12"/><path d="M148 178 L190 140 L215 162 L235 146 L252 178"/></g><text x="200" y="228" font-family="Arial" font-size="18" text-anchor="middle" fill="#4a5878">${(label || '').replace(/[<&>]/g, '').slice(0, 34)}</text></svg>`)
