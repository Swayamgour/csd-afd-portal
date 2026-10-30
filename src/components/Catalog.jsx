import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  SlidersHorizontal,
  X,
  LayoutGrid,
  Rows3,
  Car,
  Bike,
  Refrigerator,
  Star,
  Check,
} from "lucide-react";
import ProductCard from "./ProductCard.jsx";
import { Loader, EmptyState, UnavailableState } from "./States.jsx";
import { useStoreProducts } from "../hooks/useStoreProducts.js";
import { useStore } from "../context/Store.jsx";
import { CAT_PLURAL, matches, rupees } from "../data/utils.js";

const SORTS = [
  ["rec", "Recommended"],
  ["pa", "Price: Low to High"],
  ["pd", "Price: High to Low"],
  // ["rt", "Top rated"],
  ["dc", "Biggest discount"],
  ["az", "Name: A to Z"],
];
const CATS = [
  ["all", "All", null],
  ["car", "Cars", Car],
  ["bike", "Bikes", Bike],
  ["white-goods", "Appliances", Refrigerator],
];
// const RATINGS = [4.5, 4, 3];
const toggle = (set, v) =>
  set((x) => (x.includes(v) ? x.filter((i) => i !== v) : [...x, v]));
const lakh = (v) => `₹${+v.toFixed(1)} L`;

function Group({ title, items, sel, set, counts }) {
  if (!items.length) return null;
  const isLong = items.length > 6;
  return (
    <fieldset className="fgroup">
      <legend>{title}</legend>
      <div className={isLong ? "fgroup-scroll" : ""}>
        {items.map((b) => (
          <label key={b} className="chk">
            <input
              type="checkbox"
              checked={sel.includes(b)}
              onChange={() => toggle(set, b)}
            />
            <span className="box">
              <Check size={12} aria-hidden />
            </span>
            <span className="lbl">{b}</span>
            {counts && <em>{counts[b] ?? 0}</em>}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Shop browser: category tabs, brand tabs, left filter sidebar, sort and product grid.
 * Used on the Home page (embedded), /products and /search.
 */
export default function Catalog({
  cat,
  onCat,
  q = "",
  onlyWish = false,
  title,
  embedded = false,
  allowAll = false,
}) {
  const { wish, cmp } = useStore();
  // One shared request for the whole app (see hooks/useStoreProducts.js)
  const { products: all, isLoading, isError, isEmpty, refetch } = useStoreProducts();
  const [sort, setSort] = useState("rec"),
    [view, setView] = useState("grid"),
    [drawer, setDrawer] = useState(false);
  const [brands, setBrands] = useState([]),
    [types, setTypes] = useState([]),
    [fuels, setFuels] = useState([]);
  const [trans, setTrans] = useState([]),
    [minRating, setMinRating] = useState(0),
    [pmax, setPmax] = useState(null);

  const reset = () => {
    setBrands([]);
    setTypes([]);
    setFuels([]);
    setTrans([]);
    setMinRating(0);
    setPmax(null);
  };
  useEffect(reset, [cat, q]);
  useEffect(() => {
    if (!drawer) return;
    const k = (e) => e.key === "Escape" && setDrawer(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [drawer]);

  const single = cat !== "all";
  // products in the current scope (category + search + wishlist)
  const scope = useMemo(
    () =>
      (all || []).filter(
        (p) =>
          (!single || p.category === cat) &&
          (!onlyWish || wish.includes(p.id)) &&
          matches(p, q),
      ),
    [all, cat, single, q, onlyWish, wish],
  );
  const priced = scope.filter((p) => p.lo != null).map((p) => p.lo);
  const hi =
    single && priced.length
      ? Math.ceil(Math.max(...priced) / (cat === "white-goods" ? 1000 : 1)) *
        (cat === "white-goods" ? 1000 : 1)
      : 0;
  const lim = pmax ?? hi;
  const money = (v) =>
    cat === "white-goods" ? `₹${Number(v).toLocaleString("en-IN")}` : lakh(v);

  const passes = (p, skipBrand) =>
    (skipBrand || !brands.length || brands.includes(p.brand)) &&
    (!types.length || types.includes(p.type)) &&
    (!fuels.length || (p.fuel || []).some((f) => fuels.includes(f))) &&
    (!trans.length ||
      (p.trans || "").split(" / ").some((t) => trans.includes(t))) &&
    (!minRating || p.rating >= minRating) &&
    (!hi || p.lo == null || p.lo <= lim);

  const brandCounts = useMemo(() => {
    const m = {};
    scope
      .filter((p) => passes(p, true))
      .forEach((p) => {
        m[p.brand] = (m[p.brand] || 0) + 1;
      });
    return m;
  }, [scope, types, fuels, trans, minRating, lim]); // eslint-disable-line

  const brandList = useMemo(
    () =>
      [...new Set(scope.map((p) => p.brand).filter(Boolean))].sort((a, b) => {
        const ca = brandCounts[a] || 0;
        const cb = brandCounts[b] || 0;
        if (cb !== ca) return cb - ca;
        return a.localeCompare(b);
      }),
    [scope, brandCounts],
  );

  const brandTabs = useMemo(
    () => brandList.filter((b) => (brandCounts[b] || 0) > 0),
    [brandList, brandCounts],
  );
  const brandAllCount = Object.values(brandCounts).reduce((a, b) => a + b, 0);

  const list = useMemo(() => {
    let l = scope.filter((p) => passes(p));
    const by = {
      pa: (a, b) => (rupees(a) ?? Infinity) - (rupees(b) ?? Infinity),
      pd: (a, b) => (rupees(b) ?? -Infinity) - (rupees(a) ?? -Infinity),
      rt: (a, b) => (b.rating || 0) - (a.rating || 0),
      dc: (a, b) => (b.discount || 0) - (a.discount || 0),
      az: (a, b) => (a.name || "").localeCompare(b.name || ""),
    }[sort];
    return by ? [...l].sort(by) : l;
  }, [scope, brands, types, fuels, trans, minRating, lim, sort]); // eslint-disable-line

  const uniq = (f) => [...new Set(scope.flatMap(f))].sort();
  const count = (f) => {
    const m = {};
    scope.forEach((p) =>
      f(p).forEach((v) => {
        m[v] = (m[v] || 0) + 1;
      }),
    );
    return m;
  };

  const typeList = uniq((p) => [p.type]).filter(Boolean);

  const fuelList = uniq((p) => p.fuel || []);
  const transList =
    single && cat === "car"
      ? uniq((p) => (p.trans || "").split(" / ").filter(Boolean))
      : [];

  const chips = [
    ...brands.map((b) => [b, () => toggle(setBrands, b)]),
    ...types.map((t) => [t, () => toggle(setTypes, t)]),
    ...fuels.map((t) => [t, () => toggle(setFuels, t)]),
    ...trans.map((t) => [t, () => toggle(setTrans, t)]),
    ...(minRating ? [[`${minRating}★ & up`, () => setMinRating(0)]] : []),
    ...(pmax != null && pmax < hi
      ? [[`Up to ${money(pmax)}`, () => setPmax(null)]]
      : []),
  ];

  const related = useMemo(() => {
    if (!q || !list.length || list.length > 3 || !all.length) return [];
    const bs = new Set(list.map((p) => p.brand)),
      ts = new Set(list.map((p) => p.type)),
      ids = new Set(list.map((p) => p.id));
    return all
      .filter((p) => !ids.has(p.id) && (bs.has(p.brand) || ts.has(p.type)))
      .slice(0, 4);
  }, [all, list, q]);

  const sidebar = (
    <aside className={drawer ? "filters open" : "filters"} aria-label="Filters">
      <div className="filters-head">
        <h2>
          <SlidersHorizontal size={17} aria-hidden /> Filters
        </h2>
        <button className="link" onClick={reset} disabled={!chips.length}>
          Clear all
        </button>
        <button
          className="icon sm close-drawer"
          aria-label="Close filters"
          onClick={() => setDrawer(false)}
        >
          <X size={18} />
        </button>
      </div>

      <fieldset className="fgroup">
        <legend>Sort by</legend>
        {SORTS.filter(
          ([k]) => k !== "dc" || (cat !== "car" && cat !== "bike"),
        ).map(([k, l]) => (
          <label key={k} className="rad">
            <input
              type="radio"
              name={`sort-${embedded ? "e" : "p"}`}
              checked={sort === k}
              onChange={() => setSort(k)}
            />
            <span className="dot" />
            <span className="lbl">{l}</span>
          </label>
        ))}
      </fieldset>

      <Group
        title={
          single
            ? cat === "car"
              ? "Body type"
              : cat === "bike"
                ? "Bike type"
                : "Appliance type"
            : "Type"
        }
        items={typeList}
        sel={types}
        set={setTypes}
        counts={count((p) => [p.type])}
      />
      {/* {console.log("fuelList", fuelList)} */}
      {cat !== "white-goods" && (
        <Group
          title="Fuel type"
          items={fuelList}
          sel={fuels}
          set={setFuels}
          counts={count((p) => p.fuel || [])}
        />
      )}
      {cat === "car" && (
        <Group
          title="Transmission"
          items={transList}
          sel={trans}
          set={setTrans}
          counts={count((p) => (p.trans || "").split(" / "))}
        />
      )}

      {hi > 0 && (
        <fieldset className="fgroup">
          <legend>Price</legend>
          <div className="range">
            <input
              type="range"
              aria-label="Maximum price"
              min={cat === "white-goods" ? 1000 : 1}
              max={hi}
              step={cat === "white-goods" ? 500 : 0.5}
              value={lim}
              className={`range-pct-${Math.min(100, Math.max(0, Math.round((((lim - (cat === "white-goods" ? 1000 : 1)) / Math.max(hi - (cat === "white-goods" ? 1000 : 1), 1)) * 100) / 5) * 5))}`}
              onChange={(e) => setPmax(+e.target.value)}
            />
            <div className="range-l">
              <span>{money(cat === "white-goods" ? 1000 : 1)}</span>
              <strong>Up to {money(lim)}</strong>
            </div>
          </div>
        </fieldset>
      )}

      {/* COMPANY / BRAND FILTER (LAST IN FILTERS SIDEBAR) */}
      <Group
        title={
          single
            ? cat === "car"
              ? "Car Company"
              : cat === "bike"
                ? "Bike Company"
                : "Appliance Brand"
            : "Company / Brand"
        }
        items={brandList}
        sel={brands}
        set={setBrands}
        counts={brandCounts}
      />

      {/* <fieldset className="fgroup">
        <legend>Customer rating</legend>
        {RATINGS.map((r) => (
          <label key={r} className="rad">
            <input type="radio" name={`rt-${embedded ? "e" : "p"}`} checked={minRating === r} onChange={() => setMinRating(minRating === r ? 0 : r)} onClick={() => minRating === r && setMinRating(0)} />
            <span className="dot" /><span className="lbl stars">{r}<Star size={13} fill="currentColor" aria-hidden /> & up</span>
          </label>
        ))}
      </fieldset> */}
      <button
        className="btn wide apply-drawer"
        onClick={() => setDrawer(false)}
      >
        Show {list.length} products
      </button>
    </aside>
  );

  return (
    <div className={`catalog ${embedded ? "embedded" : ""}`}>
      {/* category tabs */}
      <div className="ctabs" role="tablist" aria-label="Product category">
        {CATS.filter(([k]) => allowAll || k !== "all").map(([k, l, Icon]) => (
          <button
            key={k}
            role="tab"
            aria-selected={cat === k}
            className={cat === k ? "on" : ""}
            onClick={() => onCat?.(k)}
          >
            {Icon && <Icon size={17} aria-hidden />}
            {l}
          </button>
        ))}
      </div>

      <div className="layout">
        {drawer && <div className="scrim" onClick={() => setDrawer(false)} />}
        {sidebar}

        <section
          className="results"
          aria-labelledby={`rt-h-${embedded ? "e" : "p"}`}
        >
          {/* brand tabs */}
          {brandTabs.length > 1 && (
            <div className="btabs" role="tablist" aria-label="Brand">
              <button
                role="tab"
                aria-selected={!brands.length}
                className={!brands.length ? "on" : ""}
                onClick={() => setBrands([])}
              >
                All <em>{brandAllCount}</em>
              </button>
              {brandTabs.map((b) => (
                <button
                  key={b}
                  role="tab"
                  aria-selected={brands.includes(b)}
                  className={brands.includes(b) ? "on" : ""}
                  onClick={() => toggle(setBrands, b)}
                >
                  {b} <em>{brandCounts[b] ?? 0}</em>
                </button>
              ))}
            </div>
          )}

          <div className="bar">
            <div>
              <h2 id={`rt-h-${embedded ? "e" : "p"}`}>
                {title || CAT_PLURAL[cat]}
              </h2>
              <p className="muted" aria-live="polite">
                {!isLoading && !isError && `${list.length} product${list.length === 1 ? "" : "s"}`}
                {cmp.length > 0 && (
                  <>
                    {" "}
                    · <Link to="/compare">Compare {cmp.length} selected</Link>
                  </>
                )}
              </p>
            </div>
            <div className="bar-r">
              <button
                className="btn out filter-btn"
                aria-expanded={drawer}
                onClick={() => setDrawer(true)}
              >
                <SlidersHorizontal size={16} aria-hidden /> Filters
                {chips.length > 0 && <b className="cnt">{chips.length}</b>}
              </button>
              <label className="sort">
                <span>Sort by</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  {SORTS.map(([k, l]) => (
                    <option key={k} value={k}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <div className="vt" role="group" aria-label="View">
                <button
                  aria-pressed={view === "grid"}
                  aria-label="Grid view"
                  onClick={() => setView("grid")}
                >
                  <LayoutGrid size={17} />
                </button>
                <button
                  aria-pressed={view === "list"}
                  aria-label="List view"
                  onClick={() => setView("list")}
                >
                  <Rows3 size={17} />
                </button>
              </div>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="chips" aria-label="Active filters">
              {chips.map(([l, rm]) => (
                <button
                  key={l}
                  className="fchip"
                  onClick={rm}
                  aria-label={`Remove filter ${l}`}
                >
                  {l}
                  <X size={13} aria-hidden />
                </button>
              ))}
              <button className="link" onClick={reset}>
                Clear all
              </button>
            </div>
          )}

          {isError ? (
            <UnavailableState
              title="Products not available"
              text="We could not load products from the server right now. Please try again."
              onRetry={refetch}
            />
          ) : isLoading ? (
            <Loader label="Loading products" onRetry={refetch} />
          ) : isEmpty ? (
            <UnavailableState
              title="No products available"
              text="No products have been published yet. Please check back later."
              onRetry={refetch}
            />
          ) : !list.length ? (
            <EmptyState
              title="No products found"
              text="Try changing the filters or search with different words."
              action={
                chips.length > 0 ? (
                  <button className="btn" onClick={reset}>
                    Clear filters
                  </button>
                ) : null
              }
            />
          ) : (
            <div className={view === "list" ? "plist" : "pgrid"}>
              {list.map((p) => (
                <ProductCard key={p.id} p={p} list={view === "list"} />
              ))}
            </div>
          )}

          {related.length > 0 && (
            <div className="related">
              <h3>You might also like</h3>
              <div className="pgrid">
                {related.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
