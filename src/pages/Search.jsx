import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Catalog from "../components/Catalog.jsx";

export default function Search() {
  const [sp] = useSearchParams();
  const q = (sp.get("q") || "").trim();
  const [cat, setCat] = useState("all");
  useEffect(() => { setCat("all"); document.title = `${q || "Search"} - Search results - CSD AFD Online`; }, [q]);
  return (
    <div className="wrap">
      <nav className="bc" aria-label="Breadcrumb"><ol><li><Link to="/">Home</Link></li><li><span aria-current="page">Search</span></li></ol></nav>
      <div className="shead">
        <p className="eyebrow">Search results</p>
        <h1>{q ? <>Results for “<span>{q}</span>”</> : "Search products"}</h1>
      </div>
      <Catalog cat={cat} onCat={setCat} q={q} allowAll title={q ? `Matching “${q}”` : "All products"} />
    </div>
  );
}
