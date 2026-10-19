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
import { useStore } from "../context/Store.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { COLOR_HEX } from "../data/art.js";
import { FEATURES, STEPS } from "../data/details.js";
import { CAT_LABEL, CAT_PLURAL, inr, priceText, priceFrom, rupees, onImgError } from "../data/utils.js";
import { MOCK_PRICE_ZONES } from "../data/mock/locations.mock.js";
import { useGetProductByIdQuery, useGetProductsQuery, useCheckProductEligibilityMutation } from "../features/catalog/productApi.js";
import { useGetDealersQuery, useGetDepotsQuery, useGetUrcsQuery } from "../features/org/orgApi.js";
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
  const { user, isAuthenticated } = useAuth();

  const isPendingApproval = isAuthenticated && user?.role === 'BENEFICIARY' && (
    user.status === 'Pending' ||
    user.status === 'PENDING' ||
    user.verificationStatus === 'PENDING' ||
    user.adminApproval === 'PENDING'
  );

  const {
    data: rawProduct,
    isLoading: loadingProduct,
    isError: err,
    refetch: load,
  } = useGetProductByIdQuery(id);

  const { data: allProductsData } = useGetProductsQuery({ limit: 20 });
  const all = allProductsData?.items || [];

  const { data: dealersList = [] } = useGetDealersQuery();
  const { data: depotsList = [] } = useGetDepotsQuery();
  const { data: urcsList = [] } = useGetUrcsQuery();

  const [checkEligibilityMutation, { isLoading: checkingEligibility }] =
    useCheckProductEligibilityMutation();

  const p = useMemo(() => {
    if (!rawProduct) return null;
    const prod = rawProduct.data || rawProduct;
    const catCode = prod.categoryId?.code?.toLowerCase() || (prod.afdType === 'AFD_II' ? 'white-goods' : 'car');
    const colorsList = prod.attributes?.colors
      ? prod.attributes.colors.split(',').map((c) => c.trim())
      : prod.colors || ['Solid White', 'Silky Silver', 'Granite Grey'];

    return {
      ...prod,
      id: prod._id || prod.id,
      category: catCode.includes('bike') ? 'bike' : catCode.includes('white') ? 'white-goods' : 'car',
      brand: prod.brandId?.name || prod.brand || 'Authorized OEM',
      price: prod.priceToCustomer || prod.price || 500000,
      lo: prod.priceToCustomer || prod.price || 500000,
      hi: prod.mrp || (prod.price ? prod.price * 1.15 : 600000),
      mrp: prod.mrp || (prod.price ? Math.round(prod.price * 1.15) : 600000),
      indexNo: prod.indexNo || prod.sku || 'N/A',
      basicPrice: prod.basicPrice,
      csdDiscountPercent: prod.csdDiscountPercent || 0,
      csdDiscountAmount: prod.csdDiscountAmount || 0,
      marketScheme: prod.marketScheme || 0,
      csdBasicWithDiscount: prod.csdBasicWithDiscount,
      cgstAmount: prod.cgstAmount || 0,
      sgstAmount: prod.sgstAmount || 0,
      csdInvoiceAmount: prod.csdInvoiceAmount,
      csdProfitAmount: prod.csdProfitAmount || 0,
      csdFinalPriceWithConcession: prod.csdFinalPriceWithConcession,
      tcsAmount: prod.tcsAmount || 0,
      priceToCustomer: prod.priceToCustomer || prod.price || 500000,
      dealerRefName: prod.dealerRefName || 'SUPREME MOBILES PVT. LTD.- HISAR',
      priceListRef: prod.priceListRef || "CSD PRICE LIST= OCTOBER'26 (w.e.f- 03.10.2026)",
      image: prod.images?.[0] || prod.image || '/assets/maruti1.png',
      images: prod.images?.length ? prod.images : ['/assets/maruti1.png'],
      colors: colorsList,
      engine: prod.engineCapacity ? `${prod.engineCapacity} cc` : (prod.attributes?.engine || prod.engine || '1197 cc'),
      fuel: prod.fuelType ? [prod.fuelType] : (prod.attributes?.fuel ? [prod.attributes.fuel] : prod.fuel || ['Petrol']),
      trans: prod.attributes?.transmission || prod.trans || 'Manual',
      power: prod.attributes?.power || prod.power || '88.5 bhp',
      mileage: prod.attributes?.mileage || prod.mileage || '22.3 km/l',
      boot: prod.attributes?.boot || prod.boot || '268 L',
      airbags: prod.attributes?.airbags || prod.airbags || '2 Airbags',
      type: prod.variant || prod.attributes?.type || prod.type || 'Hatchback',
      brakes: prod.attributes?.brakes || prod.brakes || 'Disc / Drum',
      rating: 4.5,
      reviews: 124,
      sku: prod.indexNo || prod.sku || '64224',
    };
  }, [rawProduct]);

  const [color, setColor] = useState("");
  const [fuel, setFuel] = useState("");
  const [drive, setDrive] = useState("");
  const [main, setMain] = useState(0);
  const [tab, setTab] = useState("overview");
  const [zoom, setZoom] = useState(null);
  const [copied, setCopied] = useState(false);

  // CSD AFD Selection states
  const [selectedZone, setSelectedZone] = useState('DELHI NCR (DELHI GREATER NOIDA FARIDABAD GURGAON)');
  const [selectedDealer, setSelectedDealer] = useState('');
  const [selectedDepot, setSelectedDepot] = useState('');
  const [selectedUrc, setSelectedUrc] = useState('');

  // Modals state
  const [dealerModalOpen, setDealerModalOpen] = useState(false);
  const [urcModalOpen, setUrcModalOpen] = useState(false);
  const [eligibilityModalOpen, setEligibilityModalOpen] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [checkoutErrors, setCheckoutErrors] = useState({});

  useEffect(() => {
    if (p) {
      setColor(p.colors?.[0] || 'Standard');
      setFuel(p.fuel?.[0] || 'Petrol');
      setDrive(p.trans ? p.trans.split(' / ')[0] : 'Manual');
      document.title = `${p.name} - CSD AFD Online Portal`;
    }
  }, [p]);

  useEffect(() => {
    if (dealersList.length && !selectedDealer) setSelectedDealer(dealersList[0].name);
  }, [dealersList, selectedDealer]);

  useEffect(() => {
    if (depotsList.length && !selectedDepot) setSelectedDepot(depotsList[0].name);
  }, [depotsList, selectedDepot]);

  useEffect(() => {
    if (urcsList.length && !selectedUrc) setSelectedUrc(urcsList[0].name);
  }, [urcsList, selectedUrc]);

  const imgs = useGallery(p);

  const similar = useMemo(
    () =>
      p && all.length
        ? all
            .filter((x) => (x._id || x.id) !== p.id)
            .slice(0, 4)
        : [],
    [all, p]
  );

  const currentDealer = useMemo(() => {
    return (
      dealersList.find((d) => d.name === selectedDealer) ||
      dealersList[0] || {
        name: selectedDealer || 'Authorized Dealer',
        address: 'Delhi Cantt, New Delhi',
        phone: '+91 11 2345 6789',
      }
    );
  }, [selectedDealer, dealersList]);

  const currentUrc = useMemo(() => {
    return (
      urcsList.find((u) => u.name === selectedUrc) ||
      urcsList[0] || {
        name: selectedUrc || 'Delhi Cantt URC',
        location: 'Delhi',
      }
    );
  }, [selectedUrc, urcsList]);

  if (err) return <ErrorState onRetry={load} />;
  if (loadingProduct) return <Loader />;
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
      : [["General", [["Brand", p.brand], ["Type", p.type]]], ["Pricing", [["Offer price", inr(p.lo)], ["MRP", p.mrp ? inr(p.mrp) : null], ["You save", p.mrp ? `${inr(p.mrp - p.lo)}` : null]]]];

  const about = `${p.name} from ${p.brand}. Available on the CSD AFD portal at concessional price ₹ ${(p.price || 0).toLocaleString('en-IN')} (ex-showroom, subject to supply order terms).`;

  const tabs = [["overview", "Overview"], ["specs", "Specifications"], ["features", "Features"], ["buy", "How to buy"]];
  const copy = () => { navigator.clipboard?.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1800); };

  const handleCheckoutClick = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/products/${id}`)}&reason=auth-required`);
      return;
    }

    if (isPendingApproval) {
      alert("Your account is pending admin approval. You can view products, but demand generation will be available after your account is approved by the administrator.");
      return;
    }

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

    try {
      const res = await checkEligibilityMutation({
        productId: p._id || p.id,
        quantity: 1,
      }).unwrap();

      setEligibilityResult(res);
      setEligibilityModalOpen(true);
    } catch (apiErr) {
      setEligibilityResult({
        eligible: false,
        reason: apiErr?.data?.message || 'Eligibility check failed on server. Please ensure your beneficiary profile is verified.',
      });
      setEligibilityModalOpen(true);
    }
  };

  const handleContinueToCheckout = () => {
    setEligibilityModalOpen(false);

    const chosenDealer = dealersList.find((d) => d.name === selectedDealer) || dealersList[0];
    const chosenDepot = depotsList.find((d) => d.name === selectedDepot) || depotsList[0];
    const chosenUrc = urcsList.find((u) => u.name === selectedUrc) || urcsList[0];

    const checkoutData = {
      productId: p._id || p.id,
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
      dealerId: chosenDealer?._id,
      depotId: chosenDepot?._id,
      urcId: chosenUrc?._id,
      productPrice: p.price || 0,
      taxPercent: p.taxPercent || 14,
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
                    {dealersList.map((d) => (
                      <option key={d._id || d.id || d.code} value={d.name}>
                        {d.name} ({d.city || ''})
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
                  {depotsList.map((dep) => (
                    <option key={dep._id || dep.id || dep.code} value={dep.name}>
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
                    {urcsList.map((u) => (
                      <option key={u._id || u.id || u.code} value={u.name}>
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

              {/* Concessional Price Display matching Official CSD Price List */}
              <div className="pdp-price-box" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                <div className="between align-center mb-1">
                  <span className="small font-bold" style={{ color: '#0f172a' }}>Price to Customer (Net CSD Payable):</span>
                  <div className="h3 font-bold text-brand" style={{ margin: 0 }}>
                    ₹ {(p.priceToCustomer || p.price || 0).toLocaleString('en-IN')}
                  </div>
                </div>

                {p.basicPrice ? (
                  <div className="csd-official-rate-sheet mt-2" style={{ fontSize: '0.82rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.75rem' }}>
                    <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', marginBottom: '0.4rem', fontWeight: 600, color: '#1e3a8a' }}>
                      📋 Official CSD Rate Breakdown (INDEX NO: {p.indexNo})
                    </div>
                    <div className="between py-1" style={{ borderBottom: '1px dotted #e2e8f0' }}>
                      <span className="muted">Basic Price (incl. Dealer Margin):</span>
                      <span>₹ {Number(p.basicPrice).toLocaleString('en-IN')}</span>
                    </div>
                    {(p.csdDiscountAmount > 0 || p.marketScheme > 0) && (
                      <div className="between py-1 text-green" style={{ borderBottom: '1px dotted #e2e8f0' }}>
                        <span>CSD Discount & Schemes:</span>
                        <span>- ₹ {(Number(p.csdDiscountAmount) + Number(p.marketScheme || 0)).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="between py-1" style={{ borderBottom: '1px dotted #e2e8f0' }}>
                      <span className="muted">CSD Basic with Discount:</span>
                      <span className="font-semibold">₹ {Number(p.csdBasicWithDiscount || p.basicPrice).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="between py-1" style={{ borderBottom: '1px dotted #e2e8f0' }}>
                      <span className="muted">GST (SGST + CGST with Concession):</span>
                      <span>+ ₹ {(Number(p.sgstAmount || 0) + Number(p.cgstAmount || 0)).toLocaleString('en-IN')}</span>
                    </div>
                    {p.csdProfitAmount > 0 && (
                      <div className="between py-1" style={{ borderBottom: '1px dotted #e2e8f0' }}>
                        <span className="muted">CSD Profit Margin (0.50%):</span>
                        <span>+ ₹ {Number(p.csdProfitAmount).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {p.tcsAmount > 0 && (
                      <div className="between py-1" style={{ borderBottom: '1px dotted #e2e8f0' }}>
                        <span className="muted">TCS @ 1% (Above 10 Lacs):</span>
                        <span>+ ₹ {Number(p.tcsAmount).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="micro muted mt-1 pt-1" style={{ fontStyle: 'italic', color: '#64748b' }}>
                      Ref Dealer: {p.dealerRefName} | Rate List: {p.priceListRef}
                    </div>
                  </div>
                ) : (
                  <div className="micro muted pdp-price-subtext">
                    Concessional CSD ex-showroom price (Taxes and regional levies calculated automatically during checkout).
                  </div>
                )}
              </div>

              {/* Login Required Notice */}
              {!isAuthenticated && (
                <div style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  lineHeight: 1.45,
                  color: '#1e40af',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Lock size={16} style={{ color: '#2563eb', flexShrink: 0 }} />
                      <span><strong>Login Required:</strong> Please log in to unlock checkout and generate demand.</span>
                    </div>
                    <Link
                      to={`/login?redirect=${encodeURIComponent(`/products/${id}`)}`}
                      style={{
                        background: '#1e3a8a',
                        color: '#ffffff',
                        padding: '0.35rem 0.85rem',
                        borderRadius: '6px',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      Login Now <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              )}

              {/* Pending Approval Notice */}
              {isAuthenticated && isPendingApproval && (
                <div style={{
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  lineHeight: 1.45,
                  color: '#78350f',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', color: '#92400e', fontWeight: 600 }}>
                    <AlertCircle size={16} /> Account Pending Admin Approval
                  </div>
                  Your account is pending admin approval. You can view products, but demand generation will be available after your account is approved by the administrator.
                </div>
              )}

              {/* Official CHECKOUT CTA matching Fig. 6 */}
              <button
                type="button"
                onClick={handleCheckoutClick}
                disabled={!isAuthenticated || checkingEligibility || isPendingApproval}
                className="btn-checkout-cta"
                style={
                  !isAuthenticated
                    ? { opacity: 0.65, cursor: 'not-allowed', background: '#94a3b8' }
                    : isPendingApproval
                      ? { opacity: 0.65, cursor: 'not-allowed', background: '#94a3b8' }
                      : undefined
                }
                title={
                  !isAuthenticated
                    ? 'Please login to proceed with checkout'
                    : isPendingApproval
                      ? 'Your account is pending admin approval. Demand generation will be available after your account is approved by the administrator.'
                      : undefined
                }
              >
                {!isAuthenticated ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Lock size={16} /> LOGIN TO CHECKOUT
                  </span>
                ) : isPendingApproval ? (
                  'DEMAND GENERATION DISABLED (APPROVAL PENDING)'
                ) : checkingEligibility ? (
                  'VERIFYING ELIGIBILITY...'
                ) : (
                  'CHECKOUT'
                )}
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
        <button
          className="btn"
          onClick={() => {
            if (!isAuthenticated) {
              navigate(`/login?redirect=${encodeURIComponent(`/products/${id}`)}&reason=auth-required`);
            } else {
              addCart(p);
            }
          }}
          disabled={!isAuthenticated}
          style={!isAuthenticated ? { opacity: 0.65, cursor: 'not-allowed', background: '#94a3b8' } : undefined}
          title={!isAuthenticated ? 'Please log in to proceed' : undefined}
        >
          {!isAuthenticated ? <Lock size={16} aria-hidden /> : <ShoppingCart size={16} aria-hidden />}
          {!isAuthenticated ? 'Login to checkout' : 'Add to cart'}
        </button>
      </div>
    </div>
  );
}
