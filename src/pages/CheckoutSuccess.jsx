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

  const [demand, setDemand] = useState(() => {
    if (location.state?.demand) return location.state.demand;
    try {
      const saved = sessionStorage.getItem('csd_last_created_demand');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return {
      id: '#30-76510',
      productName: 'MARUTI VITARA BREZZA VXI 1.5L 5MT (BS-VI)',
      sku: '64224-53',
      color: 'GRANITE GREY',
      totalAmount: 721826,
      csdPrice: 721826,
      dealer: 'AAA VEHICLEADES PVT. LTD. MUNDKA (PILLAR)',
      dealerName: 'AAA VEHICLEADES PVT. LTD. MUNDKA (PILLAR)',
      depot: 'DELHI',
      urc: '7 WING AF',
      paymentMethod: 'Direct bank transfer',
      status: 'On hold'
    };
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const cleanDemandId = demand.id?.replace('#', '') || '30-76510';
  const displayAmount = demand.totalAmount || demand.csdPrice || 721826;
  const isDirectTransfer = demand.paymentMethod?.toLowerCase().includes('bank') || demand.paymentMethod?.toLowerCase().includes('direct');

  return (
    <div className="checkout-success-container">
      {/* Top Success Banner */}
      <div className="success-top-card">
        <div className="success-icon-badge">
          <CheckCircle2 size={46} strokeWidth={2.3} />
        </div>

        <span className="success-tag-pill">
          Official CSD Demand Generated
        </span>

        <h1 className="success-title">
          Demand Submitted Successfully
        </h1>

        <p className="success-description">
          Your demand has been lodged in the CSD AFD procurement system. A confirmation SMS & email have been dispatched to your registered credentials.
        </p>

        {/* Highlighted Demand Number Box */}
        <div className="success-demand-box">
          <span className="success-demand-box-label">
            Official Demand Number
          </span>
          <span className="success-demand-box-value">
            {demand.id}
          </span>
        </div>

        {/* Direct Bank Transfer Notice if applicable */}
        {isDirectTransfer && (
          <div className="csd-alert-banner warning alert-banner-max-w">
            <AlertTriangle size={20} className="alert-banner-icon" />
            <div>
              <strong>Action Required: Bank Payment Upload</strong>
              <br />
              Since you selected <strong>Direct Bank Transfer</strong>, your demand status is currently <strong>On hold</strong>. Please deposit the net amount into the Canteen Stores Department Public Fund account and upload the payment receipt under the <strong>Demands</strong> tab to proceed to depot sanction.
            </div>
          </div>
        )}
      </div>

      {/* Demand Summary Card (Section 15 Requirements) */}
      <div className="success-card">
        <div className="checkout-card-header">
          <h2 className="success-card-title success-title-clean">
            <FileText size={18} color="var(--brand)" />
            <span>Demand Particulars</span>
          </h2>
          <span className={`checkout-spec-pill ${demand.status === 'Processing' ? 'status-processing' : 'status-onhold'}`}>
            Status: {demand.status || (isDirectTransfer ? 'On hold' : 'Processing')}
          </span>
        </div>

        <div className="beneficiary-read-only-grid">
          <div className="beneficiary-field-box">
            <div className="beneficiary-field-label">
              Product / Vehicle
            </div>
            <div className="beneficiary-field-value">
              {demand.productName}
            </div>
            {demand.sku && (
              <div className="csd-form-helper-text">
                SKU: <strong>{demand.sku}</strong>
                {demand.color && ` • Color: ${demand.color}`}
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
              Inclusive of 14% Addl Cost, 17% Cess & 0.5% Incidental
            </div>
          </div>

          <div className="beneficiary-field-box">
            <div className="beneficiary-field-label">
              Allocated Dealer
            </div>
            <div className="beneficiary-field-value flex-align-center-gap-xs">
              <Building size={15} color="var(--color-slate-400)" />
              <span>{demand.dealer || demand.dealerName || 'AAA VEHICLEADES PVT. LTD. MUNDKA (PILLAR)'}</span>
            </div>
          </div>

          <div className="beneficiary-field-box">
            <div className="beneficiary-field-label">
              Regional Depot & URC
            </div>
            <div className="beneficiary-field-value flex-align-center-gap-xs">
              <Store size={15} color="var(--color-slate-400)" />
              <span>Depot: {demand.depot || 'DELHI'} • URC: {demand.urc || '7 WING AF'}</span>
            </div>
          </div>

          <div className="beneficiary-field-box">
            <div className="beneficiary-field-label">
              Payment Method
            </div>
            <div className="beneficiary-field-value flex-align-center-gap-xs">
              <CreditCard size={15} color="var(--color-slate-400)" />
              <span>{demand.paymentMethod || 'Direct Bank Transfer'}</span>
            </div>
          </div>

          <div className="beneficiary-field-box">
            <div className="beneficiary-field-label">
              Submission Date
            </div>
            <div className="beneficiary-field-value">
              {demand.displayDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons matching Section 15 */}
      <div className="success-actions-row">
        <Link
          to={`/demands/${encodeURIComponent(demand.id)}`}
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
