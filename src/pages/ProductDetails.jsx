import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  RefreshCw, ShoppingCart, Copy, Heart, Check, ChevronRight, ShieldCheck, BadgePercent, Truck, Fuel, Gauge, Zap,
  Cog, Package, Armchair, Disc3, Palette, CircleDollarSign, Share2, CalendarCheck, Cpu, BadgeCheck, ArrowRight,
  Eye, AlertCircle, Building2, Store, Lock
} from "lucide-react";
import { Stars } from "../components/ProductCard.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { Loader, EmptyState, ErrorState } from "../components/States.jsx";
import { fetchProduct, fetchProducts } from "../data/api.js";
import { useStore } from "../context/Store.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { COLOR_HEX } from "../data/art.js";
import { FEATURES, STEPS } from "../data/details.js";
import { CAT_LABEL, CAT_PLURAL, inr, priceText, priceFrom, rupees, onImgError } from "../data/utils.js";
import { MOCK_PRICE_ZONES, MOCK_DEPOTS_LIST, MOCK_URCS_LIST, MOCK_DEALERS_LIST } from "../data/mock/locations.mock.js";
import { eligibilityService } from "../services/eligibility.service.js";
import { DealerDetailsModal } from "../components/modals/DealerDetailsModal.jsx";
import { URCDetailsModal } from "../components/modals/URCDetailsModal.jsx";
import { EligibilityModal } from "../components/modals/EligibilityModal.jsx";

const val = (v) => (Array.isArray(v) ? v.join(" / ") : v && v !== "-" ? v : null);

/** keep only images that actually load */
function useGallery(p) {
  console.log(p)
  const [imgs, setImgs] = useState([]);
  useEffect(() => {
    if (!p) return;
    let live = true;
    const cands = [...new Set([p.images, ...(p.images || [])].filter(Boolean))];
    setImgs([cands[0]]);
    cands.slice(1).forEach((src) => {
      const i = new Image();
      i.onload = () => live && setImgs((x) => (x.includes(src) ? x : [...x, src]));
      i.src = src;
    });
    return () => { live = false; };
  }, [p]);
  return imgs;
}

function Choice({ label, options = [], value, set, swatch }) {
  if (!options.length) return null;
  return (
    <div className="choice" role="group" aria-label={label}>
      <p>{label}: <strong>{value}</strong></p>
      <div className="row">
        {options.map((o) => swatch ? (
          <button key={o} type="button" className="swatch" aria-pressed={o === value} aria-label={o} title={o}
            style={{ background: COLOR_HEX[o] || "#999" }} onClick={() => set(o)}>{o === value && <Check size={14} aria-hidden />}</button>
        ) : (
          <button key={o} type="button" className="chip" aria-pressed={o === value} onClick={() => set(o)}>{o}</button>
        ))}
      </div>
    </div>
  );
}

function Emi({ p }) {
  const price = rupees(p);
  const [down, setDown] = useState(20), [yrs, setYrs] = useState(5), [rate, setRate] = useState(8.5);
  const loan = price * (1 - down / 100), r = rate / 12 / 100, n = yrs * 12;
  const emi = r ? (loan * r * (1 + r) ** n) / ((1 + r) ** n - 1) : loan / n;
  return (
    <section className="emi" aria-labelledby="emi-h">
      <h3 id="emi-h"><CircleDollarSign size={18} aria-hidden /> EMI estimator</h3>
      <p className="emi-big">{inr(Math.round(emi))}<small>/month</small></p>
      <label>Down payment <b>{down}%</b><input type="range" min="0" max="50" step="5" value={down} onChange={(e) => setDown(+e.target.value)} style={{ "--pct": `${(down / 50) * 100}%` }} /></label>
      <label>Tenure <b>{yrs} yrs</b><input type="range" min="1" max="7" value={yrs} onChange={(e) => setYrs(+e.target.value)} style={{ "--pct": `${((yrs - 1) / 6) * 100}%` }} /></label>
      <label>Interest <b>{rate}%</b><input type="range" min="6" max="14" step="0.5" value={rate} onChange={(e) => setRate(+e.target.value)} style={{ "--pct": `${((rate - 6) / 8) * 100}%` }} /></label>
      <p className="muted small">Estimate on the starting price of {priceFrom(p)}. Actual EMI depends on your bank.</p>
    </section>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addCart, toggleCmp, toggleWish, cmp, wish } = useStore();
  const { user } = useAuth();

  const [p, setP] = useState(undefined);
  const [err, setErr] = useState(false);
  const [all, setAll] = useState([]);
  const [color, setColor] = useState("");
  const [fuel, setFuel] = useState("");
  const [drive, setDrive] = useState("");
  const [main, setMain] = useState(0);
  const [tab, setTab] = useState("overview");
  const [zoom, setZoom] = useState(null);
  const [copied, setCopied] = useState(false);

  // CSD AFD Selection states (Fig. 6)
  const [selectedZone, setSelectedZone] = useState('DELHI NCR (DELHI GREATER NOIDA FARIDABAD GURGAON)');
  const [selectedDealer, setSelectedDealer] = useState('AAA VEHICLEADES PVT. LTD. MUNDKA (PILLAR)');
  const [selectedDepot, setSelectedDepot] = useState('DELHI');
  const [selectedUrc, setSelectedUrc] = useState('7 WING AF');

  // Modals state
  const [dealerModalOpen, setDealerModalOpen] = useState(false);
  const [urcModalOpen, setUrcModalOpen] = useState(false);
  const [eligibilityModalOpen, setEligibilityModalOpen] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [checkoutErrors, setCheckoutErrors] = useState({});
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  const imgs = useGallery(p);

  const load = () => {
    setErr(false); setP(undefined);
    fetchProduct(id).then((x) => {
      setP(x); setMain(0); setTab("overview");
      setColor(x?.colors?.[0] || ""); setFuel(x?.fuel?.[0] || ""); setDrive(x?.trans ? x.trans.split(" / ")[0] : "");
    }).catch(() => setErr(true));
  };
  useEffect(load, [id]);
  useEffect(() => { fetchProducts().then(setAll).catch(() => { }); }, []);
  useEffect(() => { if (p) document.title = `${p.name} - CSD AFD Online Portal`; }, [p]);

  const similar = useMemo(() => p ? all.filter((x) => x.id !== p.id && x.category === p.category)
    .sort((a, b) => (b.brand === p.brand) - (a.brand === p.brand) || (b.type === p.type) - (a.type === p.type) || Math.abs(rupees(a) - rupees(p)) - Math.abs(rupees(b) - rupees(p))).slice(0, 4) : [], [all, p]);

  const currentDealer = useMemo(() => {
    return MOCK_DEALERS_LIST.find((d) => d.name === selectedDealer) || MOCK_DEALERS_LIST[0];
  }, [selectedDealer]);

  const currentUrc = useMemo(() => {
    return MOCK_URCS_LIST.find((u) => u.name === selectedUrc) || MOCK_URCS_LIST[0];
  }, [selectedUrc]);

  if (err) return <ErrorState onRetry={load} />;
  if (p === undefined) return <Loader />;
  if (!p) return <EmptyState title="Product not found" text="This product is not available." action={<Link className="btn" to="/products">Browse products</Link>} />;

  const skuNumber = p?.sku || '64224';
  const mfgCode = p?.mfgCode || '7116';

  const car = p.category === "car", bike = p.category === "bike", appl = p.category === "white-goods";
  const w = wish.includes(p.id), c = cmp.includes(p.id);
  const gallery = imgs.length ? imgs : [p.image];

  const highlights = (car
    ? [[Cog, "Engine", val(p.engine)], [Zap, "Power", val(p.power)], [Gauge, "Mileage", val(p.mileage)], [Fuel, "Fuel", val(p.fuel)], [Package, "Boot space", val(p.boot)], [ShieldCheck, "Airbags", val(p.airbags)], [Cpu, "Transmission", val(p.trans)], [Armchair, "Body type", val(p.type)]]
    : bike
      ? [[Cog, "Engine", val(p.engine)], [Zap, "Power", val(p.power)], [Gauge, "Mileage", val(p.mileage)], [Fuel, "Fuel", val(p.fuel)], [Disc3, "Brakes", val(p.brakes)], [Armchair, "Type", val(p.type)]]
      : [[Armchair, "Type", val(p.type)], [BadgePercent, "Discount", p.discount ? `${p.discount}% off` : null], [CircleDollarSign, "MRP", p.mrp ? inr(p.mrp) : null], [BadgeCheck, "Brand", p.brand]]
  ).filter((h) => h[2]);

  const specGroups = car
    ? [["General", [["Brand", p.brand], ["Body type", p.type], ["Transmission", p.trans], ["Fuel type", val(p.fuel)], ["Colours", val(p.colors)]]],
    ["Engine & performance", [["Engine", p.engine], ["Max power", p.power], ["Mileage (ARAI)", p.mileage]]],
    ["Dimensions & safety", [["Boot space", p.boot], ["Airbags", p.airbags]]]]
    : bike
      ? [["General", [["Brand", p.brand], ["Type", p.type], ["Fuel type", val(p.fuel)], ["Colours", val(p.colors)]]],
      ["Engine & performance", [["Engine", p.engine], ["Max power", p.power], ["Mileage", p.mileage]]],
      ["Chassis", [["Brakes (front / rear)", p.brakes]]]]
      : [["General", [["Brand", p.brand], ["Type", p.type]]], ["Pricing", [["Offer price", inr(p.lo)], ["MRP", p.mrp ? inr(p.mrp) : null], ["You save", p.mrp ? `${inr(p.mrp - p.lo)} (${p.discount}%)` : null]]]];

  const about = car || bike
    ? `${p.name} is a ${p.type.toLowerCase()} from ${p.brand}${p.engine && p.engine !== "-" ? `, powered by a ${p.engine} engine` : ""}${p.mileage && p.mileage !== "-" ? ` with a claimed mileage of ${p.mileage}` : ""}. It is available on the CSD AFD portal from ${priceFrom(p)} (ex-showroom, subject to supply order terms).`
    : `${p.name} is a ${p.type.toLowerCase()} from ${p.brand}, available on the CSD AFD portal at ${inr(p.lo)}${p.mrp ? ` — ${p.discount}% below the MRP of ${inr(p.mrp)}` : ""}.`;

  const tabs = [["overview", "Overview"], ["specs", "Specifications"], ["features", "Features"], ["buy", "How to buy"]];
  const copy = () => { navigator.clipboard?.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1800); };

  const handleCheckoutClick = async () => {
    const errs = {};
    if (!color) errs.color = 'Please select Color';
    if (!selectedZone) errs.zone = 'Please select Price Zone';
    if (!selectedDealer) errs.dealer = 'Please select Dealer';
    if (!selectedDepot) errs.depot = 'Please select Depot';
    if (!selectedUrc) errs.urc = 'Please select URC';

    if (Object.keys(errs).length > 0) {
      setCheckoutErrors(errs);
      return;
    }
    setCheckoutErrors({});

    setCheckingEligibility(true);
    const res = await eligibilityService.validateEligibility(
      user || {
        username: 'JC-765432X',
        name: 'Subedar Major Rajesh Kumar',
        dateOfEnrollment: '2015-11-23',
        payLevel: 'Level 8 (Pay Band 2)',
        entitlementCategory: 'JCO (Pay level 7-9)'
      },
      p,
      {
        price: p.lo || 548917,
        zone: selectedZone,
        dealer: selectedDealer,
        depot: selectedDepot,
        urc: selectedUrc
      }
    );
    setEligibilityResult(res);
    setCheckingEligibility(false);
    setEligibilityModalOpen(true);
  };

  const handleContinueToCheckout = () => {
    setEligibilityModalOpen(false);
    const checkoutData = {
      productId: p.id,
      productName: p.name,
      sku: skuNumber,
      manufacturerCode: mfgCode,
      productImage: gallery[0] || p.image,
      category: p.category,
      brand: p.brand,
      selectedColor: color || (p.colors?.[0] || 'Standard'),
      selectedZone,
      selectedDealer,
      selectedDepot,
      selectedUrc,
      productPrice: rupees(p) || p.lo || 548917,
      quantity: 1,
      taxClass: MOCK_PRICE_ZONES.find((z) => z.name === selectedZone)?.taxClass || 'tax-class-8'
    };

    sessionStorage.setItem('csd_checkout_product', JSON.stringify(checkoutData));
    navigate('/checkout', { state: { productData: checkoutData } });
  };

  return (
    <div className="wrap pdp">
      <nav className="bc" aria-label="Breadcrumb">
        <ol>
          <li><Link to="/">Home</Link><ChevronRight size={14} aria-hidden /></li>
          <li><Link to={`/products?cat=${p.category}`}>{CAT_PLURAL[p.category]}</Link><ChevronRight size={14} aria-hidden /></li>
          <li><Link to={`/search?q=${encodeURIComponent(p.brand)}`}>{p.brand}</Link><ChevronRight size={14} aria-hidden /></li>
          <li><span aria-current="page">{p.name}</span></li>
        </ol>
      </nav>

      <div className="pdp-top">
        {/* ---------- gallery ---------- */}
        <div className="gallery">
          <div className={`stage ${zoom ? "zoom" : ""}`}
            onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }}
            onMouseLeave={() => setZoom(null)}>
            <img className="main-img" src={gallery[Math.min(main, gallery.length - 1)]} alt={`${p.name} view ${main + 1}`}
              style={zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined} onError={(e) => onImgError(e, p.name)} />
            <span className="tag">{CAT_LABEL[p.category]}</span>
            {appl && p.discount > 0 && <span className="disc">{p.discount}% OFF</span>}
            <button className={`fav-big ${w ? "on" : ""}`} aria-pressed={w} aria-label={w ? "Remove from wishlist" : "Add to wishlist"} onClick={() => toggleWish(p)}><Heart size={20} fill={w ? "currentColor" : "none"} /></button>
          </div>
          {gallery.length > 1 && (
            <ul className="thumbs" aria-label="Product images">
              {gallery.map((src, i) => (
                <li key={src}><button type="button" className={main === i ? "active" : ""} aria-label={`Show image ${i + 1}`} aria-pressed={main === i} onClick={() => setMain(i)}><img src={src} alt="" loading="lazy" /></button></li>
              ))}
            </ul>
          )}
          <ul className="trust">
            <li><ShieldCheck size={18} aria-hidden /> 100% free service</li>
            <li><BadgePercent size={18} aria-hidden /> CSD concessional price</li>
            <li><Truck size={18} aria-hidden /> Delivery on supply order</li>
          </ul>
        </div>

        {/* ---------- buy box (Step 6, Fig. 6) ---------- */}
        <section className="buybox" aria-labelledby="pn">
          <div className="pdp-eyebrow-row">
            <p className="eyebrow pdp-eyebrow-text">{p.brand} · {p.type}</p>
            <span className="badge pdp-eyebrow-sku-badge">
              SKU: {skuNumber} · Mfr Code: {mfgCode}
            </span>
          </div>

          <h1 id="pn" className="pdp-title-heading">{p.name}</h1>
          <div className="rate-row">
            <Stars v={p.rating} />
            <span className="muted small">{p.reviews?.toLocaleString("en-IN") || 0} reviews</span>
            <span className="pill ok"><Check size={13} aria-hidden /> Available on CSD</span>
          </div>

          {/* CSD Beneficiary Procurement Selection Form matching Fig. 6 */}
          <div className="pdp-spec-box">
            <div className="pdp-spec-box-header">
              <div className="pdp-spec-header-top">
                <span className="pdp-spec-header-title">
                  CSD AFD DEMAND SPECIFICATIONS
                </span>
                <span className="pdp-spec-header-sku">
                  SKU: <strong>{skuNumber}</strong> · Manufacturer Code: <strong>{mfgCode}</strong>
                </span>
              </div>
              <p className="micro muted pdp-spec-desc-text">
                Additional Description of Product: Approved defence concessional allocation model.
              </p>
            </div>

            <div className="pdp-spec-form">
              {/* Color Dropdown */}
              <div>
                <label className="form-label font-semibold pdp-form-label">
                  Color <span className="pdp-req-star">*</span>
                </label>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className={`select-input pdp-form-select ${checkoutErrors.color ? 'has-error' : ''}`}
                >
                  <option value="">-- Select Color --</option>
                  {(p.colors || ['GRANITE GREY', 'METALLIC SIZZLING RED', 'PEARL METALLIC ARCTIC WHITE', 'PREMIUM SILVER', 'PRIME AUTUMN ORANGE']).map((cName) => (
                    <option key={cName} value={cName}>
                      {cName}
                    </option>
                  ))}
                </select>
                {checkoutErrors.color && (
                  <span className="micro text-danger pdp-error-text">
                    {checkoutErrors.color}
                  </span>
                )}
              </div>

              {/* Price Zone Dropdown + Count */}
              <div>
                <div className="between pdp-form-label">
                  <label className="form-label font-semibold pdp-form-label-inline">
                    Price Zone <span className="pdp-req-star">*</span>
                  </label>
                  <span className="badge pdp-count-badge">
                    Count: 30
                  </span>
                </div>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className={`select-input pdp-form-select ${checkoutErrors.zone ? 'has-error' : ''}`}
                >
                  <option value="">-- Select Price Zone --</option>
                  {MOCK_PRICE_ZONES.map((z) => (
                    <option key={z.id} value={z.name}>
                      {z.name}
                    </option>
                  ))}
                </select>
                {checkoutErrors.zone && (
                  <span className="micro text-danger pdp-error-text">
                    {checkoutErrors.zone}
                  </span>
                )}
              </div>

              {/* Dealer Dropdown + View Dealer Button */}
              <div>
                <label className="form-label font-semibold pdp-form-label">
                  Dealer <span className="pdp-req-star">*</span>
                </label>
                <div className="pdp-input-action-row">
                  <select
                    value={selectedDealer}
                    onChange={(e) => setSelectedDealer(e.target.value)}
                    className={`select-input pdp-form-select pdp-input-flex-1 ${checkoutErrors.dealer ? 'has-error' : ''}`}
                  >
                    <option value="">-- Select Dealer --</option>
                    {MOCK_DEALERS_LIST.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setDealerModalOpen(true)}
                    className="btn-view-dealer"
                  >
                    View Dealer
                  </button>
                </div>
                {checkoutErrors.dealer && (
                  <span className="micro text-danger pdp-error-text">
                    {checkoutErrors.dealer}
                  </span>
                )}
              </div>

              {/* Depot Dropdown */}
              <div>
                <label className="form-label font-semibold pdp-form-label">
                  Depot <span className="pdp-req-star">*</span>
                </label>
                <select
                  value={selectedDepot}
                  onChange={(e) => setSelectedDepot(e.target.value)}
                  className={`select-input pdp-form-select ${checkoutErrors.depot ? 'has-error' : ''}`}
                >
                  <option value="">-- Select depot --</option>
                  {MOCK_DEPOTS_LIST.map((dep) => (
                    <option key={dep.id} value={dep.name}>
                      {dep.name}
                    </option>
                  ))}
                </select>
                {checkoutErrors.depot && (
                  <span className="micro text-danger pdp-error-text">
                    {checkoutErrors.depot}
                  </span>
                )}
              </div>

              {/* URC Dropdown + View URC Button */}
              <div>
                <label className="form-label font-semibold pdp-form-label">
                  URC <span className="pdp-req-star">*</span>
                </label>
                <div className="pdp-input-action-row">
                  <select
                    value={selectedUrc}
                    onChange={(e) => setSelectedUrc(e.target.value)}
                    className={`select-input pdp-form-select pdp-input-flex-1 ${checkoutErrors.urc ? 'has-error' : ''}`}
                  >
                    <option value="">-- Select URC --</option>
                    {MOCK_URCS_LIST.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setUrcModalOpen(true)}
                    className="btn-view-urc"
                  >
                    View URC
                  </button>
                </div>
                {checkoutErrors.urc && (
                  <span className="micro text-danger pdp-error-text">
                    {checkoutErrors.urc}
                  </span>
                )}
              </div>

              {/* Concessional Price Display matching Fig. 6 */}
              <div className="pdp-price-box">
                <div className="pdp-price-range">
                  ₹544,813 – ₹546,790
                </div>
                <div className="micro muted pdp-price-subtext">
                  Excluding taxes and levies (calculated automatically during checkout based on zone).
                </div>
              </div>

              {/* Official CHECKOUT CTA matching Fig. 6 */}
              <button
                type="button"
                onClick={handleCheckoutClick}
                disabled={checkingEligibility}
                className="btn-checkout-cta"
              >
                {checkingEligibility ? 'VERIFYING ELIGIBILITY...' : 'CHECKOUT'}
              </button>

              <div className="pdp-footer-meta">
                <span>Category: <strong>4 Wheelers</strong></span>
                <span className="row align-center gap-1">
                  <span>Share:</span>
                  <button type="button" onClick={copy} className="btn-copy-link">
                    {copied ? 'Link Copied' : 'Copy Link'}
                  </button>
                </span>
              </div>
            </div>
          </div>

          <div className="sub-row pdp-subrow-mt">
            {!appl && <Link to="/info/book-test-ride"><CalendarCheck size={16} aria-hidden /> Book a test ride</Link>}
            <button type="button" onClick={() => alert("OEM link: [Official Information To Be Provided]")}><ArrowRight size={16} aria-hidden /> View on OEM site</button>
            <button type="button" onClick={copy}>{copied ? <Check size={16} aria-hidden /> : <Share2 size={16} aria-hidden />} {copied ? "Link copied" : "Share"}</button>
          </div>

          {highlights.length > 0 && (
            <ul className="hl">
              {highlights.slice(0, 6).map(([Ic, l, v]) => (<li key={l}><span><Ic size={18} aria-hidden /></span><div><small>{l}</small><strong>{v}</strong></div></li>))}
            </ul>
          )}
        </section>
      </div>

      {/* ---------- Modals ---------- */}
      <DealerDetailsModal
        isOpen={dealerModalOpen}
        onClose={() => setDealerModalOpen(false)}
        dealer={currentDealer}
      />

      <URCDetailsModal
        isOpen={urcModalOpen}
        onClose={() => setUrcModalOpen(false)}
        urc={currentUrc}
      />

      <EligibilityModal
        isOpen={eligibilityModalOpen}
        onClose={() => setEligibilityModalOpen(false)}
        onContinue={handleContinueToCheckout}
        eligibilityResult={eligibilityResult}
        product={p}
      />

      {/* ---------- tabs ---------- */}
      <section className="pdp-tabs" aria-label="Product information">
        <div className="tabbar" role="tablist">
          {tabs.map(([k, l]) => <button key={k} role="tab" id={`t-${k}`} aria-selected={tab === k} aria-controls={`pn-${k}`} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>)}
        </div>

        {tab === "overview" && (
          <div role="tabpanel" id="pn-overview" aria-labelledby="t-overview" className="tabpanel">
            <h2>About {p.name}</h2>
            <p className="about">{about}</p>
            <h3>Key highlights</h3>
            <ul className="hl wide">{highlights.map(([Ic, l, v]) => (<li key={l}><span><Ic size={18} aria-hidden /></span><div><small>{l}</small><strong>{v}</strong></div></li>))}</ul>
            {p.colors?.length > 0 && (<><h3><Palette size={16} aria-hidden /> Available colours</h3><ul className="colors">{p.colors.map((c2) => <li key={c2}><i style={{ background: COLOR_HEX[c2] || "#999" }} />{c2}</li>)}</ul></>)}
          </div>
        )}

        {tab === "specs" && (
          <div role="tabpanel" id="pn-specs" aria-labelledby="t-specs" className="tabpanel">
            {specGroups.map(([g, rows]) => (
              <div key={g} className="spec-g">
                <h3>{g}</h3>
                <dl className="specs">{rows.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{val(v) || "—"}</dd></div>))}</dl>
              </div>
            ))}
            <p className="muted small">Specifications are indicative and may vary by variant. Confirm with the supply order.</p>
          </div>
        )}

        {tab === "features" && (
          <div role="tabpanel" id="pn-features" aria-labelledby="t-features" className="tabpanel">
            <div className="feat-grid">
              {FEATURES[p.category].map(([g, items]) => (
                <div key={g} className="feat"><h3>{g}</h3><ul>{items.map((f) => <li key={f}><Check size={15} aria-hidden />{f}</li>)}</ul></div>
              ))}
            </div>
            <p className="muted small">Features vary by variant. Indicative list — refer to the manufacturer for exact specifications.</p>
          </div>
        )}

        {tab === "buy" && (
          <div role="tabpanel" id="pn-buy" aria-labelledby="t-buy" className="tabpanel">
            <ol className="steps">
              {STEPS.map(([t, d, to], i) => (<li key={t}><span className="n">{i + 1}</span><div><h3>{t}</h3><p>{d}</p><Link to={to}>Learn more <ArrowRight size={14} aria-hidden /></Link></div></li>))}
            </ol>
            <p className="alertline"><ShieldCheck size={18} aria-hidden /> Services on this portal are free. Never pay anyone for registration or supply order release.</p>
          </div>
        )}
      </section>

      {similar.length > 0 && (
        <section aria-labelledby="sim">
          <div className="sec-h"><h2 id="sim">Similar {CAT_PLURAL[p.category].toLowerCase()}</h2><Link className="more" to={`/products?cat=${p.category}`}>View all <ArrowRight size={15} aria-hidden /></Link></div>
          <div className="pgrid">{similar.map((x) => <ProductCard key={x.id} p={x} />)}</div>
        </section>
      )}

      <div className="mbar">
        <div><small>{appl ? "Price" : "Starting at"}</small><strong>{priceFrom(p)}</strong></div>
        <button className="btn" onClick={() => addCart(p)}><ShoppingCart size={16} aria-hidden /> Add to cart</button>
      </div>
    </div>
  );
}
