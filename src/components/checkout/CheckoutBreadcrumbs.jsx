import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, CheckCircle2 } from 'lucide-react';

export function CheckoutBreadcrumbs() {
  const steps = [
    { step: 1, label: 'Product Selection', state: 'completed' },
    { step: 2, label: 'Eligibility Verified', state: 'completed' },
    { step: 3, label: 'Demand Lodgement', state: 'current' },
    { step: 4, label: 'Depot Approval', state: 'upcoming' },
    { step: 5, label: 'Payment & Supply Order', state: 'upcoming' },
  ];

  return (
    <>
      <nav aria-label="Breadcrumb" className="checkout-breadcrumb-nav">
        <ol className="checkout-breadcrumb-list">
          <li><Link to="/" className="checkout-breadcrumb-link">Home</Link></li>
          <li><ChevronRight size={13} /></li>
          <li><Link to="/products" className="checkout-breadcrumb-link">Products</Link></li>
          <li><ChevronRight size={13} /></li>
          <li><span aria-current="page" className="checkout-breadcrumb-active">Checkout</span></li>
        </ol>
      </nav>

      <div className="checkout-progress-card">
        <div className="checkout-progress-row">
          {steps.map((s, idx) => (
            <div key={s.step} className="checkout-step-item">
              <div className={`checkout-step-badge ${s.state}`}>
                {s.state === 'completed' ? <CheckCircle2 size={16} /> : s.step}
              </div>
              <span className={`checkout-step-label ${s.state}`}>
                {s.label}
              </span>
              {idx < 4 && <ChevronRight size={14} color="#cbd5e1" />}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default CheckoutBreadcrumbs;
