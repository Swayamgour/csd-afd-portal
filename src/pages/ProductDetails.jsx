import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  RefreshCw,
  ShoppingCart,
  Copy,
  Heart,
  Check,
  ChevronRight,
  ShieldCheck,
  BadgePercent,
  Truck,
  Fuel,
  Gauge,
  Zap,
  Cog,
  Package,
  Armchair,
  Disc3,
  Palette,
  CircleDollarSign,
  Share2,
  CalendarCheck,
  Cpu,
  BadgeCheck,
  ArrowRight,
  Eye,
  AlertCircle,
  Building2,
  Store,
  Lock,
} from "lucide-react";
import { Stars } from "../components/ProductCard.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { Loader, EmptyState, UnavailableState } from "../components/common/States.jsx";
import { useStore } from "../context/Store.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import PriceLock from "../components/PriceLock.jsx";
import { useStoreProducts } from "../hooks/useStoreProducts.js";
import ProductGallery from "../components/product/ProductGallery.jsx";
import ProductTabs from "../components/product/ProductTabs.jsx";
import ProductBuyBox from "../components/product/ProductBuyBox.jsx";
import {
  CAT_LABEL,
  CAT_PLURAL,
  inr,
  priceText,
  priceFrom,
  rupees,
  onImgError,
} from "../data/utils.js";
import {
  useGetProductByIdQuery,
  useCheckProductEligibilityMutation,
  useGetProductOptionsQuery,
} from "../features/catalog/productApi.js";
import {
  useGetAvailableStatesQuery,
  useGetStateDealersQuery,
  useGetStateDepotsQuery,
  useGetDepotUrcsQuery,
  useGetStateProductPriceQuery,
} from "../features/org/orgApi.js";
import { DealerDetailsModal } from "../components/modals/DealerDetailsModal.jsx";
import { URCDetailsModal } from "../components/modals/URCDetailsModal.jsx";
import { EligibilityModal } from "../components/modals/EligibilityModal.jsx";

const val = (v) =>
  Array.isArray(v) ? v.join(" / ") : v && v !== "-" ? v : null;

/** keep only images that actually load */
function useGallery(p, colorImages) {
  const [imgs, setImgs] = useState([]);
  // selected colour's own photos win; no photos for that colour => product gallery
  const key = (colorImages || []).join("|");
  useEffect(() => {
    if (!p) return;
    let live = true;
    const list = colorImages?.length ? colorImages : p.images || [];
    const cands = [...new Set(list.filter(Boolean))];
    setImgs(cands.length ? [cands[0]] : []);
    cands.slice(1).forEach((src) => {
      const i = new Image();
      i.onload = () =>
        live && setImgs((x) => (x.includes(src) ? x : [...x, src]));
      i.src = src;
    });
    return () => {
      live = false;
    };
  }, [p, key]);
  return imgs;
}

const getColorClass = (col) => {
  const c = (col || "").toLowerCase();
  if (c.includes("red")) return "swatch-color-red";
  if (c.includes("black")) return "swatch-color-black";
  if (c.includes("silver")) return "swatch-color-silver";
  if (c.includes("blue")) return "swatch-color-blue";
  if (c.includes("white")) return "swatch-color-white";
  if (c.includes("grey") || c.includes("gray")) return "swatch-color-grey";
  return "swatch-color-default";
};

function Choice({ label, options = [], value, set, swatch }) {
  if (!options.length) return null;
  return (
    <div className="choice" role="group" aria-label={label}>
      <p>
        {label}: <strong>{value}</strong>
      </p>
      <div className="row">
        {options.map((o) =>
          swatch ? (
            <button
              key={o}
              type="button"
              className={`swatch ${getColorClass(o)}`}
              aria-pressed={o === value}
              aria-label={o}
              title={o}
              onClick={() => set(o)}
            >
              {o === value && <Check size={14} aria-hidden />}
            </button>
          ) : (
            <button
              key={o}
              type="button"
              className="chip"
              aria-pressed={o === value}
              onClick={() => set(o)}
            >
              {o}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

function Emi({ p }) {
  const price = rupees(p);
  const [down, setDown] = useState(20),
    [yrs, setYrs] = useState(5),
    [rate, setRate] = useState(8.5);
  if (price == null) return null;
  const loan = price * (1 - down / 100),
    r = rate / 12 / 100,
    n = yrs * 12;
  const emi = r ? (loan * r * (1 + r) ** n) / ((1 + r) ** n - 1) : loan / n;
  return (
    <section className="emi" aria-labelledby="emi-h">
      <h3 id="emi-h">
        <CircleDollarSign size={18} aria-hidden /> EMI estimator
      </h3>
      <p className="emi-big">
        {inr(Math.round(emi))}
        <small>/month</small>
      </p>
      <label>
        Down payment <b>{down}%</b>
        <input
          type="range"
          min="0"
          max="50"
          step="5"
          value={down}
          onChange={(e) => setDown(+e.target.value)}
          className="emi-slider-input"
        />
      </label>
      <label>
        Tenure <b>{yrs} yrs</b>
        <input
          type="range"
          min="1"
          max="7"
          value={yrs}
          onChange={(e) => setYrs(+e.target.value)}
          className="emi-slider-input"
        />
      </label>
      <label>
        Interest <b>{rate}%</b>
        <input
          type="range"
          min="6"
          max="14"
          step="0.5"
          value={rate}
          onChange={(e) => setRate(+e.target.value)}
          className="emi-slider-input"
        />
      </label>
      <p className="muted small">
        Estimate on the starting price of {priceFrom(p)}. Actual EMI depends on
        your bank.
      </p>
    </section>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addCart, toggleCmp, toggleWish, cmp, wish } = useStore();
  const { user, isAuthenticated } = useAuth();

  const isPendingApproval =
    isAuthenticated &&
    user?.role === "BENEFICIARY" &&
    (user.status === "Pending" ||
      user.status === "PENDING" ||
      user.verificationStatus === "PENDING" ||
      user.adminApproval === "PENDING");

  const {
    data: rawProduct,
    isLoading: loadingProduct,
    isError: err,
    refetch: load,
  } = useGetProductByIdQuery(id);

  // Shared cached list (same request as Home / Catalog) - used only for "Similar products"
  const { products: all } = useStoreProducts();

  const [color, setColor] = useState(""); // selected colour (also drives the colour-wise price)

  // CSD AFD Selection states - State -> Dealer -> Depot -> URC cascade
  const [selectedState, setSelectedState] = useState("");
  const [selectedDealerId, setSelectedDealerId] = useState("");
  const [selectedDepotId, setSelectedDepotId] = useState("");
  const [selectedUrcId, setSelectedUrcId] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState("");

  // Authoritative State cascade APIs
  const { data: availableStates = [], isLoading: loadingStates } =
    useGetAvailableStatesQuery({ productId: id }, { skip: !id });

  const { data: availableDealers = [], isLoading: loadingDealers } =
    useGetStateDealersQuery(
      { state: selectedState, productId: id },
      { skip: !id || !selectedState },
    );

  const { data: availableDepots = [], isLoading: loadingDepots } =
    useGetStateDepotsQuery(
      { state: selectedState, dealerId: selectedDealerId, productId: id },
      { skip: !id || !selectedState || !selectedDealerId }, // depots only after a dealer is chosen
    );

  const { data: availableUrcs = [], isLoading: loadingUrcs } =
    useGetDepotUrcsQuery(
      { state: selectedState, depotId: selectedDepotId },
      { skip: !selectedState || !selectedDepotId },
    );

  const {
    data: statePriceResponse,
    isLoading: loadingStatePrice,
    isFetching: fetchingStatePrice,
    isError: statePriceError,
  } = useGetStateProductPriceQuery(
    { state: selectedState, productId: id, quantity: 1, color: color || undefined },
    { skip: !id || !selectedState || !isAuthenticated }, // no price request for visitors
  );

  const statePricing = statePriceResponse?.pricing || null;

  const [checkEligibilityMutation, { isLoading: checkingEligibility }] =
    useCheckProductEligibilityMutation();

  const p = useMemo(() => {
    if (!rawProduct) return null;
    const prod = rawProduct.data || rawProduct;
    const catCode =
      prod.categoryId?.code?.toLowerCase() ||
      (prod.afdType === "AFD_II" ? "white-goods" : "car");
    // colours: [{name, hex, price}] (new) | ["Red", ...] | attributes.colors "Red, Blue" (legacy)
    const colorObjs = Array.isArray(prod.colors) && prod.colors.length
      ? prod.colors.map((c) => (typeof c === "string" ? { name: c } : c)).filter((c) => c?.name)
      : prod.attributes?.colors
        ? String(prod.attributes.colors).split(",").map((c) => ({ name: c.trim() })).filter((c) => c.name)
        : [];
    const colorsList = colorObjs.map((c) => c.name);

    // Feature groups only if the server sends them: ["a","b"] or [{ group, items }]
    const rawFeatures = prod.features || prod.attributes?.features;
    const featureGroups = Array.isArray(rawFeatures) && rawFeatures.length
      ? typeof rawFeatures[0] === "string"
        ? [["Features", rawFeatures]]
        : rawFeatures
          .map((g) => [g.group || g.title || g.name || "Features", g.items || g.features || []])
          .filter(([, items]) => items.length)
      : [];

    const price = Number(prod.priceToCustomer || prod.price || 0) || null;
    const mrp = Number(prod.mrp || 0) || null;

    return {
      ...prod,
      id: prod._id || prod.id,
      category: catCode.includes("bike")
        ? "bike"
        : catCode.includes("white")
          ? "white-goods"
          : "car",
      brand: prod.brandId?.name || prod.brand?.name || (typeof prod.brand === "string" ? prod.brand : "") || "",
      price,
      lo: price,
      hi: mrp,
      mrp,
      indexNo: prod.indexNo || prod.sku || "",
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
      priceToCustomer: price,
      dealerRefName: prod.dealerRefName || "",
      priceListRef: prod.priceListRef || "",
      image: prod.images?.[0] || prod.image || "",
      images: prod.images?.length
        ? prod.images
        : prod.image
          ? [prod.image]
          : [],
      colors: colorsList,
      colorObjs,
      featureGroups,
      engine: prod.engineCapacity
        ? `${prod.engineCapacity} cc`
        : prod.attributes?.engine || prod.engine || "",
      fuel: prod.fuelType
        ? [prod.fuelType]
        : prod.attributes?.fuel
          ? [prod.attributes.fuel]
          : Array.isArray(prod.fuel)
            ? prod.fuel
            : prod.fuel
              ? [prod.fuel]
              : [],
      trans: prod.attributes?.transmission || prod.trans || "",
      power: prod.attributes?.power || prod.power || "",
      mileage: prod.attributes?.mileage || prod.mileage || "",
      boot: prod.attributes?.boot || prod.boot || "",
      airbags: prod.attributes?.airbags || prod.airbags || "",
      type: prod.variant || prod.attributes?.type || prod.type || "",
      brakes: prod.attributes?.brakes || prod.brakes || "",
      rating: Number(prod.rating) || null,
      reviews: Number(prod.reviews) || null,
      sku: prod.indexNo || prod.sku || "",
    };
  }, [rawProduct]);

  const [fuel, setFuel] = useState("");
  const [drive, setDrive] = useState("");
  const [main, setMain] = useState(0);
  const [tab, setTab] = useState("overview");
  const [zoom, setZoom] = useState(null);
  const [copied, setCopied] = useState(false);

  // Modals state
  const [dealerModalOpen, setDealerModalOpen] = useState(false);
  const [urcModalOpen, setUrcModalOpen] = useState(false);
  const [eligibilityModalOpen, setEligibilityModalOpen] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [checkoutErrors, setCheckoutErrors] = useState({});

  // Cascading reset handlers strictly following Phase 5-8 rules:
  // 1. State change resets Dealer, Depot, URC, PriceZone, and state price
  const handleStateChange = (stateName) => {
    setSelectedState(stateName);
    setSelectedDealerId("");
    setSelectedDepotId("");
    setSelectedUrcId("");
    setSelectedZoneId("");
    setCheckoutErrors((prev) => ({
      ...prev,
      state: null,
      dealer: null,
      depot: null,
      urc: null,
      price: null,
    }));
  };

  // 2. Dealer change resets Depot and URC
  const handleDealerChange = (dealerId) => {
    setSelectedDealerId(dealerId);
    setSelectedDepotId("");
    setSelectedUrcId("");
    setSelectedZoneId("");
    setCheckoutErrors((prev) => ({
      ...prev,
      dealer: null,
      depot: null,
      urc: null,
    }));
  };

  // 3. Depot change resets URC and maps internal priceZoneId
  const handleDepotChange = (depotId) => {
    setSelectedDepotId(depotId);
    setSelectedUrcId("");
    const dep = availableDepots.find((d) => String(d._id) === String(depotId));
    if (dep?.priceZoneId) {
      setSelectedZoneId(
        typeof dep.priceZoneId === "object"
          ? dep.priceZoneId._id
          : dep.priceZoneId,
      );
    }
    setCheckoutErrors((prev) => ({
      ...prev,
      depot: null,
      urc: null,
    }));
  };

  // 4. URC change
  const handleUrcChange = (urcId) => {
    setSelectedUrcId(urcId);
    setCheckoutErrors((prev) => ({
      ...prev,
      urc: null,
    }));
  };

  useEffect(() => {
    if (p) {
      setColor(p.colors?.[0] || "");
      setFuel(p.fuel?.[0] || "");
      setDrive(p.trans ? p.trans.split(" / ")[0] : "");
      document.title = `${p.name} - CSD AFD Online Portal`;
    }
  }, [p]);

  // Current entity objects resolved strictly against backend option sets
  const currentDepot = useMemo(() => {
    return (
      availableDepots.find((d) => String(d._id) === String(selectedDepotId)) ||
      null
    );
  }, [availableDepots, selectedDepotId]);

  const currentDealer = useMemo(() => {
    return (
      availableDealers.find(
        (d) => String(d._id) === String(selectedDealerId),
      ) || null
    );
  }, [availableDealers, selectedDealerId]);

  const currentUrc = useMemo(() => {
    return (
      availableUrcs.find((u) => String(u._id) === String(selectedUrcId)) || null
    );
  }, [availableUrcs, selectedUrcId]);

  // Internal priceZone mapping (derived from depot's priceZoneId, or first matching zone for state)
  const currentZone = useMemo(() => {
    if (currentDepot?.priceZoneId) {
      if (typeof currentDepot.priceZoneId === "object") return currentDepot.priceZoneId;
      return { _id: currentDepot.priceZoneId, name: selectedState };
    }
    const stateObj = availableStates.find(
      (s) => (s.state || s) === selectedState,
    );
    if (stateObj?.priceZones?.length) {
      return stateObj.priceZones[0];
    }
    return null;
  }, [currentDepot, availableStates, selectedState]);

  const colorImages = useMemo(
    () => (p?.colorObjs || []).find((c) => c.name === color)?.images || [],
    [p, color],
  );
  const imgs = useGallery(p, colorImages);

  useEffect(() => {
    setMain(0); // colour changed -> start from its first photo
  }, [color]);

  const similar = useMemo(
    () =>
      p && all.length
        ? all.filter((x) => x.id !== String(p.id) && x.category === p.category).slice(0, 4)
        : [],
    [all, p],
  );

  if (err)
    return (
      <UnavailableState
        title="Product not available"
        text="We could not load this product from the server. Please try again."
        onRetry={load}
      />
    );
  if (loadingProduct) return <Loader label="Loading product" onRetry={load} />;
  if (!p)
    return (
      <EmptyState
        title="Product not found"
        text="This product is not available."
        action={
          <Link className="btn" to="/products">
            Browse products
          </Link>
        }
      />
    );

  const skuNumber = p?.sku || p?.indexNo || "Not available";
  const mfgCode = p?.mfrCode || p?.mfgCode || p?.firmCode || "Not available";

  const car = p.category === "car",
    bike = p.category === "bike",
    appl = p.category === "white-goods";
  const w = wish.includes(p.id),
    c = cmp.includes(p.id);
  const gallery = imgs.length ? imgs : [p.image];

  const highlights = (
    car
      ? [
        [Cog, "Engine", val(p.engine)],
        [Zap, "Power", val(p.power)],
        [Gauge, "Mileage", val(p.mileage)],
        [Fuel, "Fuel", val(p.fuel)],
        [Package, "Boot space", val(p.boot)],
        [ShieldCheck, "Airbags", val(p.airbags)],
        [Cpu, "Transmission", val(p.trans)],
        [Armchair, "Body type", val(p.type)],
      ]
      : bike
        ? [
          [Cog, "Engine", val(p.engine)],
          [Zap, "Power", val(p.power)],
          [Gauge, "Mileage", val(p.mileage)],
          [Fuel, "Fuel", val(p.fuel)],
          [Disc3, "Brakes", val(p.brakes)],
          [Armchair, "Type", val(p.type)],
        ]
        : [
          [Armchair, "Type", val(p.type)],
          [
            BadgePercent,
            "Discount",
            p.discount ? `${p.discount}% off` : null,
          ],
          [CircleDollarSign, "MRP", isAuthenticated && p.mrp ? inr(p.mrp) : null],
          [BadgeCheck, "Brand", p.brand],
        ]
  ).filter((h) => h[2]);

  const specGroups = car
    ? [
      [
        "General",
        [
          ["CSD Index / SKU", skuNumber],
          ["Manufacturer Code", mfgCode],
          ["Brand", p.brand],
          ["Body type", p.type],
          ["Transmission", p.trans],
          ["Fuel type", val(p.fuel)],
          ["Colours", val(p.colors)],
        ],
      ],
      [
        "Engine & performance",
        [
          ["Engine", p.engine],
          ["Max power", p.power],
          ["Mileage (ARAI)", p.mileage],
        ],
      ],
      [
        "Dimensions & safety",
        [
          ["Boot space", p.boot],
          ["Airbags", p.airbags],
        ],
      ],
    ]
    : bike
      ? [
        [
          "General",
          [
            ["CSD Index / SKU", skuNumber],
            ["Manufacturer Code", mfgCode],
            ["Brand", p.brand],
            ["Type", p.type],
            ["Fuel type", val(p.fuel)],
            ["Colours", val(p.colors)],
          ],
        ],
        [
          "Engine & performance",
          [
            ["Engine", p.engine],
            ["Max power", p.power],
            ["Mileage", p.mileage],
          ],
        ],
        ["Chassis", [["Brakes (front / rear)", p.brakes]]],
      ]
      : [
        [
          "General",
          [
            ["CSD Index / SKU", skuNumber],
            ["Manufacturer Code", mfgCode],
            ["Brand", p.brand],
            ["Type", p.type],
          ],
        ],
        [
          "Pricing",
          [
            ["Offer price", isAuthenticated ? inr(p.lo) : "Login to view"],
            ["MRP", isAuthenticated ? (p.mrp ? inr(p.mrp) : null) : "Login to view"],
            ["You save", isAuthenticated && p.mrp && p.lo != null && p.mrp > p.lo ? inr(p.mrp - p.lo) : null],
          ],
        ],
      ];

  const about = [
    p.name,
    p.brand && `from ${p.brand}`,
    !isAuthenticated
      ? "Log in to view the concessional price."
      : p.price != null
        ? `Available on the CSD AFD portal at concessional price ${inr(p.price)} (ex-showroom, subject to supply order terms).`
        : "Price is not available right now.",
  ]
    .filter(Boolean)
    .join(" ");

  const tabs = [
    ["overview", "Overview"],
    ["specs", "Specifications"],
    ...(p.featureGroups?.length ? [["features", "Features"]] : []),
  ];
  const copy = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleCheckoutClick = async () => {
    if (!isAuthenticated) {
      navigate(
        `/login?redirect=${encodeURIComponent(`/products/${id}`)}&reason=auth-required`,
      );
      return;
    }

    if (isPendingApproval) {
      alert(
        "Your account is pending admin approval. You can view products, but demand generation will be available after your account is approved by the administrator.",
      );
      return;
    }

    const errs = {};
    if (p.colors?.length > 0 && !color) errs.color = "Please select Color";
    if (!selectedState) errs.state = "Please select State";
    if (!selectedDealerId) {
      errs.dealer =
        availableDealers.length === 0
          ? `No authorized dealer available in ${selectedState || "the selected state"}.`
          : "Please select Dealer";
    }
    if (!selectedDepotId) {
      errs.depot =
        availableDepots.length === 0
          ? `No depots available for ${selectedState || "the selected state"}.`
          : "Please select Depot";
    }
    if (!selectedUrcId) {
      errs.urc =
        availableUrcs.length === 0
          ? "No URC available for the selected depot."
          : "Please select URC";
    }
    if (selectedState && !statePricing) {
      errs.price = "State price is not available for this product.";
    }

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
        reason:
          apiErr?.data?.message ||
          "Eligibility check failed on server. Please ensure your beneficiary profile is verified.",
      });
      setEligibilityModalOpen(true);
    }
  };

  const handleContinueToCheckout = () => {
    setEligibilityModalOpen(false);

    if (eligibilityResult && eligibilityResult.eligible === false) {
      alert(
        `Cannot proceed: ${eligibilityResult.reason || "You are not eligible to purchase this product under CSD AFD rules."}`,
      );
      return;
    }

    const checkoutData = {
      productId: p._id || p.id,
      productName: p.name,
      sku: skuNumber,
      manufacturerCode: mfgCode,
      productImage: gallery[0] || p.image,
      category: p.category,
      brand: p.brand,
      oemId: p.oemId?._id || p.oemId || p.brandId?.oemId,
      selectedColor: color || p.colors?.[0] || "",
      selectedState: selectedState,
      state: selectedState,
      priceZoneId:
        currentDepot?.priceZoneId?._id ||
        currentDepot?.priceZoneId ||
        currentZone?._id ||
        selectedZoneId,
      selectedZone: currentZone?.name || selectedState,
      priceZone: currentZone?.name || selectedState,
      dealerId: currentDealer?._id || selectedDealerId,
      selectedDealer: currentDealer?.name || "",
      depotId: currentDepot?._id || selectedDepotId,
      selectedDepot: currentDepot?.name || "",
      urcId: currentUrc?._id || selectedUrcId,
      selectedUrc: currentUrc?.name || "",
      productPrice: statePricing?.unitPrice || statePricing?.totalAmount || 0,
      basicPrice: statePricing?.basicPrice ?? p.basicPrice,
      csdDiscountPercent: p.csdDiscountPercent || 0,
      csdDiscountAmount: statePricing?.csdDiscountAmount ?? 0,
      marketScheme: statePricing?.marketScheme ?? 0,
      csdBasicWithDiscount:
        statePricing?.csdBasicWithDiscount ?? statePricing?.basicPrice,
      cgstAmount: 0,
      sgstAmount: 0,
      taxAmount: statePricing?.taxAmount || 0,
      taxPercent: statePricing?.taxPercent || 0,
      csdInvoiceAmount: p.csdInvoiceAmount,
      csdProfitAmount: statePricing?.csdProfitAmount ?? (p.csdProfitAmount || 0),
      csdFinalPriceWithConcession: p.csdFinalPriceWithConcession,
      tcsAmount: statePricing?.tcsAmount ?? (p.tcsAmount || 0),
      priceToCustomer: statePricing?.unitPrice || statePricing?.totalAmount,
      quantity: 1,
      taxClass: currentZone?.taxClass || "tax-class-8",
    };

    sessionStorage.setItem(
      "csd_checkout_product",
      JSON.stringify(checkoutData),
    );
    navigate("/checkout", { state: { productData: checkoutData } });
  };

  return (
    <div className="wrap pdp">
      <nav className="bc" aria-label="Breadcrumb">
        <ol>
          <li>
            <Link to="/">Home</Link>
            <ChevronRight size={14} aria-hidden />
          </li>
          <li>
            <Link to={`/products?cat=${p.category}`}>
              {CAT_PLURAL[p.category]}
            </Link>
            <ChevronRight size={14} aria-hidden />
          </li>
          <li>
            <Link to={`/search?q=${encodeURIComponent(p.brand)}`}>
              {p.brand}
            </Link>
            <ChevronRight size={14} aria-hidden />
          </li>
          <li>
            <span aria-current="page">{p.name}</span>
          </li>
        </ol>
      </nav>

      <div className="pdp-top">
        {/* ---------- gallery ---------- */}
        <ProductGallery
          p={p}
          gallery={gallery}
          main={main}
          setMain={setMain}
          zoom={zoom}
          setZoom={setZoom}
          onImgError={onImgError}
          CAT_LABEL={CAT_LABEL}
          appl={appl}
          w={w}
          toggleWish={toggleWish}
        />

        {/* ---------- buy box (Step 6, Fig. 6) ---------- */}
        <section className="buybox" aria-labelledby="pn">
          <div className="pdp-eyebrow-row">
            <p className="eyebrow pdp-eyebrow-text">
              {p.brand} · {p.type}
            </p>
            <span className="badge pdp-eyebrow-sku-badge">
              SKU: {skuNumber} · Mfr Code: {mfgCode}
            </span>
          </div>

          <h1 id="pn" className="pdp-title-heading">
            {p.name}
          </h1>
          {/* <div className="rate-row">
            <Stars v={p.rating} />
            <span className="muted small">{p.reviews?.toLocaleString("en-IN") || 0} reviews</span>
            <span className="pill ok"><Check size={13} aria-hidden /> Available on CSD</span>
          </div> */}

          {/* CSD Beneficiary Procurement Selection Form matching Fig. 6 */}
          <div className="pdp-spec-box">
            <div className="pdp-spec-box-header">
              <div className="pdp-spec-header-top">
                <span className="pdp-spec-header-title">
                  CSD AFD DEMAND SPECIFICATIONS
                </span>
              
              </div>
              <p className="micro muted pdp-spec-desc-text">
                Additional Description of Product: Approved defence concessional
                allocation model.
              </p>
            </div>

            <ProductBuyBox
              p={p}
              id={id}
              isAuthenticated={isAuthenticated}
              isPendingApproval={isPendingApproval}
              color={color}
              setColor={setColor}
              checkoutErrors={checkoutErrors}
              availableStates={availableStates}
              selectedState={selectedState}
              handleStateChange={handleStateChange}
              availableDealers={availableDealers}
              selectedDealerId={selectedDealerId}
              handleDealerChange={handleDealerChange}
              loadingDealers={loadingDealers}
              currentDealer={currentDealer}
              setDealerModalOpen={setDealerModalOpen}
              availableDepots={availableDepots}
              selectedDepotId={selectedDepotId}
              handleDepotChange={handleDepotChange}
              loadingDepots={loadingDepots}
              availableUrcs={availableUrcs}
              selectedUrcId={selectedUrcId}
              handleUrcChange={handleUrcChange}
              loadingUrcs={loadingUrcs}
              currentUrc={currentUrc}
              setUrcModalOpen={setUrcModalOpen}
              loadingStatePrice={loadingStatePrice}
              fetchingStatePrice={fetchingStatePrice}
              statePricing={statePricing}
              checkingEligibility={checkingEligibility}
              handleCheckoutClick={handleCheckoutClick}
            />
          </div>

          {/* <div className="sub-row ">
          
          </div> */}

        
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
      <ProductTabs
        tab={tab}
        setTab={setTab}
        tabs={tabs}
        p={p}
        about={about}
        highlights={highlights}
        getColorClass={getColorClass}
        specGroups={specGroups}
        val={val}
      />

      {similar.length > 0 && (
        <section aria-labelledby="sim">
          <div className="sec-h">
            <h2 id="sim">Similar {CAT_PLURAL[p.category].toLowerCase()}</h2>
            <Link className="more" to={`/products?cat=${p.category}`}>
              View all <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
          <div className="pgrid">
            {/* {} */}
            {similar.map((x) => (
              <ProductCard key={x.id} p={x} />
            ))}
          </div>
        </section>
      )}

      <div className="mbar">
        <div>
          <small>{appl ? "Price" : "Starting at"}</small>
          <strong>{isAuthenticated ? priceFrom(p) : "Login to view"}</strong>
        </div>
        <button
          className={`btn ${!isAuthenticated ? "btn-disabled-login" : ""}`}
          onClick={() => {
            if (!isAuthenticated) {
              navigate(
                `/login?redirect=${encodeURIComponent(`/products/${id}`)}&reason=auth-required`,
              );
            } else {
              addCart(p);
            }
          }}
          disabled={!isAuthenticated}
          title={!isAuthenticated ? "Please log in to proceed" : undefined}
        >
          {!isAuthenticated ? (
            <Lock size={16} aria-hidden />
          ) : (
            <ShoppingCart size={16} aria-hidden />
          )}
          {!isAuthenticated ? "Login to checkout" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
