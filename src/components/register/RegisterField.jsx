import React from "react";

export function Field({ id, label, req, hint, err, children }) {
  return (
    <div className="fgrp">
      <label htmlFor={id}>
        {label}
        {req && (
          <span className="req-star" aria-hidden>
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {hint && <p className="small hint">{hint}</p>}
      <p className="err" role={err ? "alert" : undefined}>
        {err && `⚠ ${err}`}
      </p>
    </div>
  );
}

export function Section({ n, title, children }) {
  return (
    <section className="rsec">
      <h2>
        <span>{n}</span> {title}
      </h2>
      {children}
    </section>
  );
}
