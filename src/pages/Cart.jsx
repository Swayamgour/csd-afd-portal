import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/Store.jsx';
import { EmptyState, Loader, UnavailableState } from '../components/States.jsx';
import { priceText } from '../data/utils.js';
import { useStoreProducts } from '../hooks/useStoreProducts.js';

export default function Cart() {
  const { cart, removeCart } = useStore();
  const { products, isLoading, isError, refetch } = useStoreProducts();

  const items = cart
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);

  if (!cart.length) {
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

  if (isLoading) {
    return (
      <div className="wrap">
        <Loader label="Loading cart items" onRetry={refetch} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="wrap">
        <UnavailableState
          title="Cart items not available"
          text="We could not load your cart items from the server. Please try again."
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="wrap">
        <UnavailableState
          title="Items not available"
          text="The products in your cart are no longer available."
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="wrap">
      <h1>Cart</h1>
      <ul className="panel list">
        {items.map((p) => (
          <li key={p.id} className="between">
            <span>
              <strong>{p.name}</strong>
              <br />
              {priceText(p)}
            </span>
            <button className="btn sm ghost" onClick={() => removeCart(p.id)}>
              Remove {p.name}
            </button>
          </li>
        ))}
      </ul>
      <p className="muted">Checkout is connected to official AFD supply order workflow.</p>
    </div>
  );
}
