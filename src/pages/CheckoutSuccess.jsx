import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  FileText,
  Building,
  Store,
  MapPin,
  CreditCard,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Download,
  Printer
} from 'lucide-react';

export default function CheckoutSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const [demand] = useState(() => {
    if (location.state?.demand) return location.state.demand;
    try {
      const saved = sessionStorage.getItem('csd_last_created_demand');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore parse error
    }
    return null;
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!demand) {
    return (
      <div className="checkout-success-container text-center py-5">
        <div className="success-card p-5">
          <h2>No Demand Found</h2>
          <p className="muted mb-4">No recent demand record found in session. Please check your Demands dashboard.</p>
          <div className="row justify-center gap-2">
            <Link to="/demands" className="btn-primary-action">
              <FileText size={16} /> Go to My Demands
            </Link>
            <Link to="/products" className="btn-secondary-action">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const cleanDemandId = demand.demandNo || demand.id || demand._id;
  const displayAmount = demand.totalAmount || demand.totalPrice || demand.csdPrice || 0;
  const isDirectTransfer = (demand.paymentMethod || '').toLowerCase().includes('bank') || (demand.paymentMethod || '').toLowerCase().includes('direct');

  return (
    <div className="checkout-success-container">
      {/* Top Success Banner */}
      <div className="success-top-card">
        <div className="success-icon-badge">
          <CheckCircle2 size={46} strokeWidth={2.3} />
        </div>

        <span className="success-tag-pill">
          Demand Lodged • Pending Depot Approval
        </span>

        <h1 className="success-title">
          Demand Submitted for Depot Approval
        </h1>

        <p className="success-description">
          Your demand has been lodged in the CSD AFD procurement system without upfront payment. It has been routed to your Sanctioning CSD Depot for document scrutiny.
        </p>

        {/* Highlighted Demand Number Box */}
        <div className="success-demand-box">
          <span className="success-demand-box-label">
            Official Demand Number
          </span>
          <span className="success-demand-box-value">
            {cleanDemandId}
          </span>
        </div>

        {/* Post-Approval Lifecycle Notice */}
        <div className="csd-alert-banner info alert-banner-max-w" style={{ textAlign: 'left', marginTop: '1.25rem' }}>
          <ShieldCheck size={22} className="alert-banner-icon" color="#1e4fd8" />
          <div>
            <strong style={{ fontSize: '0.95rem' }}>Next Steps: Depot Approval & Payment Activation</strong>
            <p className="mb-0 text-xs" style={{ marginTop: '0.35rem', lineHeight: 1.6, color: '#334155' }}>
              1. <strong>Depot Review:</strong> Depot Officials will verify your availability certificate, rank entitlement, and canteen card.<br />
              2. <strong>Payment Link Activation:</strong> As soon as the Depot approves, a <strong>"Pay Now / Submit Bank Transfer (UTR)"</strong> button will be enabled on your demand page.<br />
              3. <strong>Payment Verification & Supply Order:</strong> Upon receiving your payment/UTR, the Depot will verify the transaction and issue your Local Supply Order to the URC.
            </p>
          </div>
        </div>
      </div>

      {/* Demand Summary Card (Section 15 Requirements) */}
      <div className="success-card">
        <div className="checkout-card-header">
          <h2 className="success-card-title success-title-clean">
            <FileText size={18} color="var(--brand)" />
            <span>Demand Particulars</span>
          </h2>
          <span className="checkout-spec-pill" style={{ background: '#eff6ff', color: '#1e40af', fontWeight: 600 }}>
            Status: {demand.status || 'CREATED'} (Pending Depot Approval)
          </span>
        </div>

        <div className="beneficiary-read-only-grid">
          <div className="beneficiary-field-box">
            <div className="beneficiary-field-label">
              Product / Vehicle
            </div>
            <div className="beneficiary-field-value">
              {demand.productName || demand.productSnapshot?.name}
            </div>
            {(demand.sku || demand.productSnapshot?.sku) && (
              <div className="csd-form-helper-text">
                SKU: <strong>{demand.sku || demand.productSnapshot?.sku}</strong>
                {(demand.color || demand.selectedColor) && ` • Color: ${demand.color || demand.selectedColor}`}
              </div>
            )}
          </div>

          <div className="beneficiary-field-box">
            <div className="beneficiary-field-label">
              Net Amount Payable
            </div>
            <div className="beneficiary-field-value text-success-val">
              ₹ {displayAmount?.toLocaleString('en-IN')}
            </div>
            <div className="csd-form-helper-text">
              Authoritative Net CSD Concessional Amount
            </div>
          </div>

          <div className="beneficiary-field-box">
            <div className="beneficiary-field-label">
              Allocated Dealer
            </div>
            <div className="beneficiary-field-value flex-align-center-gap-xs">
              <Building size={15} color="var(--color-slate-400)" />
              <span>{demand.dealerName || demand.dealer?.name || demand.dealer || 'Authorized Dealer'}</span>
            </div>
          </div>

          <div className="beneficiary-field-box">
            <div className="beneficiary-field-label">
              Regional Depot & URC
            </div>
            <div className="beneficiary-field-value flex-align-center-gap-xs">
              <Store size={15} color="var(--color-slate-400)" />
              <span>Depot: {demand.depotName || demand.depot?.name || demand.depot || 'Authorized Depot'} • URC: {demand.urcName || demand.urc?.name || demand.urc || 'Authorized URC'}</span>
            </div>
          </div>

          <div className="beneficiary-field-box">
            <div className="beneficiary-field-label">
              Payment Method
            </div>
            <div className="beneficiary-field-value flex-align-center-gap-xs">
              <CreditCard size={15} color="var(--color-slate-400)" />
              <span>{demand.paymentMethod || (isDirectTransfer ? 'Direct Bank Transfer' : 'Online Payment')}</span>
            </div>
          </div>

          <div className="beneficiary-field-box">
            <div className="beneficiary-field-label">
              Submission Date
            </div>
            <div className="beneficiary-field-value">
              {demand.createdAt ? new Date(demand.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons matching Section 15 */}
      <div className="success-actions-row">
        <Link
          to={`/demands/${encodeURIComponent(cleanDemandId)}`}
          className="btn-primary-action"
        >
          <span>View Demand</span>
          <ArrowRight size={18} />
        </Link>

        <Link
          to="/demands"
          className="btn-secondary-action"
        >
          <FileText size={18} color="#64748b" />
          <span>Go to My Demands</span>
        </Link>

        <Link
          to="/products"
          className="btn-secondary-action"
        >
          <ShoppingBag size={18} />
          <span>Continue Shopping</span>
        </Link>
      </div>
    </div>
  );
}
