import { Link } from "react-router-dom";
import { Heart, Star, GitCompareArrows, ShoppingCart, Fuel, Gauge } from "lucide-react";
import { useStore } from "../context/Store.jsx";
import { CAT_LABEL, priceText, inr, onImgError } from "../data/utils.js";

export const Stars = ({ v, n }) => (
  <span className="rate" aria-label={`Rated ${v} out of 5${n ? `, ${n} reviews` : ""}`}>
    <Star size={13} fill="currentColor" aria-hidden />
    <b>{v}</b>
    {n != null && <small>({n.toLocaleString("en-IN")})</small>}
  </span>
);

export const Img = ({ p, ...r }) => (
  <img src={p.image} alt={p.name} loading="lazy" onError={(e) => onImgError(e, p.name)} {...r} />
);

export default function ProductCard({ p, list }) {
  const { wish, cmp, toggleWish, toggleCmp, addCart } = useStore(),
    w = wish.includes(p.id),
    c = cmp.includes(p.id),
    appl = p.category === "white-goods";
  return (
    <article className={`card ${list ? "list" : ""}`}>
      <div className="card-img">
        <Link to={`/products/${p.id}`} aria-label={`View ${p.name}`} tabIndex={-1}>
          <Img p={p} />
        </Link>
        <span className="tag">{CAT_LABEL[p.category]}</span>
        {appl && p.discount > 0 && <span className="disc">{p.discount}% OFF</span>}
        <div className="card-act">
          <button className="rb" aria-pressed={w} title={w ? "Remove from wishlist" : "Save to wishlist"}
            aria-label={`${w ? "Remove" : "Add"} ${p.name} ${w ? "from" : "to"} wishlist`} onClick={() => toggleWish(p)}>
            <Heart size={16} fill={w ? "currentColor" : "none"} />
          </button>
          <button className="rb" aria-pressed={c} title={c ? "Remove from compare" : "Add to compare"}
            aria-label={`${c ? "Remove" : "Add"} ${p.name} ${c ? "from" : "to"} compare`} onClick={() => toggleCmp(p)}>
            <GitCompareArrows size={16} />
          </button>
        </div>
      </div>
      <div className="card-body">
        <p className="brand-l">{p.brand} · {p.type}</p>
        <h3><Link to={`/products/${p.id}`}>{p.name}</Link></h3>
        {!appl && (
          <p className="mini">
            {p.fuel?.length > 0 && <span><Fuel size={13} aria-hidden /> {p.fuel.join(" / ")}</span>}
            {/* {p.mileage && p.mileage !== "-" && <span><Gauge size={13} aria-hidden /> {p.mileage}</span>} */}
          </p>
        )}
        {/* <div className="card-foot">
          <p className="price">
            <strong>{priceText(p)}</strong>
            {appl && p.mrp && <><s>{inr(p.mrp)}</s></>}
            {!appl && <small>Ex-showroom*</small>}
          </p>
        </div> */}
          {/* <Stars v={p.rating} /> */}
        <div className="row">
          <Link className="btn out" to={`/products/${p.id}`}>View details</Link>
          {/* <button className="btn" onClick={() => addCart(p)} aria-label={`Add ${p.name} to cart`}><ShoppingCart size={16} aria-hidden /> Add</button> */}
        </div>
      </div>
    </article>
  );
}
