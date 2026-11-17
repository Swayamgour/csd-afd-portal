import React from 'react';
import { Heart } from 'lucide-react';

export function ProductGallery({
  p,
  gallery,
  main,
  setMain,
  zoom,
  setZoom,
  onImgError,
  CAT_LABEL,
  appl,
  w,
  toggleWish,
}) {
  return (
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
          alt={`${p?.name} view ${main + 1}`}
          onError={(e) => onImgError?.(e, p?.name)}
        />
        <span className="tag">{CAT_LABEL[p?.category] || p?.category}</span>
        {appl && p?.discount > 0 && (
          <span className="disc">{p.discount}% OFF</span>
        )}
        <button
          className={`fav-big ${w ? "on" : ""}`}
          aria-pressed={w}
          aria-label={w ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => toggleWish?.(p)}
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
  );
}

export default ProductGallery;
