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
import { Loader, EmptyState, UnavailableState } from "../components/States.jsx";
import { useStore } from "../context/Store.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useStoreProducts } from "../hooks/useStoreProducts.js";
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
function useGallery(p) {
  const [imgs, setImgs] = useState([]);

  useEffect(() => {
    if (!p) {
      setImgs([]);
      return;
    }

    let live = true;

    const backendImages = Array.isArray(p.images)
      ? [...new Set(p.images.filter(Boolean))]
      : [];

    if (!backendImages.length) {
      setImgs([]);
      return;
    }

    // Backend se aayi images ko exactly same order mein use karo.
    const validImages = [];

    backendImages.forEach((src) => {
      const img = new Image();

      img.onload = () => {
        if (!live) return;

        validImages.push(src);

        // Backend array ka order preserve karo
        const orderedImages = backendImages.filter((image) =>
          validImages.includes(image),
        );

        setImgs(orderedImages);
      };

      img.onerror = () => {
        // Invalid image ko gallery mein add nahi karna
      };

      img.src = src;
    });

    return () => {
      live = false;
    };
  }, [p]);

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
    { state: selectedState, productId: id, quantity: 1 },
    { skip: !id || !selectedState },
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
    const colorsList = prod.attributes?.colors
      ? String(prod.attributes.colors).split(",").map((c) => c.trim()).filter(Boolean)
      : Array.isArray(prod.colors)
        ? prod.colors
        : [];

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

  const [color, setColor] = useState("");
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

  const imgs = useGallery(p);

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

  console.log(imgs, p.image);

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
          [CircleDollarSign, "MRP", p.mrp ? inr(p.mrp) : null],
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
            ["Offer price", inr(p.lo)],
            ["MRP", p.mrp ? inr(p.mrp) : null],
            ["You save", p.mrp && p.lo != null && p.mrp > p.lo ? inr(p.mrp - p.lo) : null],
          ],
        ],
      ];

  const about = [
    p.name,
    p.brand && `from ${p.brand}`,
    p.price != null
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
        <div className="gallery">
          <div
            className={`stage ${zoom ? "zoom" : ""}`}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - r.left) / r.width) * 100;
              const y = ((e.clientY - r.top) / r.height) * 100;
              e.currentTarget.style.setProperty("--zx", `${x}%`);
              e.currentTarget.style.setProperty("--zy", `${y}%`);
              setZoom(true);
            }}
            onMouseLeave={() => setZoom(false)}
          >
            <img
              className="main-img"
              src={gallery[Math.min(main, gallery.length - 1)]}
              alt={`${p.name} view ${main + 1}`}
              onError={(e) => onImgError(e, p.name)}
            />
            <span className="tag">{CAT_LABEL[p.category]}</span>
            {appl && p.discount > 0 && (
              <span className="disc">{p.discount}% OFF</span>
            )}
            <button
              className={`fav-big ${w ? "on" : ""}`}
              aria-pressed={w}
              aria-label={w ? "Remove from wishlist" : "Add to wishlist"}
              onClick={() => toggleWish(p)}
            >
              <Heart size={20} fill={w ? "currentColor" : "none"} />
            </button>
          </div>
          {gallery.length > 1 && (
            <ul className="thumbs" aria-label="Product images">
              {gallery.map((src, i) => (
                <li key={src}>
                  <button
                    type="button"
                    className={main === i ? "active" : ""}
                    aria-label={`Show image ${i + 1}`}
                    aria-pressed={main === i}
                    onClick={() => setMain(i)}
                  >
                    <img src={src} alt="" loading="lazy" />
                  </button>
                </li>
              ))}
            </ul>
          )}

        </div>

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
                <span className="pdp-spec-header-sku">
                  SKU: <strong>{skuNumber}</strong> · Manufacturer Code:{" "}
                  <strong>{mfgCode}</strong>
                </span>
              </div>
              <p className="micro muted pdp-spec-desc-text">
                Additional Description of Product: Approved defence concessional
                allocation model.
              </p>
            </div>

            <div className="pdp-spec-form">
              {/* Color Dropdown (only when the server provides colours) */}
              {p.colors?.length > 0 && (
                <div>
                  <label className="form-label font-semibold pdp-form-label">
                    Color <span className="pdp-req-star">*</span>
                  </label>
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className={`select-input pdp-form-select ${checkoutErrors.color ? "has-error" : ""}`}
                  >
                    <option value="">-- Select Color --</option>
                    {p.colors.map((cName) => (
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
              )}

              {/* State Dropdown + Dynamic Count */}
              <div>
                <div className="between pdp-form-label">
                  <label className="form-label font-semibold pdp-form-label-inline">
                    State <span className="pdp-req-star">*</span>
                  </label>
                  <span className="badge pdp-count-badge">
                    Count: {availableStates.length}
                  </span>
                </div>
                <select
                  value={selectedState || ""}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className={`select-input pdp-form-select ${checkoutErrors.state ? "has-error" : ""}`}
                >
                  <option value="">-- Select State --</option>
                  {availableStates.map((st) => {
                    const stName = st.state || st;
                    return (
                      <option key={stName} value={stName}>
                        {stName}
                      </option>
                    );
                  })}
                </select>
                {checkoutErrors.state && (
                  <span className="micro text-danger pdp-error-text">
                    {checkoutErrors.state}
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
                    value={selectedDealerId || ""}
                    onChange={(e) => handleDealerChange(e.target.value)}
                    disabled={!selectedState}
                    className={`select-input pdp-form-select pdp-input-flex-1 ${checkoutErrors.dealer ? "has-error" : ""}`}
                  >
                    <option value="">
                      {!selectedState ? "-- Select State First --" : "-- Select Dealer --"}
                    </option>
                    {availableDealers.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} ({d.city || d.state || ""})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setDealerModalOpen(true)}
                    disabled={!currentDealer}
                    className="btn-view-dealer"
                  >
                    View Dealer
                  </button>
                </div>
                {selectedState && !loadingDealers && availableDealers.length === 0 && (
                  <p className="micro text-danger mt-1">
                    No authorized dealer available for this product in {selectedState}.
                  </p>
                )}
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
                  value={selectedDepotId || ""}
                  onChange={(e) => handleDepotChange(e.target.value)}
                  disabled={!selectedState || !selectedDealerId}
                  className={`select-input pdp-form-select ${checkoutErrors.depot ? "has-error" : ""}`}
                >
                  <option value="">
                    {!selectedState
                      ? "-- Select State First --"
                      : !selectedDealerId
                        ? "-- Select Dealer First --"
                        : "-- Select Depot --"}
                  </option>
                  {availableDepots.map((dep) => (
                    <option key={dep._id} value={dep._id}>
                      {dep.name} ({dep.city || dep.state || ""})
                    </option>
                  ))}
                </select>
                {selectedDealerId && !loadingDepots && availableDepots.length === 0 && (
                  <p className="micro text-danger mt-1">
                    No depot is linked to this dealer in {selectedState}.
                  </p>
                )}
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
                    value={selectedUrcId || ""}
                    onChange={(e) => handleUrcChange(e.target.value)}
                    disabled={!selectedDepotId}
                    className={`select-input pdp-form-select pdp-input-flex-1 ${checkoutErrors.urc ? "has-error" : ""}`}
                  >
                    <option value="">
                      {!selectedDepotId ? "-- Select Depot First --" : "-- Select URC --"}
                    </option>
                    {availableUrcs.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} {u.city ? `(${u.city})` : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setUrcModalOpen(true)}
                    disabled={!currentUrc}
                    className="btn-view-urc"
                  >
                    View URC
                  </button>
                </div>
                {selectedDepotId && !loadingUrcs && availableUrcs.length === 0 && (
                  <p className="micro text-danger mt-1">
                    No URC available for the selected depot.
                  </p>
                )}
                {checkoutErrors.urc && (
                  <span className="micro text-danger pdp-error-text">
                    {checkoutErrors.urc}
                  </span>
                )}
              </div>

              {/* State-wise Concessional Price Display matching Official CSD Price List */}
              <div className="pdp-price-box pdp-rate-sheet-box">
                <div className="between align-center mb-1">
                  <span className="small font-bold pdp-rate-customer-label">
                    {selectedState ? `State Price (${selectedState}):` : "State Price:"}
                  </span>
                  <div className="h3 font-bold text-brand pdp-price-amount">
                    {!selectedState ? (
                      <span className="micro text-muted font-normal">Select State to view price</span>
                    ) : (loadingStatePrice || fetchingStatePrice) ? (
                      <span className="micro text-muted font-normal">Loading price...</span>
                    ) : statePricing ? (
                      inr(statePricing.unitPrice || statePricing.totalAmount)
                    ) : (
                      <span className="micro text-danger font-normal">State price not available</span>
                    )}
                  </div>
                </div>

                {checkoutErrors.price && (
                  <p className="micro text-danger mb-2">{checkoutErrors.price}</p>
                )}

                {selectedState && statePricing ? (
                  <div className="csd-official-rate-sheet pdp-official-breakdown">
                    <div className="pdp-breakdown-title">
                      📋 Official CSD Rate Breakdown (INDEX NO: {p.indexNo || p.sku})
                    </div>
                    <div className="between py-1 pdp-breakdown-row">
                      <span className="muted">
                        Basic Price (incl. Dealer Margin):
                      </span>
                      <span>
                        ₹ {Number(statePricing.basicPrice || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    {Number(statePricing.taxAmount || 0) > 0 && (
                      <div className="between py-1 pdp-breakdown-row">
                        <span className="muted">
                          Concessional Taxes (GST / Statutory):
                        </span>
                        <span>
                          + ₹ {Number(statePricing.taxAmount).toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                    {Number(statePricing.csdProfitAmount || 0) > 0 && (
                      <div className="between py-1 pdp-breakdown-row">
                        <span className="muted">
                          CSD Profit Margin:
                        </span>
                        <span>
                          + ₹ {Number(statePricing.csdProfitAmount).toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                    {Number(statePricing.tcsAmount || 0) > 0 && (
                      <div className="between py-1 pdp-breakdown-row">
                        <span className="muted">TCS (if applicable):</span>
                        <span>
                          + ₹ {Number(statePricing.tcsAmount).toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                    <div className="micro muted mt-1 pt-1 pdp-dealer-ref-note">
                      State: {selectedState} | Source: {statePricing.priceSource || "STATE"}
                    </div>
                  </div>
                ) : !selectedState ? (
                  <div className="micro muted pdp-price-subtext">
                    Please select a State to view state-wise concessional CSD ex-showroom price.
                  </div>
                ) : (
                  <div className="micro text-danger pdp-price-subtext">
                    State price is not available for this product in {selectedState}.
                  </div>
                )}
              </div>

              {/* Login Required Notice */}
              {!isAuthenticated && (
                <div className="pdp-login-notice">
                  <div className="pdp-notice-inner">
                    <div className="pdp-notice-text-wrap">
                      <Lock size={16} className="pdp-notice-icon" />
                      <span>
                        <strong>Login Required:</strong> Please log in to unlock
                        checkout and generate demand.
                      </span>
                    </div>
                    <Link
                      to={`/login?redirect=${encodeURIComponent(`/products/${id}`)}`}
                      className="pdp-notice-login-link"
                    >
                      Login Now <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              )}

              {/* Pending Approval Notice */}
              {isAuthenticated && isPendingApproval && (
                <div className="pdp-pending-notice">
                  <div className="pdp-pending-title">
                    <AlertCircle size={16} /> Account Pending Admin Approval
                  </div>
                  Your account is pending admin approval. You can view products,
                  but demand generation will be available after your account is
                  approved by the administrator.
                </div>
              )}

              {/* Official CHECKOUT CTA matching Fig. 6 */}
              <button
                type="button"
                onClick={handleCheckoutClick}
                disabled={
                  !isAuthenticated || checkingEligibility || isPendingApproval
                }
                className={`btn-checkout-cta ${!isAuthenticated || isPendingApproval ? "btn-checkout-disabled" : ""}`}
                title={
                  !isAuthenticated
                    ? "Please login to proceed with checkout"
                    : isPendingApproval
                      ? "Your account is pending admin approval. Demand generation will be available after your account is approved by the administrator."
                      : undefined
                }
              >
                {!isAuthenticated ? (
                  <span className="btn-checkout-content">
                    <Lock size={16} /> LOGIN TO CHECKOUT
                  </span>
                ) : isPendingApproval ? (
                  "DEMAND GENERATION DISABLED (APPROVAL PENDING)"
                ) : checkingEligibility ? (
                  "VERIFYING ELIGIBILITY..."
                ) : (
                  "Add to Cart"
                )}
              </button>


            </div>
          </div>

          {/* <div className="sub-row ">
          
          </div> */}

          {highlights.length > 0 && (
            <ul className="hl pdp-subrow-mt">
              {highlights.slice(0, 6).map(([Ic, l, v]) => (
                <li key={l}>
                  <span>
                    <Ic size={18} aria-hidden />
                  </span>
                  <div>
                    <small>{l}</small>
                    <strong>{v}</strong>
                  </div>
                </li>
              ))}
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
          {tabs.map(([k, l]) => (
            <button
              key={k}
              role="tab"
              id={`t-${k}`}
              aria-selected={tab === k}
              aria-controls={`pn-${k}`}
              className={tab === k ? "on" : ""}
              onClick={() => setTab(k)}
            >
              {l}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div
            role="tabpanel"
            id="pn-overview"
            aria-labelledby="t-overview"
            className="tabpanel"
          >
            <h2>About {p.name}</h2>
            <p className="about">{about}</p>
            <h3>Key highlights</h3>
            <ul className="hl wide">
              {highlights.map(([Ic, l, v]) => (
                <li key={l}>
                  <span>
                    <Ic size={18} aria-hidden />
                  </span>
                  <div>
                    <small>{l}</small>
                    <strong>{v}</strong>
                  </div>
                </li>
              ))}
            </ul>
            {p.colors?.length > 0 && (
              <>
                <h3>
                  <Palette size={16} aria-hidden /> Available colours
                </h3>
                <ul className="colors">
                  {p.colors.map((c2) => (
                    <li key={c2}>
                      <i className={`swatch-dot ${getColorClass(c2)}`} />
                      {c2}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {tab === "specs" && (
          <div
            role="tabpanel"
            id="pn-specs"
            aria-labelledby="t-specs"
            className="tabpanel"
          >
            {specGroups.map(([g, rows]) => (
              <div key={g} className="spec-g">
                <h3>{g}</h3>
                <dl className="specs">
                  {rows.map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{val(v) || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
            <p className="muted small">
              Specifications are indicative and may vary by variant. Confirm
              with the supply order.
            </p>
          </div>
        )}

        {tab === "features" && p.featureGroups?.length > 0 && (
          <div
            role="tabpanel"
            id="pn-features"
            aria-labelledby="t-features"
            className="tabpanel"
          >
            <div className="feat-grid">
              {p.featureGroups.map(([g, items]) => (
                <div key={g} className="feat">
                  <h3>{g}</h3>
                  <ul>
                    {items.map((f) => (
                      <li key={f}>
                        <Check size={15} aria-hidden />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

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
          <strong>{priceFrom(p)}</strong>
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
