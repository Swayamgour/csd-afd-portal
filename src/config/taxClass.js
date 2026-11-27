// Tax Class table (source: "Tax Class new Table.xlsx"). Keep in sync with backend src/config/taxClass.js.
// The backend is the authority; this copy is only used for the live price preview in the product form.
export const TAX_CLASS_TABLE = {
  1: { item: 'Two Wheeler (EV) / Wheel Chair', csdGstPct: 2.5, incidentalPct: 1 },
  11: { item: 'White Goods', csdGstPct: 6, incidentalPct: 1 },
  12: { item: 'White Goods', csdGstPct: 9, incidentalPct: 1 },
  13: { item: 'Four Wheeler', csdGstPct: 9, incidentalPct: 0.5 },
  14: { item: 'Two Wheeler / With Goods', csdGstPct: 9, incidentalPct: 1 },
  15: { item: 'Four Wheeler', csdGstPct: 20, incidentalPct: 0.5 },
  17: { item: 'Two Wheeler', csdGstPct: 20, incidentalPct: 1 },
  20: { item: 'Four Wheeler (Electric)', csdGstPct: 2.5, incidentalPct: 0.5 },
};

const TCS_PCT = 1;
const TCS_THRESHOLD = 1000000;
const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

export const taxClassNo = (raw) => {
  const m = String(raw ?? '').match(/(\d+)/);
  return m ? Number(m[1]) : null;
};

/** Sale price first, base price only when there is no sale price; then GST(CSD) + incidental (+ TCS above 10 Lakh). */
export function computePrice({ salePrice, basePrice, taxClass }) {
  const sale = Number(salePrice) || 0;
  const base = Number(basePrice) || 0;
  const taxable = sale > 0 ? sale : base;
  const rates = TAX_CLASS_TABLE[taxClassNo(taxClass)];
  const gstPct = rates ? rates.csdGstPct : 0;
  const incPct = rates ? rates.incidentalPct : 0;
  const gst = round2((taxable * gstPct) / 100);
  const incidental = round2((taxable * incPct) / 100);
  const beforeTcs = taxable + gst + incidental;
  const tcs = beforeTcs > TCS_THRESHOLD ? round2((beforeTcs * TCS_PCT) / 100) : 0;
  return { taxable, gstPct, incPct, gst, incidental, tcs, total: round2(beforeTcs + tcs), usedSale: sale > 0 };
}
