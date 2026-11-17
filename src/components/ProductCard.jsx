import { Link } from "react-router-dom";
import {
  Heart,
  Star,
  GitCompareArrows,
  ShoppingCart,
  Fuel,
  Gauge,
} from "lucide-react";
import { useStore } from "../context/Store.jsx";
import { CAT_LABEL, priceText, inr, onImgError } from "../data/utils.js";
import { placeholder } from "../data/art.js";

export const Stars = ({ v, n }) => (typeof v !== "number" || !v) ? null : (

  <span
    className="rate"
    aria-label={`Rated ${v} out of 5${n ? `, ${n} reviews` : ""}`}
  >
    <Star size={13} fill="currentColor" aria-hidden />
    <b>{v}</b>
    {n != null && <small>({Number(n).toLocaleString("en-IN")})</small>}
  </span>
);

export const getProductImgSrc = (p) => {
  if (!p) return "";
  let firstImg = "";
  if (typeof p === "string") {
    firstImg = p;
  } else {
    firstImg =
      (Array.isArray(p?.images) && p.images.length ? p.images[0] : null) ||
      p?.imageUrl ||
      p?.image ||
      (Array.isArray(p?.raw?.images) && p.raw.images.length ? p.raw.images[0] : null) ||
      p?.raw?.imageUrl ||
      p?.raw?.image ||
      "";
  }

  if (!firstImg || typeof firstImg !== "string") return "";
  if (
    firstImg.startsWith("http://") ||
    firstImg.startsWith("https://") ||
    firstImg.startsWith("data:") ||
    firstImg.startsWith("blob:")
  ) {
    return firstImg;
  }
  if (firstImg.startsWith("/api/") || firstImg.startsWith("/uploads/")) {
    const backendBase = (
      import.meta.env.VITE_API_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:5000/api/v1"
    ).replace(/\/api\/v1\/?$/, "");
    return `${backendBase}${firstImg}`;
  }
  return firstImg;
};

const getCategoryFallback = (cat) => {
  if (!cat) return null;
  const c = String(cat).toLowerCase();
  if (c.includes("white") || c.includes("appliance")) return "/assets/white_goods1.png";
  if (c.includes("bike") || c.includes("motorcycle")) return "/assets/bullet1.png";
  if (c.includes("car")) return "/assets/maruti1.png";
  return null;
};

export const Img = ({ p, ...r }) => {
  const src = getProductImgSrc(p);
  const catFallback = getCategoryFallback(p?.category);
  return (
    <img
      src={src || catFallback || placeholder(p?.name || "Image not available")}
      alt={p?.name || "Product"}
      loading="lazy"
      onError={(e) => {
        const el = e.currentTarget;
        if (!el.dataset.fallback && catFallback && el.src !== catFallback && !el.src.endsWith(catFallback)) {
          el.dataset.fallback = "1";
          el.src = catFallback;
          return;
        }
        onImgError(e, p?.name);
      }}
      {...r}
    />
  );
};

export default function ProductCard({ p, list }) {
  const { wish, cmp, toggleWish, toggleCmp, addCart } = useStore(),
    w = wish.includes(p.id),
    c = cmp.includes(p.id),
    appl = p.category === "white-goods";

  const minPrice =
    p.minPrice ??
    p.priceMin ??
    p.raw?.minPrice ??
    p.raw?.priceMin ??
    p.raw?.priceRange?.min ??
    p.price ??
    p.priceToCustomer ??
    p.concessionalPrice ??
    (p.lo != null
      ? p.category === "white-goods"
        ? p.lo
        : Math.round(p.lo * 100000)
      : null);

  const maxPrice =
    p.maxPrice ??
    p.priceMax ??
    p.raw?.maxPrice ??
    p.raw?.priceMax ??
    p.raw?.priceRange?.max ??
    null;

  let formattedPrice = null;
  if (minPrice != null && maxPrice != null && maxPrice > minPrice) {
    formattedPrice = `₹ ${Number(minPrice).toLocaleString("en-IN")} – ₹ ${Number(maxPrice).toLocaleString("en-IN")}`;
  } else if (minPrice != null && minPrice > 0) {
    formattedPrice = `₹ ${Number(minPrice).toLocaleString("en-IN")}`;
  }

  return (
    <article className={`card ${list ? "list" : ""}`}>
      <div className="card-img">
        <Link
          to={`/products/${p.id}`}
          aria-label={`View ${p.name}`}
          tabIndex={-1}
        >
          <Img p={p} />
        </Link>
        <span className="tag">{CAT_LABEL[p.category]}</span>
        {appl && p.discount > 0 && (
          <span className="disc">{p.discount}% OFF</span>
        )}
        <div className="card-act">
          <button
            className="rb"
            aria-pressed={w}
            title={w ? "Remove from wishlist" : "Save to wishlist"}
            aria-label={`${w ? "Remove" : "Add"} ${p.name} ${w ? "from" : "to"} wishlist`}
            onClick={() => toggleWish(p)}
          >
            <Heart size={16} fill={w ? "currentColor" : "none"} />
          </button>
          <button
            className="rb"
            aria-pressed={c}
            title={c ? "Remove from compare" : "Add to compare"}
            aria-label={`${c ? "Remove" : "Add"} ${p.name} ${c ? "from" : "to"} compare`}
            onClick={() => toggleCmp(p)}
          >
            <GitCompareArrows size={16} />
          </button>
        </div>
      </div>
      <div className="card-body">
        {p.brand && !p.name?.toLowerCase().includes(p.brand.toLowerCase()) && (
          <p className="brand-l">
            {[p.brand, p.type].filter(Boolean).join(" · ")}
          </p>
        )}
        <h3>
          <Link to={`/products/${p.id}`}>{p.name}</Link>
        </h3>
        {(p.sku || p.indexNo) && (
          <p className="card-sku">SKU: {p.sku || p.indexNo}</p>
        )}
        {!appl && p.fuel?.length > 0 && (
          <p className="mini">
            <span>
              <Fuel size={13} aria-hidden /> {p.fuel.join(" / ")}
            </span>
          </p>
        )}
        <div className="card-foot">
          <div className="card-price-block">
            <div className="card-price-main">
              <span className="card-price-amount">
                {formattedPrice || "Price on request"}
              </span>
              {p.mrp && p.mrp > (minPrice || 0) && (
                <s className="card-mrp">₹ {Number(p.mrp).toLocaleString("en-IN")}</s>
              )}
            </div>
            <p className="card-price-note">
              Ex-CSD Price of item inclusive of taxes and levies, excluding charges viz RTO, Insurance Etc, if applicable
            </p>
          </div>
        </div>
        <div className="row">
          <Link className="btn out" to={`/products/${p.id}`}>
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
