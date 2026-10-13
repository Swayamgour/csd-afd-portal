import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Catalog from "../components/Catalog.jsx";
import { CAT_PLURAL } from "../data/utils.js";

const hero = {
  car: ["Cars", "Concessional prices on India's most-loved cars."],
  bike: ["Bikes", "Commuters, cruisers and sports bikes for every rider."],
  "white-goods": ["Home appliances", "Refrigerators, washing machines, TVs and more."],
};

export default function Products() {
  const [sp, setSp] = useSearchParams();
  const cat = ["car", "bike", "white-goods"].includes(sp.get("cat")) ? sp.get("cat") : "car";
  const onlyWish = sp.get("wish") === "1";
  useEffect(() => { document.title = `${onlyWish ? "Wishlist" : CAT_PLURAL[cat]} - CSD AFD Online`; }, [cat, onlyWish]);
  const [h, sub] = hero[cat];
  return (
    <div className="wrap">
      <nav className="bc" aria-label="Breadcrumb"><ol><li><Link to="/">Home</Link></li><li><span aria-current="page">{onlyWish ? "Wishlist" : h}</span></li></ol></nav>
      {!onlyWish && (
        <div className={`phead ${cat}`}>
          <div><h1>{h} through CSD AFD</h1><p>{sub}</p></div>
        </div>
      )}
      {onlyWish && <h1 className="ptitle">My wishlist</h1>}
      <Catalog cat={onlyWish ? "all" : cat} allowAll={onlyWish} onlyWish={onlyWish}
        onCat={(c) => setSp({ cat: c })} title={onlyWish ? "Saved products" : h} />
    </div>
  );
}
