import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Headset,
  Info,
  Car,
  Bike,
  Refrigerator,
  CircleCheck,
  Phone,
  FileText,
} from "lucide-react";
import Catalog from "../components/Catalog.jsx";
import { Loader, UnavailableState, InlineNote } from "../components/States.jsx";
import { useStoreProducts } from "../hooks/useStoreProducts.js";
import { useGetBannersQuery, useGetContentQuery } from "../features/admin/adminApi.js";
import { useAuth } from "../context/AuthContext.jsx";
import { normalizeRole } from "../permissions/roles.js";

// Category tiles: only labels/icons live here (UI). Counts and images come from the server data.
const CATEGORY_TILES = [
  { key: "car", group: "Automobiles", label: "Cars", to: "/products?cat=car", cls: "car", Icon: Car },
  { key: "bike", group: "Automobiles", label: "Bikes", to: "/products?cat=bike", cls: "bike", Icon: Bike },
  { key: "white-goods", group: "Home & Living", label: "Appliances", to: "/products?cat=white-goods", cls: "app", Icon: Refrigerator },
];

const text = (v) => (v && typeof v === "object" ? v.en || Object.values(v)[0] : v) || "";
const HIDDEN_STATUS = ["DRAFT", "ARCHIVED", "INACTIVE", "EXPIRED"];

/** Link for internal paths, <a> for full URLs, plain <div> when the notice has no link. */
function NoticeLink({ to, className, children }) {
  if (!to) return <div className={className}>{children}</div>;
  if (/^https?:\/\//i.test(to))
    return <a href={to} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
  return <Link to={to} className={className}>{children}</Link>;
}

export const Shop = ({ to = "/products", children = "Shop now" }) => (
  <Link to={to} className="shop">
    {children}
    <span>
      <ArrowUpRight size={18} aria-hidden />
    </span>
  </Link>
);

export default function Home() {
  const [cat, setCat] = useState("car");
  const { isAuthenticated, role, roleHome, user } = useAuth();
  const navigate = useNavigate();

  // Shared request: Catalog below, Header search and Cart use the SAME cached call.
  const { products: allProducts, isLoading: productsLoading, isError: productsError, refetch } = useStoreProducts();

  // If a departmental officer (Depot, Dealer, CSD HO, URC, Admin) visits the home page, redirect to their operations dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const canonicalRole = normalizeRole(role || user?.role);
      if (canonicalRole && canonicalRole !== "beneficiary") {
        navigate(roleHome || "/depot/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, role, roleHome, user, navigate]);

  // Category tiles built from real data (count + first available image); empty categories are not shown
  const cats = useMemo(
    () =>
      CATEGORY_TILES.map((t) => {
        const inCat = allProducts.filter((p) => p.category === t.key);
        return { ...t, count: inCat.length, img: inCat.find((p) => p.image)?.image || "" };
      }).filter((t) => t.count > 0),
    [allProducts],
  );

  // Hero banners (logged-out only) - server only, no default images
  const { data: heroData, isLoading: heroLoading } = useGetBannersQuery(
    { position: "home_hero" },
    { skip: isAuthenticated },
  );
  const heroBanners = Array.isArray(heroData) ? heroData.filter((b) => b?.imageUrl) : [];

  // News & notices from the server
  const { data: content, isLoading: newsLoading, isError: newsError, refetch: refetchNews } =
    useGetContentQuery({ type: "CIRCULAR" });
  const notices = useMemo(
    () =>
      (Array.isArray(content) ? content : [])
        .filter((c) => !HIDDEN_STATUS.includes(String(c.status || "").toUpperCase()))
        .sort(
          (a, b) =>
            new Date(b.publishAt || b.createdAt || 0) - new Date(a.publishAt || a.createdAt || 0),
        )
        .map((c, i) => ({
          id: c._id || c.id || i,
          tag: c.position || c.type || "Notice",
          title: text(c.title),
          summary: text(c.summary),
          to: c.url || c.link || "",
        }))
        .filter((n) => n.title),
    [content],
  );
  const featured = notices[0];
  const otherNotices = notices.slice(1, 5);

  return (
    <div className="home">
      {!isAuthenticated &&
        (<section className="hero" aria-labelledby="h1">
          {/* Background Image Slider (server banners only) */}
          {heroBanners.length > 0 && (
            <div className="hero-slider">
              {heroBanners.map((slide, idx) => {
                const isSingle = heroBanners.length === 1;
                const duration = Math.max(heroBanners.length * 5, 10);
                return (
                  <img
                    key={slide._id || slide.id || idx}
                    src={slide.imageUrl}
                    alt={slide.name || `Hero Banner ${idx + 1}`}
                    className={
                      isSingle
                        ? "hero-single-slide"
                        : `hero-slide-duration-${Math.min(30, Math.max(10, Math.round(duration / 5) * 5))} hero-slide-delay-${Math.min(5, idx)}`
                    }
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Dark overlay */}
          <div className="hero-overlay"></div>

          {/* Content above slider */}
          <div className="hero-content">
            <h1 id="h1">
              CSD AFD
              <br />
              ONLINE
            </h1>

            <Shop to="/products?cat=car" />
          </div>
        </section>)
      }

      <div className="wrap">
        <section aria-labelledby="cats">
          <div className="sec-h">
            <h2 id="cats">Available Products</h2>
          </div>

          {productsError ? (
            <UnavailableState
              title="Products not available"
              text="We could not load product categories from the server."
              onRetry={refetch}
            />
          ) : productsLoading ? (
            <Loader label="Loading categories" onRetry={refetch} />
          ) : cats.length === 0 ? (
            <InlineNote>No products are available right now.</InlineNote>
          ) : (
            <ul className="grid3 cats">
              {cats.map((t, i) => (
                <li key={t.key} className={i === 2 ? "wide2" : ""}>
                  <Link className={`cat ${t.cls}`} to={t.to}>
                    <small>{t.group}</small>
                    <strong>{t.label}</strong>
                    <span className="cta">
                      Explore <ArrowUpRight size={15} aria-hidden />
                    </span>
                    {t.img && <img src={t.img} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.display = "none")} />}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section id="shop" aria-labelledby="shop-h" className="shop-sec">
          <div className="sec-h">
            <h2 id="shop-h">Explore the range</h2>
            <Link to={`/products?cat=${cat}`} className="more">
              View all <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
          <Catalog
            cat={cat}
            onCat={setCat}
            embedded
            title={
              { car: "Cars", bike: "Bikes", "white-goods": "Home appliances" }[
              cat
              ]
            }
          />
        </section>

        {/* ===================== NEWS & NOTICES ===================== */}
        <section aria-labelledby="news" className="news">
          <div className="sec-h">
            <h2 id="news">News &amp; notices</h2>
          </div>

          {newsLoading && <Loader label="Loading notices" />}
          {newsError && !newsLoading && (
            <UnavailableState
              title="Notices not available"
              text="We could not load news and notices right now."
              onRetry={refetchNews}
            />
          )}
          {!newsLoading && !newsError && notices.length === 0 && (
            <InlineNote>No news or notices have been published yet.</InlineNote>
          )}

          <div className="news-grid">
            {/* Featured story (latest published notice) */}
            {featured && (
              <NoticeLink to={featured.to} className="news-feature">
                <div className="news-feature-body">
                  <span className="news-chip light">{featured.tag}</span>
                  <h3>{featured.title}</h3>
                  {featured.summary && <p>{featured.summary}</p>}
                  {featured.to && (
                    <span className="news-more">
                      Read more <ArrowRight size={16} aria-hidden />
                    </span>
                  )}
                </div>
              </NoticeLink>
            )}

            {/* Other notices */}
            {otherNotices.length > 0 && (
              <ul className="news-list">
                {otherNotices.map((n) => (
                  <li key={n.id}>
                    <NoticeLink to={n.to} className="news-item">
                      <span className="news-ic" aria-hidden>
                        <FileText size={20} />
                      </span>
                      <span className="news-txt">
                        <span className="news-chip">{n.tag}</span>
                        <strong>{n.title}</strong>
                        {n.summary && <span className="news-sub">{n.summary}</span>}
                      </span>
                      {n.to && <ArrowRight className="news-go" size={18} aria-hidden />}
                    </NoticeLink>
                  </li>
                ))}
              </ul>
            )}

            {/* Help + notes */}
            <div className="news-cards">
              <article className="news-help">
                <span className="news-help-ic" aria-hidden>
                  <Headset size={26} />
                </span>
                <div>
                  <h3>Smart Card Helpdesk</h3>
                  <p>
                    Questions on registration, supply orders, payments or
                    delivery? The helpdesk team can guide you.
                  </p>
                  <div className="row">
                    <Link to="/info/help-desk" className="btn light">
                      <Headset size={16} aria-hidden /> Help Desk
                    </Link>
                    <Link to="/info/contact" className="btn ghost-l">
                      <Phone size={16} aria-hidden /> Contact us
                    </Link>
                  </div>
                </div>
              </article>

              <article className="news-note">
                <div className="news-note-head">
                  <span className="news-ic amber" aria-hidden>
                    <Info size={20} />
                  </span>
                  <h3>Please note</h3>
                </div>
                <ul>
                  <li>
                    <CircleCheck size={18} aria-hidden />
                    <span>
                      Keep your supply order number and registered mobile number
                      ready before contacting the helpdesk.
                    </span>
                  </li>
                  <li>
                    <CircleCheck size={18} aria-hidden />
                    <span>
                      Check price, availability and delivery details on the
                      product page before ordering.
                    </span>
                  </li>
                  <li>
                    <CircleCheck size={18} aria-hidden />
                    <span>Never share your password or OTP with anyone.</span>
                  </li>
                 
                </ul>
              </article>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
