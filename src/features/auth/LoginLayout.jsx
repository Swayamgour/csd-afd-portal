import React from 'react';
import { ShieldCheck, Award, Lock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LoginLayout({ title, subtitle, children }) {
  return (
    <div className="enterprise-auth-page">
      <div className="auth-brand-strip between">
        <div className="row align-center gap-1">
          <ShieldCheck size={20} className="text-saffron" />
          <span className="small font-bold text-white">
            CANTEEN STORES DEPARTMENT (AFD) · GOVT. OF INDIA
          </span>
        </div>
        <Link to="/" className="small row align-center gap-1 text-white">
          <span>Back to Public Storefront</span>
          <ExternalLink size={14} />
        </Link>
      </div>

      <div className="auth-container-grid">
        {/* Left Information Panel */}
        <div className="auth-hero-panel">
          <div className="auth-hero-content">
            <span className="eyebrow light">Official Defence Procurement Portal</span>
            <h1 className="auth-hero-title">Serving Those Who Serve the Nation.</h1>
            <p className="auth-hero-desc">
              Unified Role-Based Authenticated Portal for Beneficiaries, CSD Head Office, Regional Depots, Unit Run Canteens (URCs), OEMs, Authorized Dealers, and Service Desk.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature-item row align-center gap-1">
                <Award size={18} className="text-saffron" />
                <span className="small">Subsidized AFD-I and AFD-II Defence Quota Entitlements</span>
              </div>
              <div className="auth-feature-item row align-center gap-1">
                <Lock size={18} className="text-saffron" />
                <span className="small">256-Bit Encrypted Secure Multi-Factor Authentication</span>
              </div>
              <div className="auth-feature-item row align-center gap-1">
                <ShieldCheck size={18} className="text-saffron" />
                <span className="small">End-to-End Online Demand, Sanction & Delivery Tracking</span>
              </div>
            </div>

            <div className="auth-helpline-box mt-3 panel">
              <p className="micro muted text-uppercase mb-1 font-bold">Toll-Free National Helpline</p>
              <p className="small font-bold mb-0">1800-180-5555 · afd.helpdesk@csdindia.gov.in</p>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="auth-form-panel">
          <div className="panel auth-form-card shadow-lg">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
