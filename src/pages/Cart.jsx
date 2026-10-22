import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/Store.jsx';
import { EmptyState } from '../components/States.jsx';
import { priceText } from '../data/utils.js';
import { useGetProductsQuery } from '../features/catalog/productApi.js';

export default function Cart() {
  const { cart, removeCart } = useStore();
  const { data: productsData, isLoading } = useGetProductsQuery({ limit: 100 });
  const allProducts = productsData?.items || (Array.isArray(productsData) ? productsData : []);

  const items = cart
    .map((id) => allProducts.find((p) => (p._id || p.id) === id))
    .filter(Boolean);

  if (isLoading) {
    return (
      <div className="wrap">
        <p className="muted">Loading cart items from catalog...</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="wrap">
        <EmptyState
          title="Your cart is empty"
          text="Add products to see them here."
          action={<Link className="btn" to="/products">Browse products</Link>}
        />
      </div>
    );
  }

  return (
    <div className="wrap">
      <h1>Cart</h1>
      <ul className="panel list">
        {items.map((p) => {
          const pId = p._id || p.id;
          return (
            <li key={pId} className="between">
              <span>
                <strong>{p.name}</strong>
                <br />
                {priceText(p)}
              </span>
              <button className="btn sm ghost" onClick={() => removeCart(pId)}>
                Remove {p.name}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="muted">Checkout is connected to official AFD supply order workflow.</p>
    </div>
  );
}
