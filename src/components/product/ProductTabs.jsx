import React from 'react';
import { Palette, Check } from 'lucide-react';

export function ProductTabs({
  tab,
  setTab,
  tabs,
  p,
  about,
  highlights,
  getColorClass,
  specGroups,
  val,
}) {
  return (
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
          <h2>About {p?.name}</h2>
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
          {p?.colors?.length > 0 && (
            <>
              <h3>
                <Palette size={16} aria-hidden /> Available colours
              </h3>
              <ul className="colors">
                {p.colors.map((c2) => (
                  <li key={c2}>
                    <i className={`swatch-dot ${getColorClass ? getColorClass(c2) : ''}`} />
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
                    <dd>{(val ? val(v) : v) || "—"}</dd>
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

      {tab === "features" && p?.featureGroups?.length > 0 && (
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
  );
}

export default ProductTabs;
