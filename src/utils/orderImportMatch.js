// Matches bulk-selected files to depot demands and guesses the document type from the file name.
// Demand numbers look like DEM2026000001. A file named e.g. "DEM2026000001_supply_order.pdf",
// "2026000001-OR.pdf" or "DEM2026000001 authority letter.jpg" is matched automatically;
// anything else can be fixed by hand in the preview table.

export const DOC_TYPES = [
  { key: 'officialReceipt', label: 'Official Receipt', field: 'officialReceiptUrl' },
  { key: 'supplyOrder', label: 'Supply Order', field: 'supplyOrderUrl' },
  { key: 'authorityLetter', label: 'Authority Letter', field: 'authorityLetterUrl' },
];

const norm = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const stripExt = (name) => String(name || '').replace(/\.[^.]+$/, '');

export function guessDocType(fileName) {
  const n = stripExt(fileName).toLowerCase();
  if (/authority|auth[\s_-]*l(et)?t?|letter/.test(n)) return 'authorityLetter';
  if (/receipt|official|(^|[^a-z])or([^a-z]|$)/.test(n)) return 'officialReceipt';
  if (/supply|(^|[^a-z])so([^a-z]|$)|order/.test(n)) return 'supplyOrder';
  return '';
}

export function guessDemand(fileName, demands) {
  const base = norm(stripExt(fileName));
  if (!base) return null;
  for (const d of demands) {
    const no = norm(d.demandNo);
    if (!no) continue;
    // full number, or the 10 digit "year + serial" part (DEM2026000001 -> 2026000001)
    const tail = no.replace(/^[A-Z]+/, '');
    if (base.includes(no) || (tail.length >= 10 && base.includes(tail))) return d._id || d.id;
  }
  return null;
}

let seq = 0;
export const newFileItem = (file, demands) => ({
  id: `f${Date.now()}_${seq++}`,
  file,
  demandId: guessDemand(file.name, demands) || '',
  docType: guessDocType(file.name),
  url: '', // set after the file has been uploaded (kept so a retry does not upload twice)
});
